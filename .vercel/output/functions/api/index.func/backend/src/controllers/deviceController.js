"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteDevice = exports.updateDevice = exports.createDevice = exports.getDevices = void 0;
const prismaClient_1 = __importDefault(require("../lib/prismaClient"));
const getDevices = async (req, res) => {
    try {
        const items = await prismaClient_1.default.device.findMany({
            include: { branch: true }
        });
        res.json(items);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch devices" });
    }
};
exports.getDevices = getDevices;
const createDevice = async (req, res) => {
    try {
        const { deviceName, deviceId, branchId, locationName, ipAddress, departmentRestriction, status } = req.body;
        const item = await prismaClient_1.default.device.create({
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
};
exports.createDevice = createDevice;
const updateDevice = async (req, res) => {
    try {
        const { id } = req.params;
        const { deviceName, deviceId, branchId, locationName, ipAddress, departmentRestriction, status } = req.body;
        const item = await prismaClient_1.default.device.update({
            where: { id: Number(id) },
            data: {
                deviceName,
                deviceId,
                ...(branchId ? { branchId: Number(branchId) } : {}),
                locationName,
                ipAddress,
                departmentRestriction: departmentRestriction ? Number(departmentRestriction) : null,
                status
            }
        });
        res.json(item);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to update device" });
    }
};
exports.updateDevice = updateDevice;
const deleteDevice = async (req, res) => {
    try {
        const { id } = req.params;
        const item = await prismaClient_1.default.device.delete({
            where: { id: Number(id) },
        });
        res.json({ message: "Device deleted successfully", item });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to delete device" });
    }
};
exports.deleteDevice = deleteDevice;
//# sourceMappingURL=deviceController.js.map