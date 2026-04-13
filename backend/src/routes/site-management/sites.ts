import express from 'express';
import prisma from '../../lib/prismaClient';

const router = express.Router();

// GET all sites
router.get('/', async (req, res) => {
    try {
        const sites = await prisma.site.findMany({
            include: {
                branch: { select: { id: true, name: true, code: true } },
                department: { select: { id: true, name: true } },
                reportingManager: { select: { id: true, name: true } },
                _count: {
                    select: { siteEmployees: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.status(200).json(sites);
    } catch (error) {
        console.error('Fetch sites error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// POST add new site
router.post('/', async (req, res) => {
    try {
        const {
            name, contact_name, mobile_no, email, area, address, city_state,
            revenue_share_pct, commission_bearer, status, agreement_start, agreement_end,
            branch_id, department_id, reporting_manager_id, document_url
        } = req.body;

        // Validation
        if (!name || !contact_name || !mobile_no || !area || !branch_id || revenue_share_pct === undefined) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        if (Number(revenue_share_pct) < 0 || Number(revenue_share_pct) > 100) {
            return res.status(400).json({ message: 'Revenue share percentage must be between 0 and 100.' });
        }

        // Check for duplicates
        const existing = await prisma.site.findUnique({
            where: {
                name_mobile_no: {
                    name,
                    mobile_no
                }
            }
        });

        if (existing) {
            return res.status(400).json({ message: 'A site with the exact same Name and Mobile combination already exists.' });
        }

        const site = await prisma.site.create({
            data: {
                name,
                contact_name,
                mobile_no,
                email,
                area,
                address,
                city_state,
                revenue_share_pct: Number(revenue_share_pct),
                commission_bearer: commission_bearer || 'Company',
                status: status || 'Active',
                agreement_start: agreement_start ? new Date(agreement_start) : null,
                agreement_end: agreement_end ? new Date(agreement_end) : null,
                document_url,
                branch_id: Number(branch_id),
                department_id: department_id ? Number(department_id) : undefined,
                reporting_manager_id: reporting_manager_id ? Number(reporting_manager_id) : undefined,
            }
        });

        res.status(201).json(site);
    } catch (error) {
        console.error('Create site error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// PUT update site
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const {
            name, contact_name, mobile_no, email, area, address, city_state,
            revenue_share_pct, commission_bearer, status, agreement_start, agreement_end,
            branch_id, department_id, reporting_manager_id, document_url
        } = req.body;

        if (Number(revenue_share_pct) < 0 || Number(revenue_share_pct) > 100) {
            return res.status(400).json({ message: 'Revenue share percentage must be between 0 and 100.' });
        }

        const updated = await prisma.site.update({
            where: { id: Number(id) },
            data: {
                name,
                contact_name,
                mobile_no,
                email,
                area,
                address,
                city_state,
                revenue_share_pct: revenue_share_pct !== undefined ? Number(revenue_share_pct) : undefined,
                commission_bearer,
                status,
                agreement_start: agreement_start ? new Date(agreement_start) : null,
                agreement_end: agreement_end ? new Date(agreement_end) : null,
                document_url,
                branch_id: branch_id ? Number(branch_id) : undefined,
                department_id: department_id ? Number(department_id) : null,
                reporting_manager_id: reporting_manager_id ? Number(reporting_manager_id) : null,
            }
        });

        res.status(200).json(updated);
    } catch (error) {
        console.error('Update site error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// DELETE site
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.site.delete({
            where: { id: Number(id) }
        });
        res.status(200).json({ message: 'Site permanently deleted' });
    } catch (error) {
        console.error('Delete site error:', error);
        res.status(500).json({ message: 'Internal Server Error - May have linked employees or data' });
    }
});

export default router;
