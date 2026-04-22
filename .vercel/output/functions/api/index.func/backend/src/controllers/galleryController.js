"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GalleryController = void 0;
const prismaClient_1 = __importDefault(require("../lib/prismaClient"));
exports.GalleryController = {
    // ---- Albums ----
    getAlbums: async (req, res) => {
        try {
            const albums = await prismaClient_1.default.galleryAlbum.findMany({
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
    },
    createAlbum: async (req, res) => {
        try {
            const { name, description, eventId, branches, departments, visibility } = req.body;
            const album = await prismaClient_1.default.galleryAlbum.create({
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
    },
    updateAlbum: async (req, res) => {
        try {
            const { id } = req.params;
            const { name, description, eventId, branches, departments, visibility, coverImage } = req.body;
            const album = await prismaClient_1.default.galleryAlbum.update({
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
    },
    deleteAlbum: async (req, res) => {
        try {
            const { id } = req.params;
            await prismaClient_1.default.galleryAlbum.delete({ where: { id: parseInt(id) } });
            res.json({ message: "Album deleted" });
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    setAlbumCover: async (req, res) => {
        try {
            const { id } = req.params;
            const { coverImage } = req.body;
            const album = await prismaClient_1.default.galleryAlbum.update({
                where: { id: parseInt(id) },
                data: { coverImage }
            });
            res.json(album);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    // ---- Media ----
    getMediaByAlbum: async (req, res) => {
        try {
            const { albumId } = req.params;
            const media = await prismaClient_1.default.galleryMedia.findMany({
                where: { albumId: parseInt(albumId) },
                orderBy: { createdAt: "desc" }
            });
            res.json(media);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    addMedia: async (req, res) => {
        try {
            const { albumId, url, type, tags, description, uploadedBy, allowDownload } = req.body;
            const media = await prismaClient_1.default.galleryMedia.create({
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
            const album = await prismaClient_1.default.galleryAlbum.findUnique({ where: { id: parseInt(albumId) } });
            if (!album.coverImage && type === "Photo") {
                await prismaClient_1.default.galleryAlbum.update({ where: { id: parseInt(albumId) }, data: { coverImage: url } });
            }
            res.status(201).json(media);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    deleteMedia: async (req, res) => {
        try {
            const { id } = req.params;
            await prismaClient_1.default.galleryMedia.delete({ where: { id: parseInt(id) } });
            res.json({ message: "Media deleted" });
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    likeMedia: async (req, res) => {
        try {
            const { id } = req.params;
            const media = await prismaClient_1.default.galleryMedia.update({
                where: { id: parseInt(id) },
                data: { likes: { increment: 1 } }
            });
            res.json(media);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    // ---- Bulk Media Add ----
    addBulkMedia: async (req, res) => {
        try {
            const { albumId, mediaList } = req.body;
            const created = await Promise.all(mediaList.map((item) => prismaClient_1.default.galleryMedia.create({
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
            const album = await prismaClient_1.default.galleryAlbum.findUnique({ where: { id: parseInt(albumId) } });
            if (!album.coverImage && created.length > 0) {
                await prismaClient_1.default.galleryAlbum.update({
                    where: { id: parseInt(albumId) },
                    data: { coverImage: created[0].url }
                });
            }
            res.status(201).json({ count: created.length, message: `${created.length} media items added` });
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
};
//# sourceMappingURL=galleryController.js.map