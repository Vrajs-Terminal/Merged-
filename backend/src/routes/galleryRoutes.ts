import { Router } from "express";
import { GalleryController } from "../controllers/galleryController";

const router = Router();

// Albums
router.get("/albums", GalleryController.getAlbums);
router.post("/albums", GalleryController.createAlbum);
router.put("/albums/:id", GalleryController.updateAlbum);
router.delete("/albums/:id", GalleryController.deleteAlbum);
router.put("/albums/:id/cover", GalleryController.setAlbumCover);

// Media
router.get("/albums/:albumId/media", GalleryController.getMediaByAlbum);
router.post("/media", GalleryController.addMedia);
router.post("/media/bulk", GalleryController.addBulkMedia);
router.delete("/media/:id", GalleryController.deleteMedia);
router.put("/media/:id/like", GalleryController.likeMedia);

export default router;
