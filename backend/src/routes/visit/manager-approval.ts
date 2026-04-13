import express from 'express';
import prisma from '../../lib/prismaClient';

const router = express.Router();

// GET /api/manager-approval
// Fetch all completed visits that need manager action (Pending Approval + Already decided ones for history)
router.get('/', async (req, res) => {
    try {
        const { search, page = 1, limit = 25 } = req.query;
        
        const take = parseInt(limit as string);
        const skip = (parseInt(page as string) - 1) * take;

        const where: any = {
            // Only pull visits that have finished execution (Completed) 
            // OR are explicitly back in "Pending Approval" state
            status: { in: ['Completed', 'Pending Approval', 'Draft'] } 
        };

        if (search) {
            where.OR = [
                { client_name: { contains: search as string } },
                { company_name: { contains: search as string } },
                { user: { name: { contains: search as string } } }
            ];
        }

        const [visits, total] = await Promise.all([
            prisma.visit.findMany({
                where,
                include: {
                    user: { select: { id: true, name: true, email: true } },
                    approver: { select: { name: true } }
                },
                take,
                skip,
                orderBy: { date: 'desc' }
            }),
            prisma.visit.count({ where })
        ]);

        res.json({
            data: visits,
            meta: {
                total,
                page: parseInt(page as string),
                last_page: Math.ceil(total / take)
            }
        });
    } catch (error) {
        console.error("Manager Approval Fetch Error: ", error);
        res.status(500).json({ error: "Failed to fetch visits for approval." });
    }
});

// POST /api/manager-approval/:id/decision
// Appove, Reject, or Request Resubmission
router.post('/:id/decision', async (req, res) => {
    try {
        const visitId = parseInt(req.params.id);
        const { decision, comments, approver_id } = req.body; // decision: 'Approve', 'Reject', 'Resubmit'

        // Map the decision to the final status
        let finalStatus = 'Pending Approval';
        let approvalStatus = 'Pending';

        if (decision === 'Approve') {
            finalStatus = 'Completed';
            approvalStatus = 'Approved';
        } else if (decision === 'Reject') {
            finalStatus = 'Cancelled'; // Or Rejected if you prefer a new status
            approvalStatus = 'Rejected';
        } else if (decision === 'Resubmit') {
            finalStatus = 'Draft'; // Pushes it back to the employee's pending pile
            approvalStatus = 'Resubmission Requested';
        }

        const updated = await prisma.visit.update({
            where: { id: visitId },
            data: {
                status: finalStatus,
                approval_status: approvalStatus,
                approval_comments: comments || null,
                approver_id: approver_id || 1 // Fallback to Admin (ID 1) if context missing
            }
        });

        res.json({ message: "Visit decision recorded successfully", data: updated });
    } catch (error) {
        console.error("Manager Approval Decision Error: ", error);
        res.status(500).json({ error: "Failed to submit decision." });
    }
});

export default router;
