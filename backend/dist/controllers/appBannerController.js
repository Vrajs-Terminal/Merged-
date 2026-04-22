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
exports.deleteAppBanner = exports.toggleAppBannerStatus = exports.updateAppBanner = exports.createAppBanner = exports.getAppBanners = void 0;
const prismaClient_1 = __importDefault(require("../lib/prismaClient"));
const db = prismaClient_1.default;
const getAppBanners = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const banners = yield db.appBanner.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }] });
        res.status(200).json(banners);
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});
exports.getAppBanners = getAppBanners;
const createAppBanner = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const banner = yield db.appBanner.create({
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
});
exports.createAppBanner = createAppBanner;
const updateAppBanner = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const banner = yield db.appBanner.update({
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
});
exports.updateAppBanner = updateAppBanner;
const toggleAppBannerStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const existing = yield db.appBanner.findUnique({ where: { id: Number(id) } });
        if (!existing) {
            return res.status(404).json({ message: "Banner not found" });
        }
        const banner = yield db.appBanner.update({
            where: { id: Number(id) },
            data: { active: !existing.active },
        });
        res.status(200).json(banner);
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});
exports.toggleAppBannerStatus = toggleAppBannerStatus;
const deleteAppBanner = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        yield db.appBanner.delete({ where: { id: Number(id) } });
        res.status(200).json({ message: "Banner deleted" });
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});
exports.deleteAppBanner = deleteAppBanner;
