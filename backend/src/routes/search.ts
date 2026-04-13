import { Router } from 'express';
import prisma from '../lib/prismaClient';

const router = Router();

router.get('/', async (req, res) => {
    const { q } = req.query;

    if (!q || typeof q !== 'string') {
        return res.json({ results: [] });
    }

    try {
        const query = q.toLowerCase();

        // 1. Search Modules (Static for now)
        const allModules = [
            { name: "Dashboard", path: "/" },
            { name: "Company Setup", path: "/company-setup" },
            { name: "Sister Companies", path: "/sister-companies" },
            { name: "Roles & Privileges", path: "/admin-rights" },
            { name: "Zones", path: "/zones" },
            { name: "Branches", path: "/branches" },
            { name: "Departments", path: "/departments" },
            { name: "Sub-Departments", path: "/sub-departments" },
            { name: "Designations", path: "/designations" },
            { name: "Employee Levels", path: "/employee-levels" },
            { name: "Employee Grades", path: "/employee-grades" },
            { name: "Attendance Dashboard", path: "/attendance-dashboard" },
            { name: "View Attendance", path: "/view-attendance" },
            { name: "Tracking Dashboard", path: "/tracking-dashboard" },
            { name: "Visit Dashboard", path: "/visit-dashboard" },
        ];

        const filteredModules = allModules.filter(m => m.name.toLowerCase().includes(query)).map(m => ({
            type: 'Module',
            title: m.name,
            subtitle: 'Navigation',
            path: m.path
        }));

        // 2. Search Databases
        const [users, employees, branches, departments] = await Promise.all([
            prisma.user.findMany({
                where: { OR: [{ name: { contains: query } }, { email: { contains: query } }] },
                take: 5,
                select: { id: true, name: true, email: true, role: true }
            }),
            prisma.employee.findMany({
                where: { OR: [{ firstName: { contains: query } }, { lastName: { contains: query } }, { employeeId: { contains: query } }] },
                take: 8,
                select: { id: true, firstName: true, lastName: true, employeeId: true }
            }),
            prisma.branch.findMany({
                where: { OR: [{ name: { contains: query } }, { code: { contains: query } }] },
                take: 5,
                select: { id: true, name: true, code: true }
            }),
            prisma.department.findMany({
                where: { name: { contains: query } },
                take: 5,
                select: { id: true, name: true }
            })
        ]);

        const userResults = users.map(u => ({
            type: u.role === 'Admin' ? 'Admin' : 'Employee',
            title: u.name,
            subtitle: u.email,
            path: `/admin-rights`
        }));

        const employeeResults = employees.map(e => ({
            type: 'Employee',
            title: `${e.firstName} ${e.lastName}`,
            subtitle: `ID: ${e.employeeId}`,
            path: `/view-attendance`
        }));

        const branchResults = branches.map(b => ({
            type: 'Branch',
            title: b.name,
            subtitle: `Code: ${b.code}`,
            path: '/branches'
        }));

        const departmentResults = departments.map(d => ({
            type: 'Department',
            title: d.name,
            subtitle: 'Organization Unit',
            path: '/departments'
        }));

        res.json({ results: [...filteredModules, ...userResults, ...employeeResults, ...branchResults, ...departmentResults] });

    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ error: 'Failed to perform search' });
    }
});

export default router;
