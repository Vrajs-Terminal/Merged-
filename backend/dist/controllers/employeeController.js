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
exports.getUpcomingRetirements = exports.reactivateEmployee = exports.disableEmployee = exports.updateEmployee = exports.createEmployee = exports.getEmployeeById = exports.getEmployees = void 0;
const prismaClient_1 = __importDefault(require("../lib/prismaClient"));
const activityLogger_1 = require("../services/activityLogger");
// Helper to convert frontend "YYYY-MM-DD" back to ISO-8601 for Prisma
const parseDates = (data) => {
    const dateFields = ["dob", "doj", "trainingCompletionDate", "permanentDate", "insuranceExpiry"];
    const parsed = Object.assign({}, data);
    dateFields.forEach(field => {
        const val = parsed[field];
        if (val && val !== "") {
            const date = new Date(val);
            parsed[field] = isNaN(date.getTime()) ? null : date;
        }
        else {
            parsed[field] = null;
        }
    });
    // Remove transient frontend fields if any
    delete parsed.countryCode;
    delete parsed.leaveGroup;
    delete parsed.multiLevelLeave;
    delete parsed.expenseApproval;
    delete parsed.active;
    // Social media fields are mapped to socialLinks
    delete parsed.facebook;
    delete parsed.linkedin;
    delete parsed.twitter;
    delete parsed.instagram;
    delete parsed.level;
    return parsed;
};
/* GET ALL ACTIVE EMPLOYEES */
const getEmployees = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const employees = yield prismaClient_1.default.employee.findMany({
            orderBy: { createdAt: "desc" },
        });
        res.status(200).json(employees);
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});
exports.getEmployees = getEmployees;
/* GET SINGLE EMPLOYEE */
const getEmployeeById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const employee = yield prismaClient_1.default.employee.findUnique({
            where: { employeeId: id },
        });
        if (!employee) {
            return res.status(404).json({ message: "Employee not found" });
        }
        res.status(200).json(employee);
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});
exports.getEmployeeById = getEmployeeById;
/* CREATE EMPLOYEE */
const createEmployee = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        console.log("CREATE EMPLOYEE REQUEST BODY:", req.body);
        const data = parseDates(req.body);
        console.log("PARSED DATA FOR PRISMA:", data);
        const activeEmployee = yield prismaClient_1.default.employee.findUnique({
            where: { employeeId: data.employeeId },
        });
        if (activeEmployee) {
            return res.status(400).json({ message: "Employee with this ID already exists." });
        }
        const employee = yield prismaClient_1.default.employee.create({
            data: data,
        });
        yield (0, activityLogger_1.logActivity)(((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) || null, 'ONBOARDED', 'EMPLOYEE', `${employee.firstName} ${employee.lastName}`, { employeeId: employee.id });
        res.status(201).json({ message: "Employee onboarded successfully", employee });
    }
    catch (error) {
        console.error("Create Employee Error:", error);
        res.status(500).json({ message: "Failed to create employee", error: error.message });
    }
});
exports.createEmployee = createEmployee;
/* UPDATE EMPLOYEE */
const updateEmployee = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { id } = req.params;
        console.log("UPDATE EMPLOYEE REQUEST BODY:", req.body);
        const data = parseDates(req.body);
        console.log("PARSED DATA FOR UPDATE:", data);
        const employee = yield prismaClient_1.default.employee.update({
            where: { employeeId: id },
            data: data,
        });
        yield (0, activityLogger_1.logActivity)(((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) || null, 'UPDATED', 'EMPLOYEE', `${employee.firstName} ${employee.lastName}`, { employeeId: employee.id });
        res.status(200).json({ message: "Employee updated successfully", employee });
    }
    catch (error) {
        res.status(500).json({ message: "Failed to update employee", error });
    }
});
exports.updateEmployee = updateEmployee;
/* DISABLE EMPLOYEE (SOFT DELETE) */
const disableEmployee = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { id } = req.params;
        // 1. Get Employee
        const emp = yield prismaClient_1.default.employee.findUnique({ where: { employeeId: id } });
        if (!emp)
            return res.status(404).json({ message: "Employee not found" });
        // 2. Change status
        const employee = yield prismaClient_1.default.employee.update({
            where: { employeeId: id },
            data: { status: "Ex-Employee" },
        });
        // 3. Move to ExEmployee table (create record)
        const activeEx = yield prismaClient_1.default.exEmployee.findFirst({ where: { employeeId: id } });
        if (!activeEx) {
            yield prismaClient_1.default.exEmployee.create({
                data: {
                    employeeId: emp.employeeId,
                    firstName: emp.firstName,
                    middleName: emp.middleName,
                    lastName: emp.lastName,
                    email: emp.email,
                    mobile: emp.mobile,
                    designation: emp.designation,
                    department: emp.department,
                    branch: emp.branch,
                    exitDate: new Date(),
                    reason: "Terminated/Disabled",
                    eligibleForRehire: true,
                }
            });
        }
        res.status(200).json({ message: "Employee disabled successfully", employee });
        yield (0, activityLogger_1.logActivity)(((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) || null, 'DISABLED', 'EMPLOYEE', `${employee.firstName} ${employee.lastName}`, { employeeId: employee.id });
    }
    catch (error) {
        res.status(500).json({ message: "Failed to disable employee", error });
    }
});
exports.disableEmployee = disableEmployee;
/* REACTIVATE EMPLOYEE */
const reactivateEmployee = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { id } = req.params;
        // 1. Update Employee status
        const employee = yield prismaClient_1.default.employee.update({
            where: { employeeId: id },
            data: { status: "Active" },
        });
        // 2. Remove from ExEmployee table
        yield prismaClient_1.default.exEmployee.deleteMany({
            where: { employeeId: id },
        });
        res.status(200).json({ message: "Employee reactivated successfully", employee });
        yield (0, activityLogger_1.logActivity)(((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) || null, 'REACTIVATED', 'EMPLOYEE', `${employee.firstName} ${employee.lastName}`, { employeeId: employee.id });
    }
    catch (error) {
        res.status(500).json({ message: "Failed to reactivate employee", error });
    }
});
exports.reactivateEmployee = reactivateEmployee;
/* GET UPCOMING RETIREMENTS */
const getUpcomingRetirements = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const employees = yield prismaClient_1.default.employee.findMany({
            where: {
                retirementAge: { not: null },
            },
        });
        // Filter calculation
        const upcoming = employees.filter((emp) => {
            const birth = new Date(emp.dob);
            const retirementDate = new Date(birth.setFullYear(birth.getFullYear() + emp.retirementAge));
            const diff = (retirementDate.getTime() - new Date().getTime()) / (1000 * 3600 * 24);
            return diff > 0 && diff <= 30 * 12; // Next 12 months
        });
        res.status(200).json(upcoming);
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});
exports.getUpcomingRetirements = getUpcomingRetirements;
