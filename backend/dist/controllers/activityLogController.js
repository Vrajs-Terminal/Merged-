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
exports.createActivityLog = exports.getActivityLogs = void 0;
const prismaClient_1 = __importDefault(require("../lib/prismaClient"));
const db = prismaClient_1.default;
const getActivityLogs = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const logs = yield db.activityLog.findMany({ orderBy: { dateTime: "desc" } });
        res.status(200).json(logs);
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});
exports.getActivityLogs = getActivityLogs;
const createActivityLog = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const log = yield db.activityLog.create({
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
});
exports.createActivityLog = createActivityLog;
