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
// Get all email settings
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const settings = yield prismaClient_1.default.dailyAttendanceEmail.findMany({
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
}));
// Create a new email setting
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { report_name, recipient_type, filter_value, schedule_time, email_template, status } = req.body;
        const newSetting = yield prismaClient_1.default.dailyAttendanceEmail.create({
            data: {
                report_name,
                recipient_type: recipient_type || "Manager",
                filter_value,
                schedule_time,
                email_template,
                status: status || "Active"
            }
        });
        yield (0, activityLogger_1.logActivity)(null, 'CREATED', 'ATTENDANCE_EMAIL_SETTING', report_name);
        res.status(201).json(newSetting);
    }
    catch (error) {
        console.error("Error creating email setting:", error);
        res.status(500).json({ error: "Failed to create email setting" });
    }
}));
// Update an email setting
router.put('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { report_name, recipient_type, filter_value, schedule_time, email_template, status } = req.body;
        const updatedSetting = yield prismaClient_1.default.dailyAttendanceEmail.update({
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
        yield (0, activityLogger_1.logActivity)(null, 'UPDATED', 'ATTENDANCE_EMAIL_SETTING', report_name);
        res.json(updatedSetting);
    }
    catch (error) {
        console.error("Error updating email setting:", error);
        res.status(500).json({ error: "Failed to update email setting" });
    }
}));
// Delete an email setting
router.delete('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const setting = yield prismaClient_1.default.dailyAttendanceEmail.findUnique({ where: { id: parseInt(id) } });
        yield prismaClient_1.default.dailyAttendanceEmail.delete({
            where: { id: parseInt(id) }
        });
        if (setting) {
            yield (0, activityLogger_1.logActivity)(null, 'DELETED', 'ATTENDANCE_EMAIL_SETTING', setting.report_name);
        }
        res.status(204).send();
    }
    catch (error) {
        console.error("Error deleting email setting:", error);
        res.status(500).json({ error: "Failed to delete email setting" });
    }
}));
exports.default = router;
