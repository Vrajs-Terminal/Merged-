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
// Get setting by key
router.get('/:key', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { key } = req.params;
        const setting = yield prismaClient_1.default.companySetting.findUnique({
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
}));
// Create or Update setting by key
router.put('/:key', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { key } = req.params;
        const value = req.body; // Expect JSON payload representing the setting data
        const upsertedSetting = yield prismaClient_1.default.companySetting.upsert({
            where: { key },
            update: { value },
            create: { key, value }
        });
        yield (0, activityLogger_1.logActivity)(null, 'UPDATED', 'COMPANY_SETTING', key);
        res.json(upsertedSetting);
    }
    catch (error) {
        console.error("Error saving setting:", error);
        res.status(500).json({ error: "Failed to save setting" });
    }
}));
exports.default = router;
