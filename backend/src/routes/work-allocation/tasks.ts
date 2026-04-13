import express from 'express';
import prisma from '../../lib/prismaClient';

const router = express.Router();

// GET tasks with robust filters
router.get('/', async (req, res) => {
    try {
        const { branch_id, department_id, employee_id, assigned_by_id, category_id, status, priority, start_date, end_date } = req.query;

        const where: any = {};
        if (branch_id) where.branch_id = Number(branch_id);
        if (department_id) where.department_id = Number(department_id);
        if (employee_id) where.assigned_to_id = Number(employee_id);
        if (assigned_by_id) where.assigned_by_id = Number(assigned_by_id);
        if (category_id) where.category_id = Number(category_id);
        if (status) where.status = status;
        if (priority) where.priority = priority;
        
        if (start_date && end_date) {
            where.due_date = {
                gte: new Date(start_date as string),
                lte: new Date(end_date as string)
            };
        }

        const tasks = await prisma.workAllocation.findMany({
            where,
            include: {
                category: { select: { name: true, code: true } },
                assignedBy: { select: { id: true, name: true, role: true } },
                assignedTo: { select: { id: true, name: true, role: true } },
            },
            orderBy: { createdAt: 'desc' }
        });

        // Recalculate delay flags organically before sending
        const now = new Date();
        const updatedTasks = tasks.map((t: any) => {
            const isDelayed = t.status !== 'Completed' && new Date(t.due_date) < now;
            return {
                ...t,
                delay_flag: isDelayed
            };
        });

        res.status(200).json(updatedTasks);
    } catch (error) {
        console.error('Fetch tasks error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// POST create task
router.post('/', async (req, res) => {
    try {
        const { 
            category_id, 
            title, 
            description, 
            assigned_by_id, 
            assigned_to_id, 
            priority, 
            start_date, 
            due_date, 
            attachments, 
            project_sr_no, 
            site, 
            location,
            branch_id,
            department_id
        } = req.body;

        if (!category_id || !title || !assigned_by_id || !assigned_to_id || !start_date || !due_date) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Auto-generate task ID
        const currentYearMonth = new Date().toISOString().slice(0, 7).replace('-', '');
        const taskCount = await prisma.workAllocation.count({
            where: { createdAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } }
        });
        const task_id = `WRK-${currentYearMonth}-${(taskCount + 1).toString().padStart(4, '0')}`;

        // Check Access Logic (Assign_by can assign to assign_to this category)
        const access = await prisma.workAllocationAccess.findFirst({
            where: {
                assign_by_id: Number(assigned_by_id),
                assign_to_id: Number(assigned_to_id),
                status: 'Active'
            }
        });

        if (!access) {
             return res.status(403).json({ message: 'You do not have access to assign tasks to this user.' });
        }

        const validCats = Array.isArray(access.category_ids) ? access.category_ids as number[] : [];
        if (!validCats.includes(Number(category_id))) {
             return res.status(403).json({ message: 'You do not have permission to assign this specific work category to this user.' });
        }

        // Limit Checks
        if (access.max_task_per_day > 0) {
            const todayStart = new Date(); todayStart.setHours(0,0,0,0);
            const todayEnd = new Date(); todayEnd.setHours(23,59,59,999);
            const taskAssignedToday = await prisma.workAllocation.count({
                where: {
                    assigned_to_id: Number(assigned_to_id),
                    createdAt: { gte: todayStart, lte: todayEnd }
                }
            });
            if (taskAssignedToday >= access.max_task_per_day) {
                 return res.status(400).json({ message: `Max tasks per day limit (${access.max_task_per_day}) reached for this employee.` });
            }
        }

        const task = await prisma.workAllocation.create({
            data: {
                task_id,
                category_id: Number(category_id),
                title,
                description,
                assigned_by_id: Number(assigned_by_id),
                assigned_to_id: Number(assigned_to_id),
                priority: priority || 'Medium',
                start_date: new Date(start_date),
                due_date: new Date(due_date),
                attachments: attachments || [],
                project_sr_no,
                site,
                location,
                branch_id: branch_id ? Number(branch_id) : undefined,
                department_id: department_id ? Number(department_id) : undefined,
                status: 'Pending'
            }
        });

        res.status(201).json(task);

    } catch (error) {
        console.error('Create task error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// PATCH task status / progress
router.patch('/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status, progress, engineer_status, engineer_remark, completion_remark } = req.body;
        
        let updateData: any = { status, progress, engineer_status, engineer_remark, completion_remark };

        if (progress === 100 || status === 'Completed') {
            updateData.status = 'Completed';
            updateData.progress = 100;
            updateData.completion_date = new Date();
        }

        const updated = await prisma.workAllocation.update({
            where: { id: Number(id) },
            data: updateData
        });

        res.status(200).json(updated);
    } catch (error) {
         console.error('Update task status error:', error);
         res.status(500).json({ message: 'Internal Server Error' });
    }
});

// PATCH Reassign Task
router.patch('/:id/reassign', async (req, res) => {
    try {
        const { id } = req.params;
        const { new_assigned_to_id } = req.body;

        const task = await prisma.workAllocation.findUnique({
            where: { id: Number(id) }
        });

        if (!task) return res.status(404).json({ message: 'Task not found' });

        // Check if original assigner allowed reassign in access rule
        const access = await prisma.workAllocationAccess.findFirst({
            where: {
                assign_by_id: task.assigned_by_id,
                assign_to_id: task.assigned_to_id,
                status: 'Active'
            }
        });

        if (access && access.allow_reassign === false) {
             return res.status(403).json({ message: 'Reassignment is restricted by the original access rule.' });
        }

        const updated = await prisma.workAllocation.update({
            where: { id: Number(id) },
            data: { assigned_to_id: Number(new_assigned_to_id) }
        });

        res.status(200).json(updated);
    } catch (error) {
        console.error('Reassign task error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

export default router;
