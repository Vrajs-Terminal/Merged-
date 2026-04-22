"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAppBanner = exports.toggleAppBannerStatus = exports.updateAppBanner = exports.createAppBanner = exports.getAppBanners = void 0;
const prismaClient_1 = __importDefault(require("../lib/prismaClient"));
const db = prismaClient_1.default;
const getAppBanners = async (_req, res) => {
    try {
        const banners = await db.appBanner.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }] });
        res.status(200).json(banners);
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
exports.getAppBanners = getAppBanners;
const createAppBanner = async (req, res) => {
    var _a;
    try {
        const banner = await db.appBanner.create({
            data: {
                image: req.body.image,
                title: req.body.title,
                type: req.body.type || "Image",
                active: (_a = req.body.active) !== null && _a !== void 0 ? _a : true,
                schedule: req.body.schedule,
                actionValue: req.body.actionValue,
                sortOrder: Number(req.body.sortOrder || 0),
            },
        });
        res.status(201).json(banner);
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
exports.createAppBanner = createAppBanner;
const updateAppBanner = async (req, res) => {
    try {
        const { id } = req.params;
        const banner = await db.appBanner.update({
            where: { id: Number(id) },
            data: {
                image: req.body.image,
                title: req.body.title,
                type: req.body.type,
                active: req.body.active,
                schedule: req.body.schedule,
                actionValue: req.body.actionValue,
                sortOrder: req.body.sortOrder !== undefined ? Number(req.body.sortOrder) : undefined,
            },
        });
        res.status(200).json(banner);
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
exports.updateAppBanner = updateAppBanner;
const toggleAppBannerStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const existing = await db.appBanner.findUnique({ where: { id: Number(id) } });
        if (!existing) {
            return res.status(404).json({ message: "Banner not found" });
        }
        const banner = await db.appBanner.update({
            where: { id: Number(id) },
            data: { active: !existing.active },
        });
        res.status(200).json(banner);
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
exports.toggleAppBannerStatus = toggleAppBannerStatus;
const deleteAppBanner = async (req, res) => {
    try {
        const { id } = req.params;
        await db.appBanner.delete({ where: { id: Number(id) } });
        res.status(200).json({ message: "Banner deleted" });
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
exports.deleteAppBanner = deleteAppBanner;
//# sourceMappingURL=appBannerController.js.map