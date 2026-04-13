import express from 'express';
import prisma from '../../lib/prismaClient';
import { logActivity } from '../../services/activityLogger';

const router = express.Router();

// GET / - List bank details with filters
router.get('/', async (req, res) => {
    try {
        const { branch_id, department_id, user_id, status } = req.query;
        
        const where: any = {};
        if (status) where.status = status as string;
        if (user_id) where.user_id = parseInt(user_id as string);

        if (branch_id || department_id) {
            where.user = {};
            if (branch_id) where.user.branch_id = parseInt(branch_id as string);
            if (department_id) where.user.department_id = parseInt(department_id as string);
        }

        const records = await prisma.employeeBankDetail.findMany({
            where,
            include: {
                user: { select: { name: true, email: true, branch: { select: { name: true } }, department: { select: { name: true } } } }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(records);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch bank details" });
    }
});

// POST / - Add/Update bank details
router.post('/', async (req, res) => {
    try {
        const { 
            user_id, bank_name, bank_branch, account_number, account_type, 
            ifsc_code, account_holder_name, pan_no, crn_no, esic_no, 
            pf_no, uan_no, micr_code, insurance_no, is_primary 
        } = req.body;

        const userIdInt = parseInt(user_id);

        // If setting as primary, unset other primary accounts for this user
        if (is_primary) {
            await prisma.employeeBankDetail.updateMany({
                where: { user_id: userIdInt, is_primary: true },
                data: { is_primary: false }
            });
        }

        // Check if record exists for this user and account number (or just use unique id if editing)
        const record = await prisma.employeeBankDetail.create({
            data: {
                user_id: userIdInt,
                bank_name,
                bank_branch,
                account_number,
                account_type: account_type || 'Saving',
                ifsc_code,
                account_holder_name,
                pan_no,
                crn_no,
                esic_no,
                pf_no,
                uan_no,
                micr_code,
                insurance_no,
                is_primary: !!is_primary
            }
        });

        await logActivity(null, 'ADDED', 'BANK_DETAILS', `User ID: ${user_id}, Bank: ${bank_name}`);
        res.status(201).json(record);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to save bank details" });
    }
});

// PUT /:id - Update details
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;
        
        if (data.user_id) data.user_id = parseInt(data.user_id);
        if (data.is_primary) {
            // Need user_id to unset others
            const current = await prisma.employeeBankDetail.findUnique({ where: { id: parseInt(id) } });
            if (current) {
                await prisma.employeeBankDetail.updateMany({
                    where: { user_id: current.user_id, is_primary: true },
                    data: { is_primary: false }
                });
            }
        }

        const record = await prisma.employeeBankDetail.update({
            where: { id: parseInt(id) },
            data
        });

        await logActivity(null, 'UPDATED', 'BANK_DETAILS', `ID: ${id}`);
        res.json(record);
    } catch (error) {
        res.status(500).json({ error: "Update failed" });
    }
});

// DELETE /:id - Delete entry
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.employeeBankDetail.delete({ where: { id: parseInt(id) } });
        res.json({ message: "Deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Delete failed" });
    }
});

export default router;
