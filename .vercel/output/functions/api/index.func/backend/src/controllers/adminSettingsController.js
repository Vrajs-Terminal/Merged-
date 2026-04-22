"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveOrderSettingsConfig = exports.getOrderSettingsConfig = exports.saveAppSettingsConfig = exports.getAppSettingsConfig = exports.saveAdminPermissionConfig = exports.getAdminPermissionConfig = exports.deleteAdminAccessRule = exports.createAdminAccessRule = exports.getAdminAccessRules = void 0;
const prismaClient_1 = __importDefault(require("../lib/prismaClient"));
const db = prismaClient_1.default;
const getAdminAccessRules = async (_req, res) => {
    try {
        const rules = await db.adminAccessRule.findMany({ orderBy: { createdAt: "desc" } });
        res.status(200).json(rules);
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
exports.getAdminAccessRules = getAdminAccessRules;
const createAdminAccessRule = async (req, res) => {
    try {
        const rule = await db.adminAccessRule.create({
            data: {
                employeeName: req.body.employeeName,
                designation: req.body.designation,
                parentModule: req.body.parentModule,
                submodule: req.body.submodule,
                accessFor: req.body.accessFor,
                accessMode: req.body.accessMode,
                teamRequestNeeded: Boolean(req.body.teamRequestNeeded),
            },
        });
        res.status(201).json(rule);
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
exports.createAdminAccessRule = createAdminAccessRule;
const deleteAdminAccessRule = async (req, res) => {
    try {
        await db.adminAccessRule.delete({ where: { id: Number(req.params.id) } });
        res.status(200).json({ message: "Rule deleted" });
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
exports.deleteAdminAccessRule = deleteAdminAccessRule;
const getAdminPermissionConfig = async (_req, res) => {
    try {
        const key = "default";
        const record = await db.adminPermissionSetting.findUnique({ where: { key } });
        res.status(200).json((record === null || record === void 0 ? void 0 : record.payload) || null);
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
exports.getAdminPermissionConfig = getAdminPermissionConfig;
const saveAdminPermissionConfig = async (req, res) => {
    try {
        const key = "default";
        const record = await db.adminPermissionSetting.upsert({
            where: { key },
            update: { payload: req.body },
            create: { key, payload: req.body },
        });
        res.status(200).json(record.payload);
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
exports.saveAdminPermissionConfig = saveAdminPermissionConfig;
const getAppSettingsConfig = async (_req, res) => {
    try {
        const key = "global";
        const record = await db.appSettingsConfig.findUnique({ where: { key } });
        res.status(200).json((record === null || record === void 0 ? void 0 : record.payload) || null);
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
exports.getAppSettingsConfig = getAppSettingsConfig;
const saveAppSettingsConfig = async (req, res) => {
    try {
        const key = "global";
        const record = await db.appSettingsConfig.upsert({
            where: { key },
            update: { payload: req.body },
            create: { key, payload: req.body },
        });
        res.status(200).json(record.payload);
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
exports.saveAppSettingsConfig = saveAppSettingsConfig;
const getOrderSettingsConfig = async (_req, res) => {
    try {
        const key = "order-global";
        const record = await db.appSettingsConfig.findUnique({ where: { key } });
        res.status(200).json((record === null || record === void 0 ? void 0 : record.payload) || null);
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
exports.getOrderSettingsConfig = getOrderSettingsConfig;
const saveOrderSettingsConfig = async (req, res) => {
    try {
        const key = "order-global";
        const record = await db.appSettingsConfig.upsert({
            where: { key },
            update: { payload: req.body },
            create: { key, payload: req.body },
        });
        res.status(200).json(record.payload);
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
exports.saveOrderSettingsConfig = saveOrderSettingsConfig;
//# sourceMappingURL=adminSettingsController.js.map