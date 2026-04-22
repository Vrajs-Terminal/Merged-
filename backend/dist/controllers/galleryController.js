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
exports.GalleryController = void 0;
const prismaClient_1 = __importDefault(require("../lib/prismaClient"));
exports.GalleryController = {
    // ---- Albums ----
    getAlbums: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const albums = yield prismaClient_1.default.galleryAlbum.findMany({
                include: {
                    event: { select: { id: true, eventName: true } },
                    _count: { select: { media: true } }
                },
                orderBy: { updatedAt: "desc" }
            });
            res.json(albums);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }),
    createAlbum: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { name, description, eventId, branches, departments, visibility } = req.body;
            const album = yield prismaClient_1.default.galleryAlbum.create({
                data: {
                    name,
                    description,
                    eventId: eventId ? parseInt(eventId) : null,
                    branches: branches ? JSON.stringify(branches) : null,
                    departments: departments ? JSON.stringify(departments) : null,
                    visibility: visibility || "Public"
                }
            });
            res.status(201).json(album);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }),
    updateAlbum: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { id } = req.params;
            const { name, description, eventId, branches, departments, visibility, coverImage } = req.body;
            const album = yield prismaClient_1.default.galleryAlbum.update({
                where: { id: parseInt(id) },
                data: {
                    name,
                    description,
                    eventId: eventId ? parseInt(eventId) : null,
                    branches: branches ? JSON.stringify(branches) : null,
                    departments: departments ? JSON.stringify(departments) : null,
                    visibility,
                    coverImage
                }
            });
            res.json(album);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }),
    deleteAlbum: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { id } = req.params;
            yield prismaClient_1.default.galleryAlbum.delete({ where: { id: parseInt(id) } });
            res.json({ message: "Album deleted" });
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }),
    setAlbumCover: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { id } = req.params;
            const { coverImage } = req.body;
            const album = yield prismaClient_1.default.galleryAlbum.update({
                where: { id: parseInt(id) },
                data: { coverImage }
            });
            res.json(album);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }),
    // ---- Media ----
    getMediaByAlbum: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { albumId } = req.params;
            const media = yield prismaClient_1.default.galleryMedia.findMany({
                where: { albumId: parseInt(albumId) },
                orderBy: { createdAt: "desc" }
            });
            res.json(media);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }),
    addMedia: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { albumId, url, type, tags, description, uploadedBy, allowDownload } = req.body;
            const media = yield prismaClient_1.default.galleryMedia.create({
                data: {
                    albumId: parseInt(albumId),
                    url,
                    type,
                    tags,
                    description,
                    uploadedBy: uploadedBy ? parseInt(uploadedBy) : null,
                    allowDownload: allowDownload !== false
                }
            });
            // auto-set album cover if first media
            const album = yield prismaClient_1.default.galleryAlbum.findUnique({ where: { id: parseInt(albumId) } });
            if (!album.coverImage && type === "Photo") {
                yield prismaClient_1.default.galleryAlbum.update({ where: { id: parseInt(albumId) }, data: { coverImage: url } });
            }
            res.status(201).json(media);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }),
    deleteMedia: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { id } = req.params;
            yield prismaClient_1.default.galleryMedia.delete({ where: { id: parseInt(id) } });
            res.json({ message: "Media deleted" });
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }),
    likeMedia: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { id } = req.params;
            const media = yield prismaClient_1.default.galleryMedia.update({
                where: { id: parseInt(id) },
                data: { likes: { increment: 1 } }
            });
            res.json(media);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }),
    // ---- Bulk Media Add ----
    addBulkMedia: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { albumId, mediaList } = req.body;
            const created = yield Promise.all(mediaList.map((item) => prismaClient_1.default.galleryMedia.create({
                data: {
                    albumId: parseInt(albumId),
                    url: item.url,
                    type: item.type || "Photo",
                    tags: item.tags || null,
                    description: item.description || null,
                    allowDownload: item.allowDownload !== false
                }
            })));
            // auto-cover
            const album = yield prismaClient_1.default.galleryAlbum.findUnique({ where: { id: parseInt(albumId) } });
            if (!album.coverImage && created.length > 0) {
                yield prismaClient_1.default.galleryAlbum.update({
                    where: { id: parseInt(albumId) },
                    data: { coverImage: created[0].url }
                });
            }
            res.status(201).json({ count: created.length, message: `${created.length} media items added` });
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    })
};
