import type { Request, Response } from "express";
import prisma from '../lib/prismaClient';

export const GalleryController = {

  // ---- Albums ----
  getAlbums: async (req: Request, res: Response) => {
    try {
      const albums = await (prisma as any).galleryAlbum.findMany({
        include: {
          event: { select: { id: true, eventName: true } },
          _count: { select: { media: true } }
        },
        orderBy: { updatedAt: "desc" }
      });
      res.json(albums);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  createAlbum: async (req: Request, res: Response) => {
    try {
      const { name, description, eventId, branches, departments, visibility } = req.body;
      const album = await (prisma as any).galleryAlbum.create({
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
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  updateAlbum: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { name, description, eventId, branches, departments, visibility, coverImage } = req.body;
      const album = await (prisma as any).galleryAlbum.update({
        where: { id: parseInt(id as string) },
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
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  deleteAlbum: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await (prisma as any).galleryAlbum.delete({ where: { id: parseInt(id as string) } });
      res.json({ message: "Album deleted" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  setAlbumCover: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { coverImage } = req.body;
      const album = await (prisma as any).galleryAlbum.update({
        where: { id: parseInt(id as string) },
        data: { coverImage }
      });
      res.json(album);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  // ---- Media ----
  getMediaByAlbum: async (req: Request, res: Response) => {
    try {
      const { albumId } = req.params;
      const media = await (prisma as any).galleryMedia.findMany({
        where: { albumId: parseInt(albumId as string) },
        orderBy: { createdAt: "desc" }
      });
      res.json(media);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  addMedia: async (req: Request, res: Response) => {
    try {
      const { albumId, url, type, tags, description, uploadedBy, allowDownload } = req.body;
      const media = await (prisma as any).galleryMedia.create({
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
      const album = await (prisma as any).galleryAlbum.findUnique({ where: { id: parseInt(albumId) } });
      if (!album.coverImage && type === "Photo") {
        await (prisma as any).galleryAlbum.update({ where: { id: parseInt(albumId) }, data: { coverImage: url } });
      }
      res.status(201).json(media);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  deleteMedia: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await (prisma as any).galleryMedia.delete({ where: { id: parseInt(id as string) } });
      res.json({ message: "Media deleted" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  likeMedia: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const media = await (prisma as any).galleryMedia.update({
        where: { id: parseInt(id as string) },
        data: { likes: { increment: 1 } }
      });
      res.json(media);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  // ---- Bulk Media Add ----
  addBulkMedia: async (req: Request, res: Response) => {
    try {
      const { albumId, mediaList } = req.body;
      const created = await Promise.all(
        (mediaList as any[]).map((item: any) =>
          (prisma as any).galleryMedia.create({
            data: {
              albumId: parseInt(albumId),
              url: item.url,
              type: item.type || "Photo",
              tags: item.tags || null,
              description: item.description || null,
              allowDownload: item.allowDownload !== false
            }
          })
        )
      );
      // auto-cover
      const album = await (prisma as any).galleryAlbum.findUnique({ where: { id: parseInt(albumId) } });
      if (!album.coverImage && created.length > 0) {
        await (prisma as any).galleryAlbum.update({
          where: { id: parseInt(albumId) },
          data: { coverImage: created[0].url }
        });
      }
      res.status(201).json({ count: created.length, message: `${created.length} media items added` });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
};
