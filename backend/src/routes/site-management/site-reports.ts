import express from 'express';
import prisma from '../../lib/prismaClient';

const router = express.Router();

// 1. Site Attendance Summary (Monthly rollup)
router.get('/summary', async (req, res) => {
    try {
        const { site_id, month, year } = req.query;
        
        const m = month ? Number(month) : new Date().getMonth() + 1;
        const y = year ? Number(year) : new Date().getFullYear();

        const startDate = new Date(y, m - 1, 1);
        const endDate = new Date(y, m, 0, 23, 59, 59);

        const where: any = {};
        if (site_id) where.siteEmployee = { site_id: Number(site_id) };
        where.date = { gte: startDate, lte: endDate };

        const records = await prisma.siteAttendance.findMany({
            where,
            include: { siteEmployee: { include: { site: true, user: true } } }
        });

        // Group by Site
        const siteMap: any = {};
        records.forEach((r: any) => {
            const sid = r.siteEmployee.site_id;
            if (!siteMap[sid]) {
                siteMap[sid] = {
                    site_name: r.siteEmployee.site.name,
                    total_days: 0,
                    present_days: 0,
                    absent_days: 0,
                    leave_days: 0,
                    overtime_hours: 0
                };
            }

            siteMap[sid].total_days++;
            if (r.status === 'Present') siteMap[sid].present_days++;
            else if (r.status === 'Absent') siteMap[sid].absent_days++;
            else if (r.status === 'Leave') siteMap[sid].leave_days++;

            siteMap[sid].overtime_hours += r.overtime_hours || 0;
        });

        const summary = Object.values(siteMap);
        res.status(200).json(summary);

    } catch (error) {
         console.error('Fetch site summary error:', error);
         res.status(500).json({ message: 'Internal Server Error' });
    }
});

// 2. Site Wise Report (Performance Aggregates)
router.get('/performance', async (req, res) => {
     try {
         const { site_id, start_date, end_date } = req.query;
         // Base employee count per site
         const siteFilter = site_id ? Number(site_id) : undefined;
         
         const sites = await prisma.site.findMany({
             where: siteFilter ? { id: siteFilter } : {},
             include: {
                 siteEmployees: {
                     include: { siteAttendances: {
                         where: (start_date && end_date) 
                         ? { date: { gte: new Date(start_date as string), lte: new Date(end_date as string) } } 
                         : undefined
                     }}
                 }
             }
         });

         const report = sites.map((site: any) => {
             const totalEmployees = site.siteEmployees.length;
             let present = 0;
             let absent = 0;
             let totalHours = 0;

             site.siteEmployees.forEach((emp: any) => {
                 emp.siteAttendances.forEach((att: any) => {
                     if (att.status === 'Present') present++;
                     if (att.status === 'Absent') absent++;
                     totalHours += (att.working_hours || 0);
                 });
             });

             const attendancePercent = (present + absent) > 0 ? (present / (present + absent)) * 100 : 0;

             return {
                 site_name: site.name,
                 totalEmployees,
                 present,
                 absent,
                 attendancePercent: attendancePercent.toFixed(2),
                 totalHours: totalHours.toFixed(2)
             };
         });

         res.status(200).json(report);

     } catch (error) {
         console.error('Site performance error:', error);
         res.status(500).json({ message: 'Internal Server Error' });
     }
});

// 3. Site Attendance Counts (Dashboard Today)
router.get('/counts', async (req, res) => {
    try {
        const { site_id, date } = req.query;

        const targetDate = date ? new Date(date as string) : new Date();
        targetDate.setHours(0,0,0,0);
        const nextDate = new Date(targetDate);
        nextDate.setDate(targetDate.getDate() + 1);

        const where: any = { date: { gte: targetDate, lt: nextDate } };
        if (site_id) where.siteEmployee = { site_id: Number(site_id) };

        const todayRecords = await prisma.siteAttendance.findMany({
             where
        });

        const counts = {
            present: 0,
            absent: 0,
            late: 0,
            missingPunch: 0
        };

        todayRecords.forEach((r: any) => {
            if (r.status === 'Present') counts.present++;
            if (r.status === 'Absent') counts.absent++;
            if (r.status === 'Late' || r.late_minutes > 0) counts.late++;
            if (r.status === 'Missing Punch' || (r.punch_in && !r.punch_out)) counts.missingPunch++;
        });

        res.status(200).json(counts);

    } catch (error) {
         console.error('Fetch site counts error:', error);
         res.status(500).json({ message: 'Internal Server Error' });
    }
});

export default router;
