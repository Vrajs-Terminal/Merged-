"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPromotion = exports.getPromotions = void 0;
const prismaClient_1 = __importDefault(require("../lib/prismaClient"));
const getPromotions = async (req, res) => {
    try {
        const promotions = await prismaClient_1.default.promotion.findMany({
            include: { employee: true },
            orderBy: { promotionDate: 'desc' }
        });
        res.json(promotions);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch promotions" });
    }
};
exports.getPromotions = getPromotions;
const createPromotion = async (req, res) => {
    try {
        const { employeeId, newDesignation, newLevelId, promotionDate, remarks } = req.body;
        const employee = await prismaClient_1.default.employee.findUnique({
            where: { id: parseInt(employeeId) }
        });
        if (!employee)
            return res.status(404).json({ error: "Employee not found" });
        const previousDesignation = employee.designation;
        const previousLevelId = employee.levelId;
        const promDate = promotionDate ? new Date(promotionDate) : new Date();
        // Transaction to update employee, create limit, update level history
        const result = await prismaClient_1.default.$transaction(async (tx) => {
            // 1. Create Promotion Record
            const promotion = await tx.promotion.create({
                data: {
                    employeeId: parseInt(employeeId),
                    promotionDate: promDate,
                    previousDesignation,
                    newDesignation: newDesignation || previousDesignation,
                    previousLevelId,
                    newLevelId: newLevelId ? parseInt(newLevelId) : previousLevelId,
                    remarks
                }
            });
            // 2. Update Employee
            await tx.employee.update({
                where: { id: parseInt(employeeId) },
                data: {
                    designation: newDesignation || previousDesignation,
                    levelId: newLevelId ? parseInt(newLevelId) : previousLevelId
                }
            });
            // 3. Update Level History if changed
            if (newLevelId && parseInt(newLevelId) !== previousLevelId) {
                // End previous level
                if (previousLevelId) {
                    const lastHistory = await tx.levelHistory.findFirst({
                        where: { employeeId: parseInt(employeeId), levelId: previousLevelId, effectiveTo: null },
                        orderBy: { effectiveFrom: 'desc' }
                    });
                    if (lastHistory) {
                        await tx.levelHistory.update({
                            where: { id: lastHistory.id },
                            data: { effectiveTo: promDate }
                        });
                    }
                }
                // Start new level
                await tx.levelHistory.create({
                    data: {
                        employeeId: parseInt(employeeId),
                        levelId: parseInt(newLevelId),
                        effectiveFrom: promDate,
                        remarks: `Promoted from ${previousDesignation || 'None'} to ${newDesignation || 'None'} - ${remarks || ''}`
                    }
                });
            }
            return promotion;
        });
        res.status(201).json(result);
    }
    catch (error) {
        console.error("Promotion Error:", error);
        res.status(500).json({ error: "Failed to create promotion" });
    }
};
exports.createPromotion = createPromotion;
//# sourceMappingURL=promotionController.js.map