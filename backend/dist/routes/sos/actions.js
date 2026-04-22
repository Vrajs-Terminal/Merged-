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
/**
 * POST resolve an SOS alert
 */
router.post('/:id/resolve', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = Number(req.params.id);
        const updated = yield prismaClient_1.default.sosAlert.update({
            where: { id },
            data: {
                status: 'Resolved',
                resolvedAt: new Date()
            }
        });
        res.json(updated);
    }
    catch (err) {
        console.error('Resolve SOS Alert Error:', err);
        res.status(500).json({ error: 'Failed to resolve SOS alert' });
    }
}));
/**
 * POST close an SOS alert
 */
router.post('/:id/close', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = Number(req.params.id);
        const updated = yield prismaClient_1.default.sosAlert.update({
            where: { id },
            data: {
                status: 'Closed',
                closedAt: new Date()
            }
        });
        res.json(updated);
    }
    catch (err) {
        console.error('Close SOS Alert Error:', err);
        res.status(500).json({ error: 'Failed to close SOS alert' });
    }
}));
exports.default = router;
