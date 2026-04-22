"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const prismaClient_1 = __importDefault(require("../../lib/prismaClient"));
const router = express_1.default.Router();
// GET all receipt emails
router.get('/', async (req, res) => {
    try {
        const emails = await prismaClient_1.default.complaintEmail.findMany({
            orderBy: { email: 'asc' }
        });
        res.json(emails);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});
// POST add email
router.post('/', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email)
            return res.status(400).json({ message: 'Email is required' });
        const count = await prismaClient_1.default.complaintEmail.count();
        if (count >= 10)
            return res.status(400).json({ message: 'Maximum 10 email recipients allowed' });
        const newEmail = await prismaClient_1.default.complaintEmail.create({
            data: { email }
        });
        res.status(201).json(newEmail);
    }
    catch (err) {
        if (err.code === 'P2002') {
            return res.status(400).json({ message: 'Email already exists' });
        }
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});
// DELETE email
router.delete('/:id', async (req, res) => {
    try {
        await prismaClient_1.default.complaintEmail.delete({ where: { id: Number(req.params.id) } });
        res.json({ message: 'Deleted successfully' });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});
exports.default = router;
//# sourceMappingURL=config.js.map