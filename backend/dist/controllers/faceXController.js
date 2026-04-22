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
exports.updateFaceAppSettings = exports.getFaceAppSettings = exports.handleFaceChangeRequest = exports.getFaceChangeRequests = exports.deleteUserFaceData = exports.getUserFaceData = exports.updateDeviceStatus = exports.getFaceAppDevices = exports.toggleFaceAppAdminStatus = exports.deleteFaceAppAdmin = exports.generateFaceAppAdmin = exports.getFaceAppAdmins = void 0;
const prismaClient_1 = __importDefault(require("../lib/prismaClient"));
// --- Face App Admin ---
const getFaceAppAdmins = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const admins = yield prismaClient_1.default.faceAppAdmin.findMany({
            include: { manager: true },
            orderBy: { createdAt: "desc" }
        });
        res.status(200).json(admins);
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching admins", error: error.message });
    }
});
exports.getFaceAppAdmins = getFaceAppAdmins;
const generateFaceAppAdmin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { managerId } = req.body;
        const manager = yield prismaClient_1.default.manager.findUnique({ where: { id: parseInt(managerId) } });
        if (!manager)
            return res.status(404).json({ message: "Manager not found" });
        const username = `FACEX_${(_a = manager.name) === null || _a === void 0 ? void 0 : _a.replace(/\s+/g, '').toUpperCase()}_${Math.floor(1000 + Math.random() * 9000)}`;
        const password = Math.random().toString(36).slice(-8).toUpperCase();
        const admin = yield prismaClient_1.default.faceAppAdmin.create({
            data: {
                managerId: parseInt(managerId),
                username,
                password,
                status: "Active"
            }
        });
        res.status(201).json({ message: "Admin created successfully", admin });
    }
    catch (error) {
        res.status(500).json({ message: "Error creating admin", error: error.message });
    }
});
exports.generateFaceAppAdmin = generateFaceAppAdmin;
const deleteFaceAppAdmin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        yield prismaClient_1.default.faceAppAdmin.delete({ where: { id: parseInt(id) } });
        res.status(200).json({ message: "Admin deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ message: "Error deleting admin", error: error.message });
    }
});
exports.deleteFaceAppAdmin = deleteFaceAppAdmin;
const toggleFaceAppAdminStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const admin = yield prismaClient_1.default.faceAppAdmin.findUnique({ where: { id: parseInt(id) } });
        if (!admin)
            return res.status(404).json({ message: "Admin not found" });
        const updated = yield prismaClient_1.default.faceAppAdmin.update({
            where: { id: parseInt(id) },
            data: { status: admin.status === "Active" ? "Inactive" : "Active" }
        });
        res.status(200).json(updated);
    }
    catch (error) {
        res.status(500).json({ message: "Error toggling status", error: error.message });
    }
});
exports.toggleFaceAppAdminStatus = toggleFaceAppAdminStatus;
// --- Face App Device ---
const getFaceAppDevices = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { search, page = "1", limit = "25" } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const where = {};
        if (search) {
            where.OR = [
                { deviceId: { contains: search } },
                { deviceMac: { contains: search } },
                { deviceModel: { contains: search } }
            ];
        }
        const [devices, total] = yield Promise.all([
            prismaClient_1.default.faceAppDevice.findMany({
                where,
                include: { branch: true, admin: true },
                skip,
                take: parseInt(limit),
                orderBy: { createdAt: "desc" }
            }),
            prismaClient_1.default.faceAppDevice.count({ where })
        ]);
        res.status(200).json({ devices, total, pages: Math.ceil(total / parseInt(limit)) });
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching devices", error: error.message });
    }
});
exports.getFaceAppDevices = getFaceAppDevices;
const updateDeviceStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { status, remark } = req.body;
        const updated = yield prismaClient_1.default.faceAppDevice.update({
            where: { id: parseInt(id) },
            data: { status, remark }
        });
        res.status(200).json(updated);
    }
    catch (error) {
        res.status(500).json({ message: "Error updating device", error: error.message });
    }
});
exports.updateDeviceStatus = updateDeviceStatus;
// --- User Face Data ---
const getUserFaceData = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { branch, department, employeeId } = req.query;
        const where = {};
        if (branch && branch !== "All")
            where.employee = { branch };
        if (department && department !== "All")
            where.employee = Object.assign(Object.assign({}, where.employee), { department });
        if (employeeId)
            where.employeeId = parseInt(employeeId);
        const data = yield prismaClient_1.default.userFaceData.findMany({
            where,
            include: {
                employee: {
                    select: { firstName: true, lastName: true, branch: true, department: true, designation: true }
                }
            },
            orderBy: { lastUpdatedDate: "desc" }
        });
        res.status(200).json(data);
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching face data", error: error.message });
    }
});
exports.getUserFaceData = getUserFaceData;
const deleteUserFaceData = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        yield prismaClient_1.default.userFaceData.delete({ where: { id: parseInt(id) } });
        res.status(200).json({ message: "Face data reset successfully" });
    }
    catch (error) {
        res.status(500).json({ message: "Error resetting face data", error: error.message });
    }
});
exports.deleteUserFaceData = deleteUserFaceData;
// --- Face Change Request ---
const getFaceChangeRequests = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { status } = req.query;
        const where = status ? { status } : {};
        const requests = yield prismaClient_1.default.faceChangeRequest.findMany({
            where,
            include: {
                employee: {
                    select: { firstName: true, lastName: true, branch: true, department: true, designation: true }
                },
                device: true
            },
            orderBy: { createdAt: "desc" }
        });
        res.status(200).json(requests);
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching requests", error: error.message });
    }
});
exports.getFaceChangeRequests = getFaceChangeRequests;
const handleFaceChangeRequest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { status, rejectionReason } = req.body;
        const request = yield prismaClient_1.default.faceChangeRequest.findUnique({ where: { id: parseInt(id) } });
        if (!request)
            return res.status(404).json({ message: "Request not found" });
        if (status === "Approved") {
            // Update the actual face data
            yield prismaClient_1.default.userFaceData.upsert({
                where: { employeeId: request.employeeId },
                update: { photoUrl: request.newPhotoUrl, lastUpdatedDate: new Date() },
                create: { employeeId: request.employeeId, photoUrl: request.newPhotoUrl }
            });
        }
        const updated = yield prismaClient_1.default.faceChangeRequest.update({
            where: { id: parseInt(id) },
            data: { status, rejectionReason }
        });
        res.status(200).json({ message: `Request ${status} successfully`, updated });
    }
    catch (error) {
        res.status(500).json({ message: "Error processing request", error: error.message });
    }
});
exports.handleFaceChangeRequest = handleFaceChangeRequest;
// --- Face App Settings ---
const getFaceAppSettings = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let settings = yield prismaClient_1.default.faceAppSetting.findFirst();
        if (!settings) {
            settings = yield prismaClient_1.default.faceAppSetting.create({ data: {} });
        }
        res.status(200).json(settings);
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching settings", error: error.message });
    }
});
exports.getFaceAppSettings = getFaceAppSettings;
const updateFaceAppSettings = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const settings = yield prismaClient_1.default.faceAppSetting.findFirst();
        const id = (settings === null || settings === void 0 ? void 0 : settings.id) || 1;
        const updated = yield prismaClient_1.default.faceAppSetting.upsert({
            where: { id },
            update: req.body,
            create: req.body
        });
        res.status(200).json(updated);
    }
    catch (error) {
        res.status(500).json({ message: "Error updating settings", error: error.message });
    }
});
exports.updateFaceAppSettings = updateFaceAppSettings;
