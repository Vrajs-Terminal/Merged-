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
const express_1 = __importDefault(require("express"));
const prismaClient_1 = __importDefault(require("../lib/prismaClient"));
const activityLogger_1 = require("../services/activityLogger");
const router = express_1.default.Router();
const SETTINGS_KEY = 'payroll_tax_settings';
// GET /api/payroll-settings — Fetch all payroll & tax settings
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const setting = yield prismaClient_1.default.companySetting.findUnique({
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
    }
    catch (error) {
        console.error("Error fetching payroll settings:", error);
        res.status(500).json({ error: "Failed to fetch payroll settings" });
    }
}));
// PUT /api/payroll-settings — Save all payroll & tax settings
router.put('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const value = req.body;
        const upsertedSetting = yield prismaClient_1.default.companySetting.upsert({
            where: { key: SETTINGS_KEY },
            update: { value },
            create: { key: SETTINGS_KEY, value }
        });
        yield (0, activityLogger_1.logActivity)(null, 'UPDATED', 'PAYROLL_SETTINGS', 'Payroll & Tax Settings');
        res.json(upsertedSetting.value);
    }
    catch (error) {
        console.error("Error saving payroll settings:", error);
        res.status(500).json({ error: "Failed to save payroll settings" });
    }
}));
exports.default = router;
