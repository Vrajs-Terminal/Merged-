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
exports.saveOrderSettingsConfig = exports.getOrderSettingsConfig = exports.saveAppSettingsConfig = exports.getAppSettingsConfig = exports.saveAdminPermissionConfig = exports.getAdminPermissionConfig = exports.deleteAdminAccessRule = exports.createAdminAccessRule = exports.getAdminAccessRules = void 0;
const prismaClient_1 = __importDefault(require("../lib/prismaClient"));
const db = prismaClient_1.default;
const getAdminAccessRules = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const rules = yield db.adminAccessRule.findMany({ orderBy: { createdAt: "desc" } });
        res.status(200).json(rules);
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});
exports.getAdminAccessRules = getAdminAccessRules;
const createAdminAccessRule = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const rule = yield db.adminAccessRule.create({
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
});
exports.createAdminAccessRule = createAdminAccessRule;
const deleteAdminAccessRule = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield db.adminAccessRule.delete({ where: { id: Number(req.params.id) } });
        res.status(200).json({ message: "Rule deleted" });
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});
exports.deleteAdminAccessRule = deleteAdminAccessRule;
const getAdminPermissionConfig = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const key = "default";
        const record = yield db.adminPermissionSetting.findUnique({ where: { key } });
        res.status(200).json((record === null || record === void 0 ? void 0 : record.payload) || null);
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});
exports.getAdminPermissionConfig = getAdminPermissionConfig;
const saveAdminPermissionConfig = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const key = "default";
        const record = yield db.adminPermissionSetting.upsert({
            where: { key },
            update: { payload: req.body },
            create: { key, payload: req.body },
        });
        res.status(200).json(record.payload);
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});
exports.saveAdminPermissionConfig = saveAdminPermissionConfig;
const getAppSettingsConfig = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const key = "global";
        const record = yield db.appSettingsConfig.findUnique({ where: { key } });
        res.status(200).json((record === null || record === void 0 ? void 0 : record.payload) || null);
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});
exports.getAppSettingsConfig = getAppSettingsConfig;
const saveAppSettingsConfig = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const key = "global";
        const record = yield db.appSettingsConfig.upsert({
            where: { key },
            update: { payload: req.body },
            create: { key, payload: req.body },
        });
        res.status(200).json(record.payload);
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});
exports.saveAppSettingsConfig = saveAppSettingsConfig;
const getOrderSettingsConfig = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const key = "order-global";
        const record = yield db.appSettingsConfig.findUnique({ where: { key } });
        res.status(200).json((record === null || record === void 0 ? void 0 : record.payload) || null);
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});
exports.getOrderSettingsConfig = getOrderSettingsConfig;
const saveOrderSettingsConfig = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const key = "order-global";
        const record = yield db.appSettingsConfig.upsert({
            where: { key },
            update: { payload: req.body },
            create: { key, payload: req.body },
        });
        res.status(200).json(record.payload);
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});
exports.saveOrderSettingsConfig = saveOrderSettingsConfig;
