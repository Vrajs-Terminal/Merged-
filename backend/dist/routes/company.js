"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prismaClient_1 = __importDefault(require("../lib/prismaClient"));
const activityLogger_1 = require("../services/activityLogger");
const router = (0, express_1.Router)();
// Get Company Setup
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let company = yield prismaClient_1.default.company.findFirst();
        // If no company exists yet, send an empty object
        if (!company) {
            company = yield prismaClient_1.default.company.create({
                data: { name: 'New Company' }
            });
        }
        res.json(company);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch company details' });
    }
}));
// Update Company Setup
router.put('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, website, tax_info } = req.body;
    if (!name) {
        return res.status(400).json({ error: 'Company Name is required' });
    }
    try {
        const existingCompany = yield prismaClient_1.default.company.findFirst();
        let company;
        if (existingCompany) {
            company = yield prismaClient_1.default.company.update({
                where: { id: existingCompany.id },
                data: { name, website, tax_info }
            });
        }
        else {
            company = yield prismaClient_1.default.company.create({
                data: { name, website, tax_info }
            });
        }
        res.json(company);
        (0, activityLogger_1.logActivity)(null, 'UPDATED', 'COMPANY', company.name, { website, tax_info });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update company details' });
    }
}));
exports.default = router;
