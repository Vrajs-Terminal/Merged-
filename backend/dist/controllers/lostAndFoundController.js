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
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyClaim = exports.getClaims = exports.claimItem = exports.deleteItem = exports.updateItemStatus = exports.getItems = exports.reportItem = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const reportItem = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { type, itemName, description, date, location, photoUrl, reportedById, contactDetails } = req.body;
        const item = yield prisma.lostFoundItem.create({
            data: {
                type,
                itemName,
                description,
                date: new Date(date),
                location,
                photoUrl,
                reportedById: Number(reportedById),
                contactDetails
            }
        });
        res.status(201).json({ message: `${type} item reported successfully`, item });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error", error });
    }
});
exports.reportItem = reportItem;
const getItems = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { type, status, limit } = req.query;
        const items = yield prisma.lostFoundItem.findMany({
            where: Object.assign(Object.assign({}, (type && { type: String(type) })), (status && { status: String(status) })),
            include: {
                reportedBy: {
                    select: { firstName: true, lastName: true, employeeId: true, branch: true }
                },
                claims: true
            },
            orderBy: { createdAt: 'desc' },
            take: limit ? Number(limit) : undefined
        });
        res.status(200).json(items);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
});
exports.getItems = getItems;
const updateItemStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const item = yield prisma.lostFoundItem.update({
            where: { id: Number(id) },
            data: { status }
        });
        res.status(200).json({ message: "Status updated", item });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
});
exports.updateItemStatus = updateItemStatus;
const deleteItem = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        yield prisma.lostFoundItem.delete({
            where: { id: Number(id) }
        });
        res.status(200).json({ message: "Item deleted successfully" });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
});
exports.deleteItem = deleteItem;
const claimItem = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { itemId, claimedById, proofDescription } = req.body;
        const claim = yield prisma.itemClaim.create({
            data: {
                itemId: Number(itemId),
                claimedById: Number(claimedById),
                proofDescription
            }
        });
        res.status(201).json({ message: "Claim submitted successfully", claim });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
});
exports.claimItem = claimItem;
const getClaims = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const claims = yield prisma.itemClaim.findMany({
            include: {
                item: true,
                claimedBy: {
                    select: { firstName: true, lastName: true, employeeId: true }
                },
                approvedBy: {
                    select: { firstName: true, lastName: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.status(200).json(claims);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
});
exports.getClaims = getClaims;
const verifyClaim = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { status, approvedById } = req.body; // status: Approved / Rejected
        const claim = yield prisma.itemClaim.update({
            where: { id: Number(id) },
            data: {
                status,
                approvedById: approvedById ? Number(approvedById) : undefined
            }
        });
        if (status === 'Approved') {
            yield prisma.lostFoundItem.update({
                where: { id: claim.itemId },
                data: { status: 'Returned' }
            });
        }
        res.status(200).json({ message: `Claim ${status}`, claim });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
});
exports.verifyClaim = verifyClaim;
