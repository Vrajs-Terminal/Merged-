"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rejectResignation = exports.approveResignation = exports.submitResignation = exports.getResignations = void 0;
const prismaClient_1 = __importDefault(require("../lib/prismaClient"));
const getResignations = async (req, res) => {
    try {
        const items = await prismaClient_1.default.resignation.findMany({
            include: { employee: true },
            orderBy: { createdAt: 'desc' }
        });
        res.json(items);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch resignations" });
    }
};
exports.getResignations = getResignations;
const submitResignation = async (req, res) => {
    try {
        const { employeeId, reason, noticePeriodDays } = req.body;
        const np = noticePeriodDays ? parseInt(noticePeriodDays) : 30;
        // Calculate estimated last working date
        const lwd = new Date();
        lwd.setDate(lwd.getDate() + np);
        const resignation = await prismaClient_1.default.resignation.create({
            data: {
                employeeId: parseInt(employeeId),
                reason,
                noticePeriod: np,
                lastWorkingDate: lwd,
                status: "Pending"
            }
        });
        res.status(201).json(resignation);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to submit resignation" });
    }
};
exports.submitResignation = submitResignation;
const approveResignation = async (req, res) => {
    try {
        const { id } = req.params;
        const resignationId = parseInt(id, 10);
        const { remarks, finalLastWorkingDate } = req.body;
        const resignation = await prismaClient_1.default.resignation.findUnique({
            where: { id: resignationId }
        });
        if (!resignation)
            return res.status(404).json({ error: "Not found" });
        const lwdDate = finalLastWorkingDate ? new Date(finalLastWorkingDate) : resignation.lastWorkingDate;
        const updated = await prismaClient_1.default.resignation.update({
            where: { id: resignationId },
            data: {
                status: "Approved",
                remarks,
                lastWorkingDate: lwdDate
            }
        });
        // Generate Offboarding record & Checklist natively!
        const existingOffboarding = await prismaClient_1.default.offboarding.findFirst({
            where: { employeeId: updated.employeeId }
        });
        if (!existingOffboarding) {
            const offboarding = await prismaClient_1.default.offboarding.create({
                data: {
                    employeeId: updated.employeeId,
                    lastWorkingDate: lwdDate,
                    reason: "Resignation Approved",
                    status: "Pending"
                }
            });
            const defaultTasks = [
                { department: "HR", taskName: "Final Settlement and Relieving Letter" },
                { department: "IT", taskName: "Laptop & Access Revocation" },
                { department: "Admin", taskName: "ID Card & Asset Return" },
                { department: "Finance", taskName: "Expense and Payroll Clearances" }
            ];
            await prismaClient_1.default.exitChecklist.createMany({
                data: defaultTasks.map(t => ({
                    offboardingId: offboarding.id,
                    department: t.department,
                    taskName: t.taskName,
                    status: "Pending"
                }))
            });
        }
        res.json(updated);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to approve resignation" });
    }
};
exports.approveResignation = approveResignation;
const rejectResignation = async (req, res) => {
    try {
        const { id } = req.params;
        const { remarks } = req.body;
        const updated = await prismaClient_1.default.resignation.update({
            where: { id: parseInt(id, 10) },
            data: { status: "Rejected", remarks }
        });
        res.json(updated);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to reject resignation" });
    }
};
exports.rejectResignation = rejectResignation;
//# sourceMappingURL=resignationController.js.map