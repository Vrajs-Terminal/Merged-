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
const prismaClient_1 = __importDefault(require("../../lib/prismaClient"));
const activityLogger_1 = require("../../services/activityLogger");
const router = express_1.default.Router();
// GET / — Get current gratuity settings
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const settings = yield prismaClient_1.default.gratuitySetting.findFirst();
        res.json(settings || {
            enabled: false,
            min_service_years: 5,
            formula: "(Last Drawn Salary * 15 * Number of Completed Years) / 26",
            included_components: [],
            max_limit: 2000000,
            round_off: true,
            applicable_on_resignation: true,
            auto_calculate_fnf: true
        });
    }
    catch (error) {
        console.error("Error fetching gratuity settings:", error);
        res.status(500).json({ error: "Failed to fetch gratuity settings" });
    }
}));
// POST / — Upsert gratuity settings
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = req.body;
        const existing = yield prismaClient_1.default.gratuitySetting.findFirst();
        let result;
        if (existing) {
            result = yield prismaClient_1.default.gratuitySetting.update({
                where: { id: existing.id },
                data
            });
        }
        else {
            result = yield prismaClient_1.default.gratuitySetting.create({
                data
            });
        }
        yield (0, activityLogger_1.logActivity)(null, existing ? 'UPDATED' : 'CREATED', 'GRATUITY_SETTINGS', 'Global Configuration');
        res.json(result);
    }
    catch (error) {
        console.error("Error saving gratuity settings:", error);
        res.status(500).json({ error: "Failed to save gratuity settings" });
    }
}));
exports.default = router;
