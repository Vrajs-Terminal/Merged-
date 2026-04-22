"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prismaClient_1 = __importDefault(require("../lib/prismaClient"));
const activityLogger_1 = require("../services/activityLogger");
const router = (0, express_1.Router)();
// Get Company Setup
router.get('/', async (req, res) => {
    try {
        let company = await prismaClient_1.default.company.findFirst();
        // If no company exists yet, send an empty object
        if (!company) {
            company = await prismaClient_1.default.company.create({
                data: { name: 'New Company' }
            });
        }
        res.json(company);
    }
    catch (error) {
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
        const existingCompany = await prismaClient_1.default.company.findFirst();
        let company;
        if (existingCompany) {
            company = await prismaClient_1.default.company.update({
                where: { id: existingCompany.id },
                data: { name, website, tax_info }
            });
        }
        else {
            company = await prismaClient_1.default.company.create({
                data: { name, website, tax_info }
            });
        }
        res.json(company);
        (0, activityLogger_1.logActivity)(null, 'UPDATED', 'COMPANY', company.name, { website, tax_info });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update company details' });
    }
});
exports.default = router;
//# sourceMappingURL=company.js.map