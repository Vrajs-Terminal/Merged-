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
exports.getUpcomingRetirements = void 0;
const prismaClient_1 = __importDefault(require("../lib/prismaClient"));
const getUpcomingRetirements = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const { timeframe, branchId, departmentId, search } = req.query;
        // timeframe in months (e.g., 1, 3, 6, 12, or all)
        // Find all active employees that have DOB
        const filters = {
            status: "Active",
            dob: { not: null },
            retirementAge: { not: null }
        };
        if (branchId)
            filters.branchId = parseInt(branchId);
        if (departmentId)
            filters.departmentId = parseInt(departmentId);
        if (search) {
            filters.OR = [
                { firstName: { contains: search } },
                { lastName: { contains: search } },
                { employeeId: { contains: search } }
            ];
        }
        const employees = yield prismaClient_1.default.employee.findMany({
            where: filters,
            include: {
                branchRef: true,
                departmentRef: true,
                designationRef: true
            }
        });
        const now = new Date();
        const upcomingRetirements = [];
        for (const emp of employees) {
            if (!emp.dob || !emp.retirementAge)
                continue;
            // Calculate Retirement Date
            const retirementDate = new Date(emp.dob);
            retirementDate.setFullYear(retirementDate.getFullYear() + emp.retirementAge);
            // Calculate Days Until Retirement
            const timeDiff = retirementDate.getTime() - now.getTime();
            const daysUntil = Math.ceil(timeDiff / (1000 * 3600 * 24));
            // Not yet retired and within our bounds
            if (daysUntil >= 0) {
                // If timeframe is provided, filter
                if (timeframe) {
                    const maxDays = parseInt(timeframe) * 30; // approx
                    if (daysUntil > maxDays)
                        continue;
                }
                upcomingRetirements.push({
                    id: emp.id,
                    employeeId: emp.employeeId,
                    name: `${emp.firstName} ${emp.lastName || ''}`.trim(),
                    designation: ((_a = emp.designationRef) === null || _a === void 0 ? void 0 : _a.designationName) || emp.designation || "—",
                    department: ((_b = emp.departmentRef) === null || _b === void 0 ? void 0 : _b.departmentName) || emp.department || "—",
                    branch: ((_c = emp.branchRef) === null || _c === void 0 ? void 0 : _c.branchName) || emp.branch || "—",
                    dob: emp.dob,
                    retirementAge: emp.retirementAge,
                    retirementDate,
                    daysUntil
                });
            }
        }
        // Sort by days until retirement (soonest first)
        upcomingRetirements.sort((a, b) => a.daysUntil - b.daysUntil);
        res.json(upcomingRetirements);
    }
    catch (error) {
        console.error("Error fetching retirements:", error);
        res.status(500).json({ error: "Failed to fetch upcoming retirements" });
    }
});
exports.getUpcomingRetirements = getUpcomingRetirements;
