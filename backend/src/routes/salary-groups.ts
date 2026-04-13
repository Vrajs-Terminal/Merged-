import express from 'express';
import prisma from '../lib/prismaClient';
import { logActivity } from '../services/activityLogger';

const router = express.Router();

// GET / — List all salary groups
router.get('/', async (req, res) => {
    try {
        const groups = await prisma.salaryGroup.findMany({
            include: {
                components: {
                    include: {
                        earningDeductionType: {
                            select: { id: true, name: true, type: true }
                        }
                    }
                },
                _count: {
                    select: { components: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        const result = groups.map((g: any) => ({
            ...g,
            earningHeads: g.components
                .filter((c: any) => c.earningDeductionType.type === 'Earning')
                .map((c: any) => c.earningDeductionType.name),
            deductionHeads: g.components
                .filter((c: any) => c.earningDeductionType.type === 'Deduction')
                .map((c: any) => c.earningDeductionType.name),
            componentCount: g._count.components
        }));

        res.json(result);
    } catch (error) {
        console.error("Error fetching salary groups:", error);
        res.status(500).json({ error: "Failed to fetch salary groups" });
    }
});

// GET /:id — Get single salary group with full details
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const group = await prisma.salaryGroup.findUnique({
            where: { id: parseInt(id) },
            include: {
                components: {
                    include: {
                        earningDeductionType: true
                    }
                }
            }
        });

        if (!group) {
            return res.status(404).json({ error: "Salary group not found" });
        }

        res.json(group);
    } catch (error) {
        console.error("Error fetching salary group:", error);
        res.status(500).json({ error: "Failed to fetch salary group" });
    }
});

// POST / — Create new salary group with components
router.post('/', async (req, res) => {
    try {
        const {
            name, payroll_frequency, working_days_type, salary_calc_type,
            payout_formulas, slip_display_settings, common_settings,
            calculation_rules, incentive_settings, components
        } = req.body;

        if (!name) {
            return res.status(400).json({ error: "Salary Group Name is required" });
        }

        // Check for duplicate name
        const existing = await prisma.salaryGroup.findUnique({ where: { name } });
        if (existing) {
            return res.status(409).json({ error: `Salary group '${name}' already exists` });
        }

        const group = await prisma.$transaction(async (tx: any) => {
            const created = await tx.salaryGroup.create({
                data: {
                    name,
                    payroll_frequency: payroll_frequency || 'Monthly',
                    working_days_type: working_days_type || 'Calendar Days',
                    salary_calc_type: salary_calc_type || 'Per Day',
                    payout_formulas: payout_formulas || null,
                    slip_display_settings: slip_display_settings || null,
                    common_settings: common_settings || null,
                    calculation_rules: calculation_rules || null,
                    incentive_settings: incentive_settings || null
                }
            });

            // Create components
            if (components && Array.isArray(components) && components.length > 0) {
                await tx.salaryGroupComponent.createMany({
                    data: components.map((c: { earning_deduction_type_id: number; amount: number }) => ({
                        salary_group_id: created.id,
                        earning_deduction_type_id: c.earning_deduction_type_id,
                        amount: c.amount || 0
                    }))
                });
            }

            return await tx.salaryGroup.findUnique({
                where: { id: created.id },
                include: {
                    components: {
                        include: { earningDeductionType: true }
                    }
                }
            });
        });

        await logActivity(null, 'CREATED', 'SALARY_GROUP', name);
        res.status(201).json(group);
    } catch (error) {
        console.error("Error creating salary group:", error);
        res.status(500).json({ error: "Failed to create salary group" });
    }
});

// PUT /:id — Update salary group and components
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const {
            name, payroll_frequency, working_days_type, salary_calc_type,
            payout_formulas, slip_display_settings, common_settings,
            calculation_rules, incentive_settings, components
        } = req.body;

        if (!name) {
            return res.status(400).json({ error: "Salary Group Name is required" });
        }

        // Check for duplicate name (exclude self)
        const existing = await prisma.salaryGroup.findFirst({
            where: { name, NOT: { id: parseInt(id) } }
        });
        if (existing) {
            return res.status(409).json({ error: `Salary group '${name}' already exists` });
        }

        const group = await prisma.$transaction(async (tx: any) => {
            await tx.salaryGroup.update({
                where: { id: parseInt(id) },
                data: {
                    name,
                    payroll_frequency: payroll_frequency || 'Monthly',
                    working_days_type: working_days_type || 'Calendar Days',
                    salary_calc_type: salary_calc_type || 'Per Day',
                    payout_formulas: payout_formulas || null,
                    slip_display_settings: slip_display_settings || null,
                    common_settings: common_settings || null,
                    calculation_rules: calculation_rules || null,
                    incentive_settings: incentive_settings || null
                }
            });

            // Delete old components and re-create
            await tx.salaryGroupComponent.deleteMany({
                where: { salary_group_id: parseInt(id) }
            });

            if (components && Array.isArray(components) && components.length > 0) {
                await tx.salaryGroupComponent.createMany({
                    data: components.map((c: { earning_deduction_type_id: number; amount: number }) => ({
                        salary_group_id: parseInt(id),
                        earning_deduction_type_id: c.earning_deduction_type_id,
                        amount: c.amount || 0
                    }))
                });
            }

            return await tx.salaryGroup.findUnique({
                where: { id: parseInt(id) },
                include: {
                    components: {
                        include: { earningDeductionType: true }
                    }
                }
            });
        });

        await logActivity(null, 'UPDATED', 'SALARY_GROUP', name);
        res.json(group);
    } catch (error) {
        console.error("Error updating salary group:", error);
        res.status(500).json({ error: "Failed to update salary group" });
    }
});

// DELETE /:id — Delete salary group
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const group = await prisma.salaryGroup.delete({
            where: { id: parseInt(id) }
        });

        await logActivity(null, 'DELETED', 'SALARY_GROUP', group.name);
        res.json({ message: "Salary group deleted successfully" });
    } catch (error) {
        console.error("Error deleting salary group:", error);
        res.status(500).json({ error: "Failed to delete salary group" });
    }
});

// POST /:id/copy — Deep-copy a salary group
router.post('/:id/copy', async (req, res) => {
    try {
        const { id } = req.params;
        const original = await prisma.salaryGroup.findUnique({
            where: { id: parseInt(id) },
            include: { components: true }
        });

        if (!original) {
            return res.status(404).json({ error: "Salary group not found" });
        }

        // Generate unique name
        let copyName = `${original.name} (Copy)`;
        let counter = 1;
        while (await prisma.salaryGroup.findUnique({ where: { name: copyName } })) {
            counter++;
            copyName = `${original.name} (Copy ${counter})`;
        }

        const copied = await prisma.$transaction(async (tx: any) => {
            const newGroup = await tx.salaryGroup.create({
                data: {
                    name: copyName,
                    payroll_frequency: original.payroll_frequency,
                    working_days_type: original.working_days_type,
                    salary_calc_type: original.salary_calc_type,
                    payout_formulas: original.payout_formulas ?? undefined,
                    slip_display_settings: original.slip_display_settings ?? undefined,
                    common_settings: original.common_settings ?? undefined,
                    calculation_rules: original.calculation_rules ?? undefined,
                    incentive_settings: original.incentive_settings ?? undefined
                }
            });

            if (original.components.length > 0) {
                await tx.salaryGroupComponent.createMany({
                    data: original.components.map((c: any) => ({
                        salary_group_id: newGroup.id,
                        earning_deduction_type_id: c.earning_deduction_type_id,
                        amount: c.amount
                    }))
                });
            }

            return await tx.salaryGroup.findUnique({
                where: { id: newGroup.id },
                include: {
                    components: {
                        include: { earningDeductionType: true }
                    }
                }
            });
        });

        await logActivity(null, 'CREATED', 'SALARY_GROUP', `${copyName} (copied from ${original.name})`);
        res.status(201).json(copied);
    } catch (error) {
        console.error("Error copying salary group:", error);
        res.status(500).json({ error: "Failed to copy salary group" });
    }
});

// PATCH /:id/toggle — Toggle Active/Inactive status
router.patch('/:id/toggle', async (req, res) => {
    try {
        const { id } = req.params;
        const group = await prisma.salaryGroup.findUnique({
            where: { id: parseInt(id) }
        });

        if (!group) {
            return res.status(404).json({ error: "Salary group not found" });
        }

        const newStatus = group.status === 'Active' ? 'Inactive' : 'Active';
        const updated = await prisma.salaryGroup.update({
            where: { id: parseInt(id) },
            data: { status: newStatus }
        });

        await logActivity(null, 'UPDATED', 'SALARY_GROUP', `${group.name} → ${newStatus}`);
        res.json(updated);
    } catch (error) {
        console.error("Error toggling salary group:", error);
        res.status(500).json({ error: "Failed to toggle status" });
    }
});

export default router;
