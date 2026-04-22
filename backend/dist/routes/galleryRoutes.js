"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const galleryController_1 = require("../controllers/galleryController");
const router = (0, express_1.Router)();
// Albums
router.get("/albums", galleryController_1.GalleryController.getAlbums);
router.post("/albums", galleryController_1.GalleryController.createAlbum);
router.put("/albums/:id", galleryController_1.GalleryController.updateAlbum);
router.delete("/albums/:id", galleryController_1.GalleryController.deleteAlbum);
router.put("/albums/:id/cover", galleryController_1.GalleryController.setAlbumCover);
// Media
router.get("/albums/:albumId/media", galleryController_1.GalleryController.getMediaByAlbum);
router.post("/media", galleryController_1.GalleryController.addMedia);
router.post("/media/bulk", galleryController_1.GalleryController.addBulkMedia);
router.delete("/media/:id", galleryController_1.GalleryController.deleteMedia);
router.put("/media/:id/like", galleryController_1.GalleryController.likeMedia);
exports.default = router;
