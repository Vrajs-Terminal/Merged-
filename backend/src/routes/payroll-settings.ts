import express from 'express';
import prisma from '../lib/prismaClient';
import { logActivity } from '../services/activityLogger';

const router = express.Router();

const SETTINGS_KEY = 'payroll_tax_settings';

// GET /api/payroll-settings — Fetch all payroll & tax settings
router.get('/', async (req, res) => {
    try {
        const setting = await prisma.companySetting.findUnique({
            where: { key: SETTINGS_KEY }
        });

        if (!setting) {
            // Return default empty structure
            return res.json({
                payslipFormat: 'Standard Payslip',
                publishedSlipDurationLimit: 12,
                showRoundOff: true,
                advanceCarryForwardMonths: 12,
                maxEmiMonths: 12,
                weekStartDay: 'Monday',
                defaultHraAmount: 0,
                form16ResponsibleUser: '',
                form16ResponsibleUserFatherName: '',
                form16ResponsibleUserDesignation: '',
                citTdsAddress: '',
                form16SignatureUrl: '',
                salaryStampSignatureUrl: '',
                fnfDeclaration: 'I, the undersigned, hereby state that I have received the above-said amount as my full and final settlement out of my own free will and choice on tendering my resignation and I assure that I have no grievances, disputes, demands, and claims about my legal dues, back wages, reinstatement, or reemployment against the company.',
                fnfAuthorizedPerson: ''
            });
        }

        res.json(setting.value);
    } catch (error) {
        console.error("Error fetching payroll settings:", error);
        res.status(500).json({ error: "Failed to fetch payroll settings" });
    }
});

// PUT /api/payroll-settings — Save all payroll & tax settings
router.put('/', async (req, res) => {
    try {
        const value = req.body;

        const upsertedSetting = await prisma.companySetting.upsert({
            where: { key: SETTINGS_KEY },
            update: { value },
            create: { key: SETTINGS_KEY, value }
        });

        await logActivity(null, 'UPDATED', 'PAYROLL_SETTINGS', 'Payroll & Tax Settings');
        res.json(upsertedSetting.value);
    } catch (error) {
        console.error("Error saving payroll settings:", error);
        res.status(500).json({ error: "Failed to save payroll settings" });
    }
});

export default router;
