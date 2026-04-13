import express from 'express';
import prisma from '../../lib/prismaClient';

const router = express.Router();

// GET all verifications with optional filters
router.get('/', async (req, res) => {
    try {
        const { employee_name, branch_id, department_id, verification_type_id, status, is_new } = req.query;

        const where: any = {};
        if (employee_name) {
            where.employee = { name: { contains: String(employee_name) } };
        }
        if (branch_id) where.branch_id = Number(branch_id);
        if (department_id) where.department_id = Number(department_id);
        if (verification_type_id) where.verification_type_id = Number(verification_type_id);
        if (status) where.status = String(status);

        if (is_new === 'true') {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            where.employee = { ...where.employee, createdAt: { gte: thirtyDaysAgo } };
        }

        const verifications = await prisma.backgroundVerification.findMany({
            where,
            include: {
                employee: { select: { id: true, name: true, employee_grade_id: true } },
                branch: { select: { id: true, name: true } },
                department: { select: { id: true, name: true } },
                verificationType: { select: { id: true, name: true } },
                verifier: { select: { id: true, name: true } }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json(verifications);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// POST create verification
router.post('/', async (req, res) => {
    try {
        const { employee_id, verification_type_id, verification_way, status, remarks, document_url, verified_by, verification_date } = req.body;

        if (!employee_id || !verification_type_id || !verification_way) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Get employee branch/department automatically
        const employee = await prisma.user.findUnique({
            where: { id: Number(employee_id) },
            select: { branch_id: true, department_id: true }
        });

        if (!employee) return res.status(404).json({ message: 'Employee not found' });

        const verification = await prisma.backgroundVerification.create({
            data: {
                employee_id: Number(employee_id),
                branch_id: employee.branch_id,
                department_id: employee.department_id,
                verification_type_id: Number(verification_type_id),
                verification_way: String(verification_way),
                status: status || 'Pending',
                remarks: remarks || null,
                document_url: document_url || [],
                verified_by: verified_by ? Number(verified_by) : null,
                verification_date: verification_date ? new Date(verification_date) : null
            }
        });

        res.status(201).json(verification);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// PUT update verification
router.put('/:id', async (req, res) => {
    try {
        const id = Number(req.params.id);
        const { status, remarks, document_url, verified_by, verification_date } = req.body;

        const updated = await prisma.backgroundVerification.update({
            where: { id },
            data: {
                status,
                remarks,
                document_url,
                verified_by: verified_by ? Number(verified_by) : null,
                verification_date: verification_date ? new Date(verification_date) : null
            }
        });

        res.json(updated);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// DELETE
router.delete('/:id', async (req, res) => {
    try {
        await prisma.backgroundVerification.delete({ where: { id: Number(req.params.id) } });
        res.json({ message: 'Verification record deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

export default router;
