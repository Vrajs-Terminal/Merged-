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
exports.deleteDevice = exports.updateDevice = exports.createDevice = exports.getDevices = void 0;
const prismaClient_1 = __importDefault(require("../lib/prismaClient"));
const getDevices = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const items = yield prismaClient_1.default.device.findMany({
            include: { branch: true }
        });
        res.json(items);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch devices" });
    }
});
exports.getDevices = getDevices;
const createDevice = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { deviceName, deviceId, branchId, locationName, ipAddress, departmentRestriction, status } = req.body;
        const item = yield prismaClient_1.default.device.create({
            data: {
                deviceName,
                deviceId,
                branchId: Number(branchId),
                locationName,
                ipAddress,
                departmentRestriction: departmentRestriction ? Number(departmentRestriction) : null,
                status: status || 'Active'
            }
        });
        res.status(201).json(item);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to create device" });
    }
});
exports.createDevice = createDevice;
const updateDevice = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { deviceName, deviceId, branchId, locationName, ipAddress, departmentRestriction, status } = req.body;
        const item = yield prismaClient_1.default.device.update({
            where: { id: Number(id) },
            data: Object.assign(Object.assign({ deviceName,
                deviceId }, (branchId ? { branchId: Number(branchId) } : {})), { locationName,
                ipAddress, departmentRestriction: departmentRestriction ? Number(departmentRestriction) : null, status })
        });
        res.json(item);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to update device" });
    }
});
exports.updateDevice = updateDevice;
const deleteDevice = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const item = yield prismaClient_1.default.device.delete({
            where: { id: Number(id) },
        });
        res.json({ message: "Device deleted successfully", item });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to delete device" });
    }
});
exports.deleteDevice = deleteDevice;
