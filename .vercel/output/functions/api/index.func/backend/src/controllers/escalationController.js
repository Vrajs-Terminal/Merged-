"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addReply = exports.updateStatus = exports.createEscalation = exports.getEscalationById = exports.getEscalations = void 0;
const prismaClient_1 = __importDefault(require("../lib/prismaClient"));
// Map from the global prisma instance to ensure correctness
// It seems prisma is imported from '../index', let's double check if there's a better one.
const getEscalations = async (req, res) => {
    try {
        const { status, priority, search } = req.query;
        const where = {};
        if (status && status !== 'All')
            where.status = status;
        if (priority && priority !== 'All')
            where.priority = priority;
        if (search) {
            const searchStr = search;
            where.OR = [
                { title: { contains: searchStr } },
                { description: { contains: searchStr } },
                { sender: { name: { contains: searchStr } } }
            ];
        }
        const escalations = await prismaClient_1.default.escalation.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            include: {
                sender: { select: { id: true, name: true, role: true } },
                receiver: { select: { id: true, name: true, role: true } },
                branch: { select: { id: true, name: true } },
                _count: { select: { replies: true } }
            }
        });
        res.json(escalations);
    }
    catch (error) {
        console.error("Error fetching escalations:", error);
        res.status(500).json({ error: "Failed to fetch escalations" });
    }
};
exports.getEscalations = getEscalations;
const getEscalationById = async (req, res) => {
    try {
        const { id } = req.params;
        const escalation = await prismaClient_1.default.escalation.findUnique({
            where: { id: Number(id) },
            include: {
                sender: { select: { id: true, name: true, role: true } },
                receiver: { select: { id: true, name: true, role: true } },
                branch: { select: { id: true, name: true } },
                attachments: true,
                replies: {
                    orderBy: { createdAt: 'asc' },
                    include: {
                        user: { select: { id: true, name: true, role: true } },
                        attachments: true
                    }
                }
            }
        });
        if (!escalation) {
            return res.status(404).json({ error: "Escalation not found" });
        }
        res.json(escalation);
    }
    catch (error) {
        console.error("Error fetching escalation:", error);
        res.status(500).json({ error: "Failed to fetch escalation" });
    }
};
exports.getEscalationById = getEscalationById;
const createEscalation = async (req, res) => {
    try {
        const { title, description, sender_id, receiver_id, branch_id, priority, category, attachments } = req.body;
        const escalation = await prismaClient_1.default.escalation.create({
            data: {
                title,
                description,
                sender_id: Number(sender_id),
                receiver_id: receiver_id ? Number(receiver_id) : null,
                branch_id: branch_id ? Number(branch_id) : null,
                priority: priority || 'Medium',
                category,
                attachments: attachments && attachments.length > 0 ? {
                    create: attachments.map((att) => ({
                        file_url: att.file_url,
                        name: att.name,
                        file_type: att.file_type
                    }))
                } : undefined
            }
        });
        res.status(201).json(escalation);
    }
    catch (error) {
        console.error("Error creating escalation:", error);
        res.status(500).json({ error: "Failed to create escalation" });
    }
};
exports.createEscalation = createEscalation;
const updateStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const escalation = await prismaClient_1.default.escalation.update({
            where: { id: Number(id) },
            data: { status }
        });
        res.json(escalation);
    }
    catch (error) {
        console.error("Error updating status:", error);
        res.status(500).json({ error: "Failed to update escalation status" });
    }
};
exports.updateStatus = updateStatus;
const addReply = async (req, res) => {
    try {
        const { id } = req.params;
        const { user_id, message, attachments } = req.body;
        const reply = await prismaClient_1.default.escalationReply.create({
            data: {
                escalation_id: Number(id),
                user_id: Number(user_id),
                message,
                attachments: attachments && attachments.length > 0 ? {
                    create: attachments.map((att) => ({
                        file_url: att.file_url,
                        name: att.name,
                        file_type: att.file_type
                    }))
                } : undefined
            },
            include: {
                user: { select: { id: true, name: true, role: true } },
                attachments: true
            }
        });
        // Update the reply_date on the main escalation
        await prismaClient_1.default.escalation.update({
            where: { id: Number(id) },
            data: { reply_date: new Date() }
        });
        res.status(201).json(reply);
    }
    catch (error) {
        console.error("Error adding reply:", error);
        res.status(500).json({ error: "Failed to add reply" });
    }
};
exports.addReply = addReply;
//# sourceMappingURL=escalationController.js.map