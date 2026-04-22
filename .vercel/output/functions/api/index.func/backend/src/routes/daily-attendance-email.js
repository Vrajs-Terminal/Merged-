"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const prismaClient_1 = __importDefault(require("../lib/prismaClient"));
const activityLogger_1 = require("../services/activityLogger");
const router = express_1.default.Router();
// Get all email settings
router.get('/', async (req, res) => {
    try {
        const settings = await prismaClient_1.default.dailyAttendanceEmail.findMany({
            orderBy: {
                createdAt: 'desc'
            }
        });
        res.json(settings);
    }
    catch (error) {
        console.error("Error fetching daily attendance email settings:", error);
        res.status(500).json({ error: "Failed to fetch email settings" });
    }
});
// Create a new email setting
router.post('/', async (req, res) => {
    try {
        const { report_name, recipient_type, filter_value, schedule_time, email_template, status } = req.body;
        const newSetting = await prismaClient_1.default.dailyAttendanceEmail.create({
            data: {
                report_name,
                recipient_type: recipient_type || "Manager",
                filter_value,
                schedule_time,
                email_template,
                status: status || "Active"
            }
        });
        await (0, activityLogger_1.logActivity)(null, 'CREATED', 'ATTENDANCE_EMAIL_SETTING', report_name);
        res.status(201).json(newSetting);
    }
    catch (error) {
        console.error("Error creating email setting:", error);
        res.status(500).json({ error: "Failed to create email setting" });
    }
});
// Update an email setting
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { report_name, recipient_type, filter_value, schedule_time, email_template, status } = req.body;
        const updatedSetting = await prismaClient_1.default.dailyAttendanceEmail.update({
            where: { id: parseInt(id) },
            data: {
                report_name,
                recipient_type,
                filter_value,
                schedule_time,
                email_template,
                status
            }
        });
        await (0, activityLogger_1.logActivity)(null, 'UPDATED', 'ATTENDANCE_EMAIL_SETTING', report_name);
        res.json(updatedSetting);
    }
    catch (error) {
        console.error("Error updating email setting:", error);
        res.status(500).json({ error: "Failed to update email setting" });
    }
});
// Delete an email setting
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const setting = await prismaClient_1.default.dailyAttendanceEmail.findUnique({ where: { id: parseInt(id) } });
        await prismaClient_1.default.dailyAttendanceEmail.delete({
            where: { id: parseInt(id) }
        });
        if (setting) {
            await (0, activityLogger_1.logActivity)(null, 'DELETED', 'ATTENDANCE_EMAIL_SETTING', setting.report_name);
        }
        res.status(204).send();
    }
    catch (error) {
        console.error("Error deleting email setting:", error);
        res.status(500).json({ error: "Failed to delete email setting" });
    }
});
exports.default = router;
//# sourceMappingURL=daily-attendance-email.js.map