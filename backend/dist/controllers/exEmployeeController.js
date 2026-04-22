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
exports.getExEmployeeById = exports.createExEmployee = exports.getExEmployees = void 0;
const prismaClient_1 = __importDefault(require("../lib/prismaClient"));
const getExEmployees = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const exEmployees = yield prismaClient_1.default.exEmployee.findMany();
        res.status(200).json(exEmployees);
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});
exports.getExEmployees = getExEmployees;
const createExEmployee = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = req.body;
        // ensure date parses correctly if provided as string
        if (data.exitDate)
            data.exitDate = new Date(data.exitDate);
        const exEmployee = yield prismaClient_1.default.exEmployee.create({
            data,
        });
        res.status(201).json(exEmployee);
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});
exports.createExEmployee = createExEmployee;
const getExEmployeeById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const exEmployee = yield prismaClient_1.default.exEmployee.findFirst({
            where: { employeeId: id },
        });
        if (!exEmployee) {
            res.status(404).json({ message: "ExEmployee not found" });
            return;
        }
        res.status(200).json(exEmployee);
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});
exports.getExEmployeeById = getExEmployeeById;
