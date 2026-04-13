import express from 'express';
import prisma from '../../lib/prismaClient';

const router = express.Router();

// GET / - fetch employee tax regimes with filters and compute summary stats
router.get('/', async (req, res) => {
    try {
        const { branch_id, department_id, search, salary_type, tax_regime, financial_year } = req.query;

        const currentFY = (financial_year as string) || '2025-26';

        // Base user filter matching Active CTCs and users
        const userWhere: any = {
            role: { not: 'Superadmin' }
        };

        if (branch_id) userWhere.branch_id = parseInt(branch_id as string);
        if (department_id) userWhere.department_id = parseInt(department_id as string);
        if (search) {
            userWhere.OR = [
                { name: { contains: search as string } },
                { email: { contains: search as string } }
            ];
        }

        // Fetch matched users with their current CTC and tax regime for the requested FY
        let users = await prisma.user.findMany({
            where: userWhere,
            select: {
                id: true,
                name: true,
                email: true,
                branch: { select: { name: true } },
                department: { select: { name: true } },
                designation: { select: { name: true } },
                employeeCTCs: {
                    where: { status: 'Current' },
                    select: { salary_type: true, gross_salary: true }
                }
            }
        });

        // We also need the tax regimes
         const userIds = users.map(u => u.id);
         const regimes = await prisma.employeeTaxRegime.findMany({
             where: {
                 user_id: { in: userIds },
                 financial_year: currentFY
             }
         });

         const regimeMap = new Map();
         regimes.forEach(r => regimeMap.set(r.user_id, r));

         // Filter by Salary Type and Tax Regime if provided
         let processedUsers = users.map(user => {
             const regimeDetail = regimeMap.get(user.id) || {
                 tax_regime: 'Not Assigned',
                 metro_type: 'Non-Metro',
                 declaration_status: 'Not Submitted',
                 lock_status: false,
                 financial_year: currentFY
             };
             const currentCtc = user.employeeCTCs[0];

             return {
                 user_id: user.id,
                 name: user.name,
                 email: user.email,
                 designation: user.designation?.name || 'N/A',
                 department: user.department?.name || 'N/A',
                 branch: user.branch?.name || 'N/A',
                 salary_type: currentCtc?.salary_type || 'N/A',
                 gross_salary: currentCtc?.gross_salary || 0,
                 ...regimeDetail
             };
         });

         if (salary_type) {
             processedUsers = processedUsers.filter(u => u.salary_type === salary_type);
         }
         
         if (tax_regime) {
             processedUsers = processedUsers.filter(u => u.tax_regime === tax_regime);
         }

         // Calculate stats (Summary Cards)
         const stats = {
             total: processedUsers.length,
             new_regime: processedUsers.filter(u => u.tax_regime === 'New').length,
             old_regime: processedUsers.filter(u => u.tax_regime === 'Old').length,
             not_assigned: processedUsers.filter(u => u.tax_regime === 'Not Assigned').length,
         };

        res.json({ data: processedUsers, stats });
    } catch (error) {
        console.error("Error fetching tax regimes:", error);
        res.status(500).json({ error: "Failed to fetch tax regimes" });
    }
});

// PUT /bulk - Bulk update tax regimes
router.put('/bulk', async (req, res) => {
    try {
        const { user_ids, financial_year, tax_regime } = req.body;

        if (!user_ids || !Array.isArray(user_ids) || !financial_year || !tax_regime) {
            return res.status(400).json({ error: "Missing required fields for bulk update" });
        }

        const updates = user_ids.map((id: number) => {
            return prisma.employeeTaxRegime.upsert({
                where: { user_id_financial_year: { user_id: id, financial_year } },
                update: { tax_regime },
                create: {
                    user_id: id,
                    financial_year,
                    tax_regime,
                    metro_type: 'Non-Metro',
                    declaration_status: 'Not Submitted'
                }
            });
        });

        await prisma.$transaction(updates);

        res.json({ message: "Bulk update successful" });
    } catch (error) {
        console.error("Error in bulk update tax regime:", error);
        res.status(500).json({ error: "Failed to perform bulk update" });
    }
});

// PUT /:user_id - Update single user tax regime (used from the Side Drawer)
router.put('/:user_id', async (req, res) => {
    try {
        const userId = parseInt(req.params.user_id);
        const { financial_year, tax_regime, metro_type, declaration_status } = req.body;

        if (!financial_year) {
            return res.status(400).json({ error: "Financial year is required" });
        }

        const updated = await prisma.employeeTaxRegime.upsert({
            where: { user_id_financial_year: { user_id: userId, financial_year } },
            update: {
                ...(tax_regime && { tax_regime }),
                ...(metro_type && { metro_type }),
                ...(declaration_status && { declaration_status })
            },
            create: {
                user_id: userId,
                financial_year,
                tax_regime: tax_regime || 'Not Assigned',
                metro_type: metro_type || 'Non-Metro',
                declaration_status: declaration_status || 'Not Submitted'
            }
        });

        res.json({ message: "Tax regime updated successfully", data: updated });
    } catch (error) {
        console.error("Error updating single tax regime:", error);
        res.status(500).json({ error: "Failed to update tax regime" });
    }
});

export default router;
