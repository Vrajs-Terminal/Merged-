import { Router } from 'express';
import prisma from '../lib/prismaClient';
import { logActivity } from '../services/activityLogger';

const router = Router();


// Get Company Setup
router.get('/', async (req, res) => {
    try {
        let company = await prisma.company.findFirst();
        // If no company exists yet, send an empty object
        if (!company) {
            company = await prisma.company.create({
                data: { name: 'New Company' }
            });
        }
        res.json(company);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch company details' });
    }
});

// Update Company Setup
router.put('/', async (req, res) => {
    const { name, website, tax_info } = req.body;

    if (!name) {
        return res.status(400).json({ error: 'Company Name is required' });
    }

    try {
        const existingCompany = await prisma.company.findFirst();
        let company;

        if (existingCompany) {
            company = await prisma.company.update({
                where: { id: existingCompany.id },
                data: { name, website, tax_info }
            });
        } else {
            company = await prisma.company.create({
                data: { name, website, tax_info }
            });
        }

        res.json(company);
        logActivity(null, 'UPDATED', 'COMPANY', company.name, { website, tax_info });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update company details' });
    }
});

export default router;
