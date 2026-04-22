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
const express_1 = require("express");
const prismaClient_1 = __importDefault(require("../../lib/prismaClient"));
const router = (0, express_1.Router)();
// GET all vendors with filters
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { categoryId, subCategoryId, city, status, search } = req.query;
        const where = {};
        if (categoryId)
            where.categoryId = Number(categoryId);
        if (subCategoryId)
            where.subCategoryId = Number(subCategoryId);
        if (city)
            where.city = { contains: String(city) };
        if (status)
            where.status = String(status);
        if (search) {
            where.OR = [
                { name: { contains: String(search) } },
                { companyName: { contains: String(search) } },
                { contactPerson: { contains: String(search) } },
                { email: { contains: String(search) } },
                { mobile: { contains: String(search) } },
            ];
        }
        const vendors = yield prismaClient_1.default.vendor.findMany({
            where,
            include: {
                category: { select: { name: true } },
                subCategory: { select: { name: true } }
            },
            orderBy: { name: 'asc' }
        });
        res.json(vendors);
    }
    catch (error) {
        console.error("Error fetching vendors:", error);
        res.status(500).json({ error: "Failed to fetch vendors" });
    }
}));
// GET report data
router.get('/reports', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { categoryId, status } = req.query;
        const where = {};
        if (categoryId)
            where.categoryId = Number(categoryId);
        if (status)
            where.status = String(status);
        const vendors = yield prismaClient_1.default.vendor.findMany({
            where,
            include: { category: { select: { name: true } } }
        });
        // Placeholder for financial data (Orders/Payments) until Purchase module is implemented
        const reports = vendors.map(v => ({
            vendorName: v.name,
            totalOrders: 0,
            totalPayment: 0,
            pendingPayment: 0,
            category: v.category.name
        }));
        res.json(reports);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to generate report" });
    }
}));
// GET single vendor
router.get('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const vendor = yield prismaClient_1.default.vendor.findUnique({
            where: { id: Number(req.params.id) },
            include: {
                category: true,
                subCategory: true
            }
        });
        if (!vendor)
            return res.status(404).json({ error: "Vendor not found" });
        res.json(vendor);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch vendor" });
    }
}));
// POST create vendor
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = Object.assign({}, req.body);
        if (data.categoryId)
            data.categoryId = Number(data.categoryId);
        if (data.subCategoryId)
            data.subCategoryId = Number(data.subCategoryId);
        if (data.paymentTerms)
            data.paymentTerms = Number(data.paymentTerms);
        const vendor = yield prismaClient_1.default.vendor.create({
            data: {
                name: data.name,
                categoryId: data.categoryId,
                subCategoryId: data.subCategoryId || null,
                contactPerson: data.contactPerson,
                mobile: data.mobile,
                email: data.email,
                gstNumber: data.gstNumber,
                panNumber: data.panNumber,
                companyName: data.companyName,
                country: data.country,
                state: data.state,
                city: data.city,
                area: data.area,
                pincode: data.pincode,
                fullAddress: data.fullAddress,
                bankName: data.bankName,
                accountNumber: data.accountNumber,
                ifscCode: data.ifscCode,
                paymentTerms: data.paymentTerms,
                status: data.status || 'Active',
                attachmentUrl: data.attachmentUrl
            }
        });
        res.status(201).json(vendor);
    }
    catch (error) {
        console.error("Error creating vendor:", error);
        res.status(500).json({ error: "Failed to create vendor" });
    }
}));
// PUT update vendor
router.put('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = Object.assign({}, req.body);
        if (data.categoryId)
            data.categoryId = Number(data.categoryId);
        if (data.subCategoryId)
            data.subCategoryId = Number(data.subCategoryId);
        if (data.paymentTerms)
            data.paymentTerms = Number(data.paymentTerms);
        const vendor = yield prismaClient_1.default.vendor.update({
            where: { id: Number(req.params.id) },
            data: {
                name: data.name,
                categoryId: data.categoryId,
                subCategoryId: data.subCategoryId || null,
                contactPerson: data.contactPerson,
                mobile: data.mobile,
                email: data.email,
                gstNumber: data.gstNumber,
                panNumber: data.panNumber,
                companyName: data.companyName,
                country: data.country,
                state: data.state,
                city: data.city,
                area: data.area,
                pincode: data.pincode,
                fullAddress: data.fullAddress,
                bankName: data.bankName,
                accountNumber: data.accountNumber,
                ifscCode: data.ifscCode,
                paymentTerms: data.paymentTerms,
                status: data.status,
                attachmentUrl: data.attachmentUrl
            }
        });
        res.json(vendor);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to update vendor" });
    }
}));
// DELETE vendor
router.delete('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield prismaClient_1.default.vendor.delete({
            where: { id: Number(req.params.id) }
        });
        res.json({ message: "Vendor deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to delete vendor" });
    }
}));
// POST bulk upload (placeholder logic)
router.post('/bulk', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { vendors } = req.body;
        if (!Array.isArray(vendors))
            return res.status(400).json({ error: "Invalid data format" });
        const count = yield prismaClient_1.default.vendor.createMany({
            data: vendors.map((v) => ({
                name: v.name,
                categoryId: Number(v.categoryId),
                subCategoryId: v.subCategoryId ? Number(v.subCategoryId) : null,
                mobile: v.mobile,
                email: v.email,
                status: v.status || 'Active'
            }))
        });
        res.json({ message: `${count.count} vendors imported successfully` });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to bulk import vendors" });
    }
}));
exports.default = router;
