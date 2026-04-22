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
exports.deleteEmployeeNominee = exports.bulkUploadNominees = exports.getEmployeeNominees = exports.addEmployeeNominee = exports.deleteNominationType = exports.updateNominationType = exports.getNominationTypes = exports.createNominationType = void 0;
const db_1 = __importDefault(require("../config/db"));
const prisma = (0, db_1.default)();
// ============================================
// Nomination Type (Master Setup)
// ============================================
const createNominationType = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, description, allowMultiple } = req.body;
        const type = yield prisma.nominationType.create({
            data: { name, description, allowMultiple },
        });
        res.status(201).json(type);
    }
    catch (error) {
        res.status(500).json({ message: "Error creating nomination type", error: error.message });
    }
});
exports.createNominationType = createNominationType;
const getNominationTypes = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const types = yield prisma.nominationType.findMany();
        res.status(200).json(types);
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching nomination types", error: error.message });
    }
});
exports.getNominationTypes = getNominationTypes;
const updateNominationType = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { name, description, allowMultiple } = req.body;
        const type = yield prisma.nominationType.update({
            where: { id: Number(id) },
            data: { name, description, allowMultiple },
        });
        res.status(200).json(type);
    }
    catch (error) {
        res.status(500).json({ message: "Error updating nomination type", error: error.message });
    }
});
exports.updateNominationType = updateNominationType;
const deleteNominationType = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        yield prisma.nominationType.delete({
            where: { id: Number(id) },
        });
        res.status(200).json({ message: "Deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ message: "Error deleting nomination type", error: error.message });
    }
});
exports.deleteNominationType = deleteNominationType;
// ============================================
// Manage Employees Nominee
// ============================================
const addEmployeeNominee = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { employeeId, nominationTypeId, nomineeName, relation, dob, aadharNumber, mobileNo, email, address, nomineePercentage } = req.body;
        // Check type multiple flag and percentages
        const nomType = yield prisma.nominationType.findUnique({ where: { id: Number(nominationTypeId) } });
        if (!nomType) {
            return res.status(404).json({ message: "Nomination type not found" });
        }
        const existingTypeNominees = yield prisma.employeeNominee.findMany({
            where: { employeeId: Number(employeeId), nominationTypeId: Number(nominationTypeId) }
        });
        if (!nomType.allowMultiple && existingTypeNominees.length > 0) {
            return res.status(400).json({ message: "This nomination type does not allow multiple nominees." });
        }
        let totalPercentage = existingTypeNominees.reduce((acc, curr) => acc + curr.nomineePercentage, 0);
        if (totalPercentage + Number(nomineePercentage) > 100) {
            return res.status(400).json({ message: "Total nominee percentage cannot exceed 100%." });
        }
        // Aadhar duplicate check per employee (globally across nominees if required by HR, but practically per person is fine, though we'll check globally because rule says so)
        const existingAadhar = yield prisma.employeeNominee.findFirst({ where: { aadharNumber } });
        if (existingAadhar) {
            return res.status(400).json({ message: "Aadhar number already exists for another nominee." });
        }
        const nominee = yield prisma.employeeNominee.create({
            data: {
                employeeId: Number(employeeId),
                nominationTypeId: Number(nominationTypeId),
                nomineeName,
                relation,
                dob: dob ? new Date(dob) : null,
                aadharNumber,
                mobileNo,
                email,
                address,
                nomineePercentage: Number(nomineePercentage),
            },
        });
        res.status(201).json(nominee);
    }
    catch (error) {
        res.status(500).json({ message: "Error adding nominee", error: error.message });
    }
});
exports.addEmployeeNominee = addEmployeeNominee;
const getEmployeeNominees = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const nominees = yield prisma.employeeNominee.findMany({
            include: {
                employee: {
                    select: { firstName: true, lastName: true, employeeId: true }
                },
                nominationType: true
            }
        });
        res.status(200).json(nominees);
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching nominees", error: error.message });
    }
});
exports.getEmployeeNominees = getEmployeeNominees;
const bulkUploadNominees = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { nominees } = req.body; // Expects an array of nominees parsed from Excel
        const errors = [];
        const successCount = 0;
        // Ideally, process inside a transaction or handle one by one to give detailed error rows
        for (const data of nominees) {
            try {
                const employee = yield prisma.employee.findUnique({ where: { employeeId: data.employeeId } });
                if (!employee)
                    throw new Error("Employee not found");
                const type = yield prisma.nominationType.findFirst({ where: { name: data.nominationType } });
                if (!type)
                    throw new Error("Nomination Type not found");
                yield prisma.employeeNominee.create({
                    data: {
                        employeeId: employee.id,
                        nominationTypeId: type.id,
                        nomineeName: data.nomineeName,
                        relation: data.relation,
                        aadharNumber: data.aadharNumber,
                        mobileNo: data.mobileNo,
                        nomineePercentage: Number(data.percentage),
                    }
                });
            }
            catch (e) {
                errors.push({ row: data, error: e.message });
            }
        }
        res.status(200).json({ message: "Bulk upload processed", errors });
    }
    catch (error) {
        res.status(500).json({ message: "Error processing bulk upload", error: error.message });
    }
});
exports.bulkUploadNominees = bulkUploadNominees;
const deleteEmployeeNominee = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        yield prisma.employeeNominee.delete({
            where: { id: Number(id) }
        });
        res.status(200).json({ message: "Nominee deleted" });
    }
    catch (error) {
        res.status(500).json({ message: "Error deleting nominee", error: error.message });
    }
});
exports.deleteEmployeeNominee = deleteEmployeeNominee;
