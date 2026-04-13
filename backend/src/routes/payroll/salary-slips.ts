import express from 'express';
import prisma from '../../lib/prismaClient';
import { logActivity } from '../../services/activityLogger';

const router = express.Router();

// GET /calculate — Fetch employee data for calculation
router.get('/calculate/:user_id', async (req, res) => {
    try {
        const { user_id } = req.params;
        const { month, year } = req.query;

        if (!month || !year) {
            return res.status(400).json({ error: "Month and Year are required" });
        }

        // Check for approved Salary Hold Requests
        const holdRequest = await prisma.salaryHoldRequest.findFirst({
            where: {
                employee_id: parseInt(user_id),
                month: parseInt(month as string),
                year: parseInt(year as string),
                status: 'Approved'
            }
        });

        if (holdRequest) {
            return res.status(400).json({ 
                error: "SALARY ON HOLD: An approved hold request exists for this period.",
                reason: holdRequest.reason
            });
        }

        const employee = await prisma.user.findUnique({
            where: { id: parseInt(user_id) },
            include: {
                branch: true,
                department: true,
                employeeCTCs: {
                    where: { status: 'Current' },
                    include: {
                        salaryGroup: {
                            include: {
                                components: {
                                    include: { earningDeductionType: true }
                                }
                            }
                        }
                    }
                },
                attendanceRecords: {
                    where: {
                        date: {
                            gte: new Date(parseInt(year as string), parseInt(month as string) - 1, 1),
                            lte: new Date(parseInt(year as string), parseInt(month as string), 0)
                        }
                    }
                },
                otherEarningsDeductions: {
                    where: {
                        month: parseInt(month as string),
                        year: parseInt(year as string),
                        status: 'Active'
                    }
                },
                incentiveDetails: {
                    where: {
                        month: parseInt(month as string),
                        year: parseInt(year as string),
                        status: 'Approved'
                    }
                }
            }
        });

        if (!employee) return res.status(404).json({ error: "Employee not found" });
        
        const currentCTC = employee.employeeCTCs[0];
        if (!currentCTC) return res.status(400).json({ error: "No active CTC found for employee" });

        // Logic for fetching advances, loans, and penalties would go here
        // For now, returning base data
        res.json({
            employee,
            currentCTC,
            earnings: currentCTC.salaryGroup.components.filter(c => c.earningDeductionType.type === 'Earning'),
            deductions: currentCTC.salaryGroup.components.filter(c => c.earningDeductionType.type === 'Deduction'),
            attendance: {
                present: employee.attendanceRecords.filter(r => r.status === 'Present').length,
                absent: employee.attendanceRecords.filter(r => r.status === 'Absent').length,
                leave: employee.attendanceRecords.filter(r => r.status === 'Leave').length,
            },
            otherEarnings: employee.otherEarningsDeductions.filter(e => e.type === 'Earning'),
            otherDeductions: employee.otherEarningsDeductions.filter(e => e.type === 'Deduction'),
            incentives: employee.incentiveDetails
        });
    } catch (error) {
        console.error("Error fetching calculation data:", error);
        res.status(500).json({ error: "Failed to fetch calculation data" });
    }
});

// POST /generate — Generate single salary slip
router.post('/generate', async (req, res) => {
    try {
        const {
            user_id, employee_ctc_id, month, year, salary_type,
            month_working_days, employee_working_days, paid_leaves, unpaid_leaves,
            total_leaves, paid_holidays, paid_week_offs, extra_days,
            joining_net_salary, joining_gross_salary, this_month_gross,
            per_day_salary, per_day_extra, total_earnings, total_deductions,
            net_salary, salary_mode, status, description, items
        } = req.body;

        const result = await prisma.$transaction(async (tx) => {
            // Check if slip already exists
            const existing = await tx.salarySlip.findUnique({
                where: { user_id_month_year: { user_id, month, year } }
            });

            if (existing) {
                if (existing.status === 'Published') {
                    throw new Error("Salary slip already published for this month");
                }
                // Delete existing and recreate if not published
                await tx.salarySlipItem.deleteMany({ where: { salary_slip_id: existing.id } });
                await tx.salarySlip.delete({ where: { id: existing.id } });
            }

            const slip = await tx.salarySlip.create({
                data: {
                    user_id, employee_ctc_id, month, year, salary_type,
                    month_working_days, employee_working_days, paid_leaves, unpaid_leaves,
                    total_leaves, paid_holidays, paid_week_offs, extra_days,
                    joining_net_salary, joining_gross_salary, this_month_gross,
                    per_day_salary, per_day_extra, total_earnings, total_deductions,
                    net_salary, salary_mode, status: status || 'Generated', description
                }
            });

            if (items && Array.isArray(items)) {
                await tx.salarySlipItem.createMany({
                    data: items.map((item: any) => ({
                        salary_slip_id: slip.id,
                        name: item.name,
                        amount: item.amount,
                        type: item.type,
                        category: item.category || 'CTC'
                    }))
                });
            }

            return slip;
        });

        await logActivity(null, 'GENERATED', 'SALARY_SLIP', `User ID: ${user_id}, ${month}/${year}`);
        res.status(201).json(result);
    } catch (error: any) {
        console.error("Error generating salary slip:", error);
        res.status(500).json({ error: error.message || "Failed to generate salary slip" });
    }
});

// GET /list — List salary slips with filters
router.get('/list', async (req, res) => {
    try {
        const { branch_id, department_id, month, year, status } = req.query;

        const where: any = {};
        if (month) where.month = parseInt(month as string);
        if (year) where.year = parseInt(year as string);
        if (status) where.status = status as string;
        
        if (branch_id || department_id) {
            where.user = {};
            if (branch_id) where.user.branch_id = parseInt(branch_id as string);
            if (department_id) where.user.department_id = parseInt(department_id as string);
        }

        const slips = await prisma.salarySlip.findMany({
            where,
            include: {
                user: {
                    select: {
                        name: true,
                        branch: { select: { name: true } },
                        department: { select: { name: true } }
                    }
                },
                employeeCtc: {
                    select: { gross_salary: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json(slips);
    } catch (error) {
        console.error("Error listing salary slips:", error);
        res.status(500).json({ error: "Failed to list salary slips" });
    }
});

// POST /bulk-generate — Bulk generate salary slips
router.post('/bulk-generate', async (req, res) => {
    try {
        const { user_ids, month, year, status } = req.body;

        if (!user_ids || !Array.isArray(user_ids) || !month || !year) {
            return res.status(400).json({ error: "Required fields missing" });
        }

        const log = await prisma.salaryGenerationLog.create({
            data: {
                processed_by: 1, // System or current admin
                month: parseInt(month),
                year: parseInt(year),
                action_type: 'Bulk',
                status: 'In Progress',
                details: { info: `Generating for ${user_ids.length} employees` }
            }
        });

        const results = [];
        for (const userId of user_ids) {
            try {
                const hold = await prisma.salaryHoldRequest.findFirst({
                    where: {
                        employee_id: parseInt(userId),
                        month: parseInt(month as string),
                        year: parseInt(year as string),
                        status: 'Approved'
                    }
                });

                if (hold) {
                    results.push({ userId, status: 'Skipped', reason: 'Salary on Hold' });
                    continue;
                }

                const employee = await prisma.user.findUnique({
                    where: { id: parseInt(userId) },
                    include: {
                        employeeCTCs: {
                            where: { status: 'Current' },
                            include: {
                                salaryGroup: {
                                    include: {
                                        components: {
                                            include: { earningDeductionType: true }
                                        }
                                    }
                                }
                            }
                        },
                        attendanceRecords: {
                            where: {
                                date: {
                                    gte: new Date(parseInt(year as string), parseInt(month as string) - 1, 1),
                                    lte: new Date(parseInt(year as string), parseInt(month as string), 0)
                                }
                            }
                        }
                    }
                });

                if (!employee || !employee.employeeCTCs[0]) continue;

                const ctc = employee.employeeCTCs[0];
                const daysInMonth = new Date(parseInt(year), parseInt(month), 0).getDate();
                const presentDays = employee.attendanceRecords.filter(r => r.status === 'Present').length;
                const leaveDays = employee.attendanceRecords.filter(r => r.status === 'Leave').length;
                const workingDays = presentDays + leaveDays;

                const perDaySalary = ctc.gross_salary / daysInMonth;
                const thisMonthGross = workingDays * perDaySalary;
                
                const earnings = ctc.salaryGroup.components.filter(c => c.earningDeductionType.type === 'Earning');
                const deductions = ctc.salaryGroup.components.filter(c => c.earningDeductionType.type === 'Deduction');
                
                const totalEarnings = thisMonthGross + (earnings.reduce((a, b) => a + b.amount, 0) - ctc.gross_salary > 0 ? earnings.reduce((a, b) => a + b.amount, 0) - ctc.gross_salary : 0);
                const totalDeductions = deductions.reduce((a, b) => a + b.amount, 0);

                await prisma.$transaction(async (tx) => {
                    const existing = await tx.salarySlip.findUnique({
                        where: { user_id_month_year: { user_id: parseInt(userId), month: parseInt(month), year: parseInt(year) } }
                    });

                    if (existing) {
                        if (existing.status === 'Published') return;
                        await tx.salarySlipItem.deleteMany({ where: { salary_slip_id: existing.id } });
                        await tx.salarySlip.delete({ where: { id: existing.id } });
                    }

                    const slip = await tx.salarySlip.create({
                        data: {
                            user_id: parseInt(userId),
                            employee_ctc_id: ctc.id,
                            month: parseInt(month),
                            year: parseInt(year),
                            salary_type: ctc.salary_type,
                            month_working_days: daysInMonth,
                            employee_working_days: workingDays,
                            paid_leaves: leaveDays,
                            total_leaves: leaveDays,
                            joining_net_salary: ctc.gross_salary * 0.9, // Simplified
                            joining_gross_salary: ctc.gross_salary,
                            this_month_gross: thisMonthGross,
                            per_day_salary: perDaySalary,
                            total_earnings: totalEarnings,
                            total_deductions: totalDeductions,
                            net_salary: totalEarnings - totalDeductions,
                            salary_mode: 'Bank Transfer',
                            status: status || 'Generated'
                        }
                    });

                    await tx.salarySlipItem.createMany({
                        data: [
                            ...earnings.map(e => ({ salary_slip_id: slip.id, name: e.earningDeductionType.name, amount: e.amount, type: 'Earning' })),
                            ...deductions.map(d => ({ salary_slip_id: slip.id, name: d.earningDeductionType.name, amount: d.amount, type: 'Deduction' }))
                        ]
                    });
                });
                results.push({ userId, status: 'Success' });
            } catch (err) {
                console.error(`Failed to generate for ${userId}:`, err);
                results.push({ userId, status: 'Failed' });
            }
        }

        await prisma.salaryGenerationLog.update({
            where: { id: log.id },
            data: { 
                status: 'Completed', 
                details: { summary: `Processed ${results.length} employees. Success: ${results.filter(r => r.status === 'Success').length}` }
            }
        });

        res.json({ message: "Bulk generation process completed", results });
    } catch (error) {
        console.error("Bulk generate error:", error);
        res.status(500).json({ error: "Bulk generation failed" });
    }
});

// PATCH /publish — Bulk publish slips
router.patch('/publish', async (req, res) => {
    try {
        const { ids } = req.body; // Array of IDs

        if (!ids || !Array.isArray(ids)) {
            return res.status(400).json({ error: "Invalid IDs provided" });
        }

        await prisma.salarySlip.updateMany({
            where: { id: { in: ids } },
            data: { status: 'Published' }
        });

        await logActivity(null, 'PUBLISHED', 'SALARY_SLIP', `Count: ${ids.length}`);
        res.json({ message: `${ids.length} salary slips published successfully` });
    } catch (error) {
        console.error("Error publishing salary slips:", error);
        res.status(500).json({ error: "Failed to publish salary slips" });
    }
});

// DELETE /bulk-delete — Bulk delete slips
router.post('/bulk-delete', async (req, res) => {
    try {
        const { ids } = req.body;
        if (!ids || !Array.isArray(ids)) return res.status(400).json({ error: "Invalid IDs" });

        const slips = await prisma.salarySlip.findMany({ where: { id: { in: ids } } });
        if (slips.some(s => s.status === 'Published')) {
            return res.status(403).json({ error: "Cannot delete published slips" });
        }

        await prisma.$transaction([
            prisma.salarySlipItem.deleteMany({ where: { salary_slip_id: { in: ids } } }),
            prisma.salarySlip.deleteMany({ where: { id: { in: ids } } })
        ]);

        await logActivity(null, 'BULK_DELETED', 'SALARY_SLIP', `Count: ${ids.length}`);
        res.json({ message: `${ids.length} slips deleted successfully` });
    } catch (error) {
        console.error("Bulk delete error:", error);
        res.status(500).json({ error: "Bulk delete failed" });
    }
});

// PATCH /:id/share — Toggle sharing status
router.patch('/:id/share', async (req, res) => {
    try {
        const { id } = req.params;
        const { is_shared } = req.body;
        
        const slip = await prisma.salarySlip.update({
            where: { id: parseInt(id) },
            data: { is_shared }
        });

        await logActivity(null, 'SHARED', 'SALARY_SLIP', `ID: ${id}, Shared: ${is_shared}`);
        res.json(slip);
    } catch (error) {
        console.error("Error toggling share:", error);
        res.status(500).json({ error: "Failed to toggle sharing" });
    }
});

// DELETE /:id — Delete a slip
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const slip = await prisma.salarySlip.findUnique({ where: { id: parseInt(id) } });

        if (!slip) return res.status(404).json({ error: "Salary slip not found" });
        if (slip.status === 'Published') {
            return res.status(403).json({ error: "Cannot delete a published salary slip" });
        }

        await prisma.salarySlip.delete({ where: { id: parseInt(id) } });
        await logActivity(null, 'DELETED', 'SALARY_SLIP', `ID: ${id}`);
        res.json({ message: "Salary slip deleted successfully" });
    } catch (error) {
        console.error("Error deleting salary slip:", error);
        res.status(500).json({ error: "Failed to delete salary slip" });
    }
});

// PATCH /bulk-share — Bulk update is_shared status
router.patch('/bulk-share', async (req, res) => {
    try {
        const { ids, is_shared } = req.body;
        if (!ids || !Array.isArray(ids)) return res.status(400).json({ error: "Invalid IDs" });

        await prisma.salarySlip.updateMany({
            where: { id: { in: ids } },
            data: { is_shared: !!is_shared }
        });

        await logActivity(null, 'BULK_SHARE_UPDATED', 'SALARY_SLIP', `Count: ${ids.length}, Status: ${is_shared}`);
        res.json({ message: `Successfully ${is_shared ? 'shared' : 'hidden'} ${ids.length} slips` });
    } catch (error) {
        console.error("Bulk share error:", error);
        res.status(500).json({ error: "Bulk share failed" });
    }
});

export default router;
