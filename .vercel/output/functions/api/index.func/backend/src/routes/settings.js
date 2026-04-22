"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const prismaClient_1 = __importDefault(require("../lib/prismaClient"));
const activityLogger_1 = require("../services/activityLogger");
const router = express_1.default.Router();
// Get setting by key
router.get('/:key', async (req, res) => {
    try {
        const { key } = req.params;
        const setting = await prismaClient_1.default.companySetting.findUnique({
            where: { key }
        });
        if (!setting) {
            return res.status(404).json({ error: "Setting not found" });
        }
        res.json(setting.value);
    }
    catch (error) {
        console.error("Error fetching setting:", error);
        res.status(500).json({ error: "Failed to fetch setting" });
    }
});
// Create or Update setting by key
router.put('/:key', async (req, res) => {
    try {
        const { key } = req.params;
        const value = req.body; // Expect JSON payload representing the setting data
        const upsertedSetting = await prismaClient_1.default.companySetting.upsert({
            where: { key },
            update: { value },
            create: { key, value }
        });
        await (0, activityLogger_1.logActivity)(null, 'UPDATED', 'COMPANY_SETTING', key);
        res.json(upsertedSetting);
    }
    catch (error) {
        console.error("Error saving setting:", error);
        res.status(500).json({ error: "Failed to save setting" });
    }
});
exports.default = router;
//# sourceMappingURL=settings.js.map