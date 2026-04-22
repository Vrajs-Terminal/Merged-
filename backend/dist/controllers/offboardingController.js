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
exports.cancelOffboarding = exports.updateChecklist = exports.initiateOffboarding = exports.getOffboardings = void 0;
const prismaClient_1 = __importDefault(require("../lib/prismaClient"));
// GET ALL OFFBOARDING RECORDS
const getOffboardings = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const offboardings = yield prismaClient_1.default.offboarding.findMany({
            include: {
                employee: true,
                checklists: true,
            },
            orderBy: { createdAt: 'desc' }
        });
        res.status(200).json(offboardings);
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});
exports.getOffboardings = getOffboardings;
// INITIATE OFFBOARDING
const initiateOffboarding = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { employeeDbId, lastWorkingDate, reason } = req.body;
        if (!employeeDbId) {
            return res.status(400).json({ message: "Employee ID is required" });
        }
        // Check if already offboarding
        const existing = yield prismaClient_1.default.offboarding.findFirst({
            where: { employeeId: employeeDbId }
        });
        if (existing) {
            return res.status(400).json({ message: "Employee is already in offboarding process." });
        }
        // Create Offboarding Parent
        const offboarding = yield prismaClient_1.default.offboarding.create({
            data: {
                employeeId: employeeDbId,
                lastWorkingDate: lastWorkingDate ? new Date(lastWorkingDate) : null,
                reason,
                status: "Pending"
            }
        });
        // Spawn default checklist items
        const defaultTasks = [
            { department: "HR", taskName: "Final Settlement and Relieving Letter" },
            { department: "IT", taskName: "Laptop & Access Revocation" },
            { department: "Admin", taskName: "ID Card & Asset Return" },
            { department: "Finance", taskName: "Expense and Payroll Clearances" }
        ];
        yield prismaClient_1.default.exitChecklist.createMany({
            data: defaultTasks.map(t => ({
                offboardingId: offboarding.id,
                department: t.department,
                taskName: t.taskName,
                status: "Pending"
            }))
        });
        res.status(201).json({ message: "Offboarding Initiated", offboarding });
    }
    catch (error) {
        console.error("Initiate Offboarding Error:", error);
        res.status(500).json({ message: "Server error", error });
    }
});
exports.initiateOffboarding = initiateOffboarding;
// UPDATE CHECKLIST STATUS
const updateChecklist = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { checklistId } = req.params;
        const { status } = req.body; // "Pending" or "Completed"
        const updated = yield prismaClient_1.default.exitChecklist.update({
            where: { id: parseInt(checklistId) },
            data: {
                status,
                completionDate: status === 'Completed' ? new Date() : null
            }
        });
        // Check if all checklists are completed to auto-complete the offboarding
        const allChecklists = yield prismaClient_1.default.exitChecklist.findMany({
            where: { offboardingId: updated.offboardingId }
        });
        if (allChecklists.every((c) => c.status === "Completed")) {
            yield prismaClient_1.default.offboarding.update({
                where: { id: updated.offboardingId },
                data: { status: "Completed" }
            });
        }
        else {
            // Keep it pending if one is reversed
            yield prismaClient_1.default.offboarding.update({
                where: { id: updated.offboardingId },
                data: { status: "Pending" }
            });
        }
        res.status(200).json(updated);
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});
exports.updateChecklist = updateChecklist;
// DELETE OFFBOARDING (Cancel)
const cancelOffboarding = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        // Delete child checklists first
        yield prismaClient_1.default.exitChecklist.deleteMany({
            where: { offboardingId: parseInt(id) }
        });
        yield prismaClient_1.default.offboarding.delete({
            where: { id: parseInt(id) }
        });
        res.status(200).json({ message: "Offboarding cancelled successfully." });
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});
exports.cancelOffboarding = cancelOffboarding;
