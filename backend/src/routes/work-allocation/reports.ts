import express from 'express';
import prisma from '../../lib/prismaClient';

const router = express.Router();

// GET complete report logic with drill downs
router.get('/', async (req, res) => {
    try {
        const { branch_id, department_id, employee_id, assigned_by_id, category_id, status, priority, start_date, end_date } = req.query;

        // Base Filters
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
                assignedTo: { select: { id: true, name: true, role: true } },
                category: { select: { name: true, code: true, sla_hours: true } }
            }
        });

        // Compute Aggregation
        let total = tasks.length;
        let completed = 0;
        let pending = 0;
        let overdue = 0;
        let totalTimeSecs = 0;

        const now = new Date();

        // 1. Employee Group Aggregations
        const employeeMap: { [key: number]: any } = {};

        tasks.forEach((task: any) => {
            const isCompleted = task.status === 'Completed';
            const isOverdue = !isCompleted && new Date(task.due_date) < now;

            if (isCompleted) completed++;
            else pending++;
            
            if (isOverdue) overdue++;

            let timeSecs = 0;
            if (isCompleted && task.completion_date) {
                timeSecs = (new Date(task.completion_date).getTime() - new Date(task.start_date).getTime()) / 1000;
                totalTimeSecs += timeSecs;
            }

            const empId = task.assigned_to_id;
            if (!employeeMap[empId]) {
                employeeMap[empId] = {
                    employee: task.assignedTo,
                    total: 0,
                    completed: 0,
                    pending: 0,
                    overdue: 0,
                    totalTimeSecs: 0,
                    productivity: 0
                };
            }

            employeeMap[empId].total++;
            if (isCompleted) employeeMap[empId].completed++;
            else employeeMap[empId].pending++;
            if (isOverdue) employeeMap[empId].overdue++;
            if (isCompleted) employeeMap[empId].totalTimeSecs += timeSecs;
        });

        const employeeAggs = Object.values(employeeMap).map(emp => {
            emp.productivity = emp.total > 0 ? (emp.completed / emp.total) * 100 : 0;
            const avgTimeSecs = emp.completed > 0 ? emp.totalTimeSecs / emp.completed : 0;
            const hours = Math.floor(avgTimeSecs / 3600);
            const minutes = Math.floor((avgTimeSecs % 3600) / 60);
            return {
               ...emp,
               avg_time: `${hours}h ${minutes}m`,
               productivity_str: `${Math.round(emp.productivity)}%`
            };
        });

        // Overall averages
        const overallAvgSecs = completed > 0 ? totalTimeSecs / completed : 0;
        const totalHours = Math.floor(overallAvgSecs / 3600);
        const totalMinutes = Math.floor((overallAvgSecs % 3600) / 60);

        res.status(200).json({
            summary: {
                total,
                completed,
                pending,
                overdue,
                avg_time: `${totalHours}h ${totalMinutes}m`,
                productivity: total > 0 ? Math.round((completed / total) * 100) : 0
            },
            employeeStats: employeeAggs.sort((a,b) => b.productivity - a.productivity),
            details: tasks.map((t: any) => ({
                ...t,
                delay_flag: t.status !== 'Completed' && new Date(t.due_date) < now // organic refresh
            }))
        });

    } catch (error) {
        console.error('Fetch reports error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

export default router;
