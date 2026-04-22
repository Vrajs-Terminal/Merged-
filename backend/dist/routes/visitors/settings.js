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
const router = express_1.default.Router();
// GET all settings
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const settings = yield prismaClient_1.default.visitorSetting.findMany({
            orderBy: { key: 'asc' }
        });
        res.json(settings);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}));
// POST or PUT (Upsert) settings
router.post('/batch', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const settings = req.body;
        if (!Array.isArray(settings))
            return res.status(400).json({ message: 'Array of settings expected' });
        const operations = settings.map(s => prismaClient_1.default.visitorSetting.upsert({
            where: { key: s.key },
            update: { value: s.value, type: s.type || 'String' },
            create: { key: s.key, value: s.value, type: s.type || 'String' }
        }));
        const results = yield Promise.all(operations);
        res.json(results);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}));
// Initialize default settings if missing
router.post('/initialize-defaults', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const defaults = [
            { key: 'AUTO_REJECT_MINS', value: '120', type: 'Number' },
            { key: 'AUTO_HOLD_MINS', value: '30', type: 'Number' },
            { key: 'DEFAULT_APPROVAL_STATUS', value: 'Approved', type: 'String' },
            { key: 'VISITOR_ADDRESS_REQUIRED', value: 'No', type: 'Boolean' },
            { key: 'VISITOR_CITY_REQUIRED', value: 'Yes', type: 'Boolean' },
            { key: 'VISITOR_AREA_REQUIRED', value: 'No', type: 'Boolean' },
            { key: 'VISITOR_REASON_REQUIRED', value: 'Yes', type: 'Boolean' },
            { key: 'VISITOR_PHOTO_REQUIRED', value: 'Yes', type: 'Boolean' },
            { key: 'VEHICLE_NO_REQUIRED', value: 'No', type: 'Boolean' },
            { key: 'FACE_VERIFICATION_ENABLED', value: 'No', type: 'Boolean' }
        ];
        const operations = defaults.map(d => prismaClient_1.default.visitorSetting.upsert({
            where: { key: d.key },
            update: {}, // don't overwrite if already exists
            create: d
        }));
        yield Promise.all(operations);
        res.json({ message: 'Default settings initialized' });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}));
exports.default = router;
