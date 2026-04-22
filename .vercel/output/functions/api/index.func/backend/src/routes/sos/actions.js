"use strict";
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
router.post('/:id/resolve', async (req, res) => {
    try {
        const id = Number(req.params.id);
        const updated = await prismaClient_1.default.sosAlert.update({
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
});
/**
 * POST close an SOS alert
 */
router.post('/:id/close', async (req, res) => {
    try {
        const id = Number(req.params.id);
        const updated = await prismaClient_1.default.sosAlert.update({
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
});
exports.default = router;
//# sourceMappingURL=actions.js.map