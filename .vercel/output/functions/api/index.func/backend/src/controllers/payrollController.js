"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePayrollRun = exports.getPayslips = exports.generatePayroll = exports.getPayrollRuns = void 0;
const prismaClient_1 = __importDefault(require("../lib/prismaClient"));
// Get Payroll Runs
const getPayrollRuns = async (req, res) => {
    try {
        const runs = await prismaClient_1.default.payrollRun.findMany({
            orderBy: [{ year: 'desc' }, { month: 'desc' }],
            include: {
                _count: {
                    select: { payslips: true }
                }
            }
        });
        res.json({ runs });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch payroll runs." });
    }
};
exports.getPayrollRuns = getPayrollRuns;
// Generate Payroll for a given month/year
const generatePayroll = async (req, res) => {
    const { month, year } = req.body;
    if (!month || !year) {
        res.status(400).json({ error: "Month and Year are required." });
        return;
    }
    try {
        // 1. Check if run already exists
        let run = await prismaClient_1.default.payrollRun.findUnique({
            where: { month_year: { month, year } }
        });
        if (run && run.status !== "Draft") {
            res.status(400).json({ error: "Payroll already processed or paid for this month." });
            return;
        }
        if (!run) {
            run = await prismaClient_1.default.payrollRun.create({
                data: { month, year, status: "Draft" }
            });
        }
        // 2. Fetch all active employees with Finance details
        const employees = await prismaClient_1.default.employee.findMany({
            where: { status: "Active" }
        });
        // Delete existing draft payslips for this run (for re-generation)
        await prismaClient_1.default.payslip.deleteMany({
            where: { payrollRunId: run.id }
        });
        let totalCost = 0;
        let processedCount = 0;
        // 3. Generate Payslips
        for (const emp of employees) {
            // Very simplified base salary calculation for prototype
            // In a real app we'd fetch this from the `Finance` table
            const financeRecord = await prismaClient_1.default.finance.findFirst({
                where: { employeeId: emp.employeeId }
            });
            // Default to 50k if no record exists for visual MVP
            const baseSalary = (financeRecord === null || financeRecord === void 0 ? void 0 : financeRecord.salary) || 50000;
            const basic = baseSalary * 0.40;
            const hra = baseSalary * 0.20;
            const allowances = baseSalary * 0.40;
            const pfDeduction = basic * 0.12; // 12% of basic
            const taxDeduction = baseSalary > 60000 ? (baseSalary * 0.10) : 0;
            const totalDeductions = pfDeduction + taxDeduction;
            const grossSalary = basic + hra + allowances;
            const netSalary = grossSalary - totalDeductions;
            await prismaClient_1.default.payslip.create({
                data: {
                    payrollRunId: run.id,
                    employeeId: emp.id,
                    basic,
                    hra,
                    allowances,
                    pfDeduction,
                    taxDeduction,
                    grossSalary,
                    totalDeductions,
                    netSalary,
                    status: "Generated"
                }
            });
            totalCost += netSalary;
            processedCount++;
        }
        // 4. Update Run Totals
        const updatedRun = await prismaClient_1.default.payrollRun.update({
            where: { id: run.id },
            data: {
                totalEmployees: processedCount,
                totalCost,
                status: "Processed",
                processedBy: req.user.id,
                processedAt: new Date()
            }
        });
        res.json({ message: "Payroll generated successfully.", run: updatedRun });
    }
    catch (error) {
        console.error("Payroll Generation Error:", error);
        res.status(500).json({ error: "Failed to generate payroll." });
    }
};
exports.generatePayroll = generatePayroll;
// Fetch payslips for a specific run
const getPayslips = async (req, res) => {
    try {
        const { runId } = req.params;
        const payslips = await prismaClient_1.default.payslip.findMany({
            where: { payrollRunId: parseInt(runId) },
            include: {
                employee: {
                    select: {
                        firstName: true,
                        lastName: true,
                        employeeId: true,
                        department: true
                    }
                }
            }
        });
        res.json({ payslips });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch payslips." });
    }
};
exports.getPayslips = getPayslips;
// Delete a payroll run
const deletePayrollRun = async (req, res) => {
    try {
        const { runId } = req.params;
        await prismaClient_1.default.payrollRun.delete({
            where: { id: parseInt(runId) }
        });
        res.json({ message: "Payroll run deleted." });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to delete payroll run." });
    }
};
exports.deletePayrollRun = deletePayrollRun;
//# sourceMappingURL=payrollController.js.map