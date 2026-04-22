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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.returnAdvanceSalary = exports.deleteAdvanceSalary = exports.updateAdvanceSalary = exports.createBulkAdvanceSalary = exports.createAdvanceSalary = exports.getAdvanceSalaries = void 0;
const prismaClient_1 = __importDefault(require("../lib/prismaClient"));
const getAdvanceSalaries = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const advances = yield prismaClient_1.default.advanceSalary.findMany({
            include: {
                employee: { select: { id: true, firstName: true, lastName: true, employeeId: true } },
                returns: true
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(advances);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message || "Failed to fetch advance salaries" });
    }
});
exports.getAdvanceSalaries = getAdvanceSalaries;
const createAdvanceSalary = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const _a = req.body, { employeeId, amount, givenDate } = _a, rest = __rest(_a, ["employeeId", "amount", "givenDate"]);
        // Prisma requires full ISO-8601 DateTime — convert "YYYY-MM-DD" to Date object
        const parsedGivenDate = givenDate ? new Date(givenDate + "T00:00:00.000Z") : new Date();
        const advance = yield prismaClient_1.default.advanceSalary.create({
            data: Object.assign(Object.assign({}, rest), { employee: { connect: { id: Number(employeeId) } }, amount: Number(amount), remainingAmount: Number(amount), givenDate: parsedGivenDate })
        });
        res.status(201).json(advance);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message || "Failed to create advance salary" });
    }
});
exports.createAdvanceSalary = createAdvanceSalary;
const createBulkAdvanceSalary = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { employees, amount, salaryMonth, givenDate, givenMode, remark } = req.body;
        if (!Array.isArray(employees) || employees.length === 0) {
            return res.status(400).json({ error: "No employees selected" });
        }
        // Use async callback-style transaction for TiDB compatibility
        const results = [];
        yield prismaClient_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            for (const empId of employees) {
                const record = yield tx.advanceSalary.create({
                    data: {
                        employee: { connect: { id: Number(empId) } },
                        amount: Number(amount),
                        remainingAmount: Number(amount),
                        salaryMonth,
                        givenDate: new Date(givenDate),
                        givenMode: givenMode || "Bank",
                        remark: remark || "",
                        status: "Pending"
                    }
                });
                results.push(record);
            }
        }));
        res.status(201).json({ message: "Bulk assigned successfully", count: results.length });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message || "Failed to create bulk advances" });
    }
});
exports.createBulkAdvanceSalary = createBulkAdvanceSalary;
const updateAdvanceSalary = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const _a = req.body, { amount } = _a, rest = __rest(_a, ["amount"]);
        const existing = yield prismaClient_1.default.advanceSalary.findUnique({ where: { id: Number(id) } });
        if (!existing)
            return res.status(404).json({ error: "Not found" });
        // Calculate new remaining amount if amount changes
        const amountDiff = Number(amount) - existing.amount;
        const newRemaining = existing.remainingAmount + amountDiff;
        const advance = yield prismaClient_1.default.advanceSalary.update({
            where: { id: Number(id) },
            data: Object.assign(Object.assign({}, rest), { amount: Number(amount), remainingAmount: newRemaining >= 0 ? newRemaining : 0, status: newRemaining <= 0 ? "Returned" : existing.status })
        });
        res.json(advance);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message || "Failed to update advance salary" });
    }
});
exports.updateAdvanceSalary = updateAdvanceSalary;
const deleteAdvanceSalary = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        yield prismaClient_1.default.advanceSalary.delete({ where: { id: Number(id) } });
        res.json({ message: "Deleted successfully" });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message || "Failed to delete advance salary" });
    }
});
exports.deleteAdvanceSalary = deleteAdvanceSalary;
const returnAdvanceSalary = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { amount, returnDate, remark, adjustedInPayroll } = req.body;
        const advance = yield prismaClient_1.default.advanceSalary.findUnique({ where: { id: Number(id) } });
        if (!advance)
            return res.status(404).json({ error: "Advance record not found" });
        if (advance.remainingAmount <= 0)
            return res.status(400).json({ error: "Already fully returned" });
        const returnAmt = Number(amount);
        if (returnAmt > advance.remainingAmount)
            return res.status(400).json({ error: "Return amount exceeds remaining amount" });
        yield prismaClient_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            // 1. Create return record
            yield tx.advanceSalaryReturn.create({
                data: {
                    advance: { connect: { id: Number(id) } },
                    amount: returnAmt,
                    returnDate: new Date(returnDate),
                    remark,
                    adjustedInPayroll: adjustedInPayroll || false
                }
            });
            // 2. Update remaining balance and status
            const newRemaining = advance.remainingAmount - returnAmt;
            yield tx.advanceSalary.update({
                where: { id: Number(id) },
                data: {
                    remainingAmount: newRemaining,
                    status: newRemaining === 0 ? "Returned" : "Pending"
                }
            });
        }));
        res.json({ message: "Return processed successfully" });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message || "Failed to process return" });
    }
});
exports.returnAdvanceSalary = returnAdvanceSalary;
