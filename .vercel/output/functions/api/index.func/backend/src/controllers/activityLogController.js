"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createActivityLog = exports.getActivityLogs = void 0;
const prismaClient_1 = __importDefault(require("../lib/prismaClient"));
const db = prismaClient_1.default;
const getActivityLogs = async (_req, res) => {
    try {
        const logs = await db.activityLog.findMany({ orderBy: { dateTime: "desc" } });
        res.status(200).json(logs);
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
exports.getActivityLogs = getActivityLogs;
const createActivityLog = async (req, res) => {
    try {
        const log = await db.activityLog.create({
            data: {
                dateTime: req.body.dateTime ? new Date(req.body.dateTime) : undefined,
                user: req.body.user || "System",
                module: req.body.module || "General",
                action: req.body.action || "View",
                description: req.body.description,
                ip: req.body.ip,
                device: req.body.device,
                by: req.body.by,
            },
        });
        res.status(201).json(log);
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
exports.createActivityLog = createActivityLog;
//# sourceMappingURL=activityLogController.js.map