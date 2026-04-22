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
exports.createPromotion = exports.getPromotions = void 0;
const prismaClient_1 = __importDefault(require("../lib/prismaClient"));
const getPromotions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const promotions = yield prismaClient_1.default.promotion.findMany({
            include: { employee: true },
            orderBy: { promotionDate: 'desc' }
        });
        res.json(promotions);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch promotions" });
    }
});
exports.getPromotions = getPromotions;
const createPromotion = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { employeeId, newDesignation, newLevelId, promotionDate, remarks } = req.body;
        const employee = yield prismaClient_1.default.employee.findUnique({
            where: { id: parseInt(employeeId) }
        });
        if (!employee)
            return res.status(404).json({ error: "Employee not found" });
        const previousDesignation = employee.designation;
        const previousLevelId = employee.levelId;
        const promDate = promotionDate ? new Date(promotionDate) : new Date();
        // Transaction to update employee, create limit, update level history
        const result = yield prismaClient_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            // 1. Create Promotion Record
            const promotion = yield tx.promotion.create({
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
            yield tx.employee.update({
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
                    const lastHistory = yield tx.levelHistory.findFirst({
                        where: { employeeId: parseInt(employeeId), levelId: previousLevelId, effectiveTo: null },
                        orderBy: { effectiveFrom: 'desc' }
                    });
                    if (lastHistory) {
                        yield tx.levelHistory.update({
                            where: { id: lastHistory.id },
                            data: { effectiveTo: promDate }
                        });
                    }
                }
                // Start new level
                yield tx.levelHistory.create({
                    data: {
                        employeeId: parseInt(employeeId),
                        levelId: parseInt(newLevelId),
                        effectiveFrom: promDate,
                        remarks: `Promoted from ${previousDesignation || 'None'} to ${newDesignation || 'None'} - ${remarks || ''}`
                    }
                });
            }
            return promotion;
        }));
        res.status(201).json(result);
    }
    catch (error) {
        console.error("Promotion Error:", error);
        res.status(500).json({ error: "Failed to create promotion" });
    }
});
exports.createPromotion = createPromotion;
