"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteRequest = exports.updateRequestStatus = exports.createRequest = exports.getRequests = void 0;
const prismaClient_1 = __importDefault(require("../lib/prismaClient"));
const getRequests = async (req, res) => {
    try {
        const requests = await prismaClient_1.default.advanceSalaryRequest.findMany({
            include: {
                employee: { select: { id: true, firstName: true, lastName: true, employeeId: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(requests);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message || "Failed to fetch advance requests" });
    }
};
exports.getRequests = getRequests;
const createRequest = async (req, res) => {
    try {
        const { employeeId, requestedAmount, reason, attachment } = req.body;
        const request = await prismaClient_1.default.advanceSalaryRequest.create({
            data: {
                employee: { connect: { id: Number(employeeId) } },
                requestedAmount: Number(requestedAmount),
                reason,
                attachment,
                status: "Pending"
            }
        });
        res.status(201).json(request);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message || "Failed to submit request" });
    }
};
exports.createRequest = createRequest;
const updateRequestStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, adminRemark, approvedBy, givenMode, salaryMonth } = req.body;
        const request = await prismaClient_1.default.advanceSalaryRequest.findUnique({ where: { id: Number(id) } });
        if (!request)
            return res.status(404).json({ error: "Request not found" });
        if (request.status !== "Pending")
            return res.status(400).json({ error: "Request already processed" });
        await prismaClient_1.default.$transaction(async (tx) => {
            // Update request status
            await tx.advanceSalaryRequest.update({
                where: { id: Number(id) },
                data: {
                    status,
                    adminRemark,
                    approvedBy: approvedBy ? Number(approvedBy) : null,
                    approvalDate: new Date()
                }
            });
            // If approved, automatically create the AdvanceSalary record
            if (status === "Approved") {
                await tx.advanceSalary.create({
                    data: {
                        employee: { connect: { id: request.employeeId } },
                        amount: request.requestedAmount,
                        remainingAmount: request.requestedAmount,
                        salaryMonth: salaryMonth || new Date().toISOString().substring(0, 7),
                        givenDate: new Date(),
                        givenMode: givenMode || "Bank",
                        remark: `Approved from Request #${id}. ${adminRemark || ""}`,
                        status: "Pending"
                    }
                });
            }
        });
        res.json({ message: `Request successfully ${status === null || status === void 0 ? void 0 : status.toLowerCase()}` });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message || "Failed to process request" });
    }
};
exports.updateRequestStatus = updateRequestStatus;
const deleteRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const existing = await prismaClient_1.default.advanceSalaryRequest.findUnique({ where: { id: Number(id) } });
        if (!existing)
            return res.status(404).json({ error: "Not found" });
        if (existing.status === "Approved") {
            return res.status(400).json({ error: "Cannot delete an approved request" });
        }
        await prismaClient_1.default.advanceSalaryRequest.delete({ where: { id: Number(id) } });
        res.json({ message: "Deleted successfully" });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message || "Failed to delete request" });
    }
};
exports.deleteRequest = deleteRequest;
//# sourceMappingURL=advanceRequestController.js.map