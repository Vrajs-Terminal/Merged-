import type { Request, Response } from 'express';
import prisma from '../lib/prismaClient';

/**
 * Assets Module Controller
 * Using (prisma as any) for newly added models until generation is complete/cached
 */
export const assetController = {
  // ---------------------------------------------------------------------------
  // 1. Asset Category Management
  // ---------------------------------------------------------------------------
  async getCategories(req: Request, res: Response) {
    try {
      const categories = await (prisma as any).assetCategory.findMany({
        include: { _count: { select: { assets: true } } }
      });
      res.json(categories);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  async createCategory(req: Request, res: Response) {
    try {
      const category = await (prisma as any).assetCategory.create({ data: req.body });
      res.json(category);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  async updateCategory(req: Request, res: Response) {
    try {
      const id = req.params.id;
      const category = await (prisma as any).assetCategory.update({
        where: { id: parseInt(id as string) },
        data: req.body
      });
      res.json(category);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  async deleteCategory(req: Request, res: Response) {
    try {
      const id = req.params.id;
      await (prisma as any).assetCategory.delete({ where: { id: parseInt(id as string) } });
      res.json({ message: 'Category deleted' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  // ---------------------------------------------------------------------------
  // 2. Asset ID Settings
  // ---------------------------------------------------------------------------
  async getIDSettings(req: Request, res: Response) {
    try {
      let settings = await (prisma as any).assetIDSetting.findFirst();
      if (!settings) {
        settings = await (prisma as any).assetIDSetting.create({ data: {} });
      }
      res.json(settings);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  async updateIDSettings(req: Request, res: Response) {
    try {
      const { id, updateExisting, ...data } = req.body;
      const settings = await (prisma as any).assetIDSetting.upsert({
        where: { id: id || 0 },
        update: { ...data, updateExisting },
        create: { ...data, updateExisting }
      });

      // If updateExisting is true, trigger mass update of asset IDs
      if (updateExisting) {
        const assets = await (prisma as any).asset.findMany({
          include: { category: true }
        });

        for (const asset of assets) {
          const prefix = settings.prefix || 'AST';
          const catCode = settings.includeCategoryCode ? (asset.category?.code || '') : '';
          const serial = asset.id.toString().padStart(3, '0');
          const newId = `${prefix}${catCode}${serial}`;

          await (prisma as any).asset.update({
            where: { id: asset.id },
            data: { assetCode: newId }
          });
        }
      }

      res.json(settings);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  // ---------------------------------------------------------------------------
  // 3. Manage Assets
  // ---------------------------------------------------------------------------
  async getAssets(req: Request, res: Response) {
    try {
      const { category, branch, employee, status, search } = req.query;
      const where: any = {};
      
      if (category) where.categoryId = parseInt(category as string);
      if (branch) where.branchId = parseInt(branch as string);
      if (employee) where.custodianId = parseInt(employee as string);
      if (status) where.status = status as string;
      
      if (search) {
        where.OR = [
          { assetCode: { contains: search as string } },
          { itemName: { contains: search as string } },
          { brand: { contains: search as string } },
          { serialNo: { contains: search as string } }
        ];
      }

      const assets = await (prisma as any).asset.findMany({
        where,
        include: {
          category: true,
          custodian: {
            select: { id: true, firstName: true, lastName: true, employeeId: true }
          },
          branch: true,
          _count: { select: { history: true, maintenance: true } }
        },
        orderBy: { createdAt: 'desc' }
      });
      res.json(assets);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  async createAsset(req: Request, res: Response) {
    try {
      const data = req.body;
      
      // Auto-generate ID if enabled
      let assetCode = data.assetCode;
      const settings = await (prisma as any).assetIDSetting.findFirst();
      
      if (settings?.enableAutoGenerate && !assetCode) {
        const category = await (prisma as any).assetCategory.findUnique({ where: { id: parseInt(data.categoryId) } });
        const count = await (prisma as any).asset.count();
        const prefix = settings.prefix || 'AST';
        const catCode = settings.includeCategoryCode ? (category?.code || '') : '';
        const serial = (count + 1).toString().padStart(3, '0');
        assetCode = `${prefix}${catCode}${serial}`;
      }

      const asset = await (prisma as any).asset.create({ 
        data: {
          ...data,
          assetCode,
          categoryId: parseInt(data.categoryId),
          custodianId: data.custodianId ? parseInt(data.custodianId) : null,
          branchId: data.branchId ? parseInt(data.branchId) : null,
          price: data.price ? parseFloat(data.price) : null,
          purchaseDate: data.purchaseDate ? new Date(data.purchaseDate) : null,
          warrantyExpiry: data.warrantyExpiry ? new Date(data.warrantyExpiry) : null
        },
        include: { category: true }
      });
      
      // Auto-generate history for creation
      await (prisma as any).assetHistory.create({
        data: {
          assetId: asset.id,
          action: 'Created',
          remark: 'Asset added to system (Auto-ID: ' + assetCode + ')',
          doneBy: 'Admin'
        }
      });

      res.json(asset);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  async updateAsset(req: Request, res: Response) {
    try {
      const id = req.params.id;
      const data = req.body;
      const asset = await (prisma as any).asset.update({
        where: { id: parseInt(id as string) },
        data: {
          ...data,
          categoryId: data.categoryId ? parseInt(data.categoryId) : undefined,
          custodianId: data.custodianId ? parseInt(data.custodianId) : null,
          branchId: data.branchId ? parseInt(data.branchId) : null,
          price: data.price ? parseFloat(data.price) : null,
          purchaseDate: data.purchaseDate ? new Date(data.purchaseDate) : null,
          warrantyExpiry: data.warrantyExpiry ? new Date(data.warrantyExpiry) : null
        }
      });
      res.json(asset);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  async deleteAsset(req: Request, res: Response) {
    try {
      const id = req.params.id;
      await (prisma as any).asset.delete({ where: { id: parseInt(id as string) } });
      res.json({ message: 'Asset deleted' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  async bulkUploadAssets(req: Request, res: Response) {
    try {
      const { assets } = req.body;
      const settings = await (prisma as any).assetIDSetting.findFirst();
      const results = [];

      for (const data of assets) {
        let assetCode = data.assetCode;
        if (settings?.enableAutoGenerate && !assetCode) {
           const category = await (prisma as any).assetCategory.findUnique({ where: { id: parseInt(data.categoryId) } });
           const count = await (prisma as any).asset.count();
           const prefix = settings.prefix || 'AST';
           const catCode = settings.includeCategoryCode ? (category?.code || '') : '';
           const serial = (count + 1).toString().padStart(3, '0');
           assetCode = `${prefix}${catCode}${serial}`;
        }

        const asset = await (prisma as any).asset.create({
          data: {
            ...data,
            assetCode,
            categoryId: parseInt(data.categoryId),
            custodianId: data.custodianId ? parseInt(data.custodianId) : null,
            branchId: data.branchId ? parseInt(data.branchId) : null,
            price: data.price ? parseFloat(data.price) : null,
            purchaseDate: data.purchaseDate ? new Date(data.purchaseDate) : null,
            warrantyExpiry: data.warrantyExpiry ? new Date(data.warrantyExpiry) : null
          }
        });
        results.push(asset);
      }
      res.json({ message: `${results.length} assets uploaded successfully`, results });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  async assignAsset(req: Request, res: Response) {
    try {
      const id = req.params.id;
      const { custodianId, branchId, remark, employeeName, action } = req.body; // action: 'Assign' | 'Transfer' | 'Return'

      const oldAsset = await (prisma as any).asset.findUnique({ where: { id: parseInt(id as string) }, include: { custodian: true } });
      
      const updateData: any = {
        custodianId: custodianId ? parseInt(custodianId as string) : null, 
        branchId: branchId ? parseInt(branchId as string) : null,
        status: 'Active'
      };

      if (action === 'Return') {
        updateData.custodianId = null;
        updateData.status = 'InStock';
      }

      const asset = await (prisma as any).asset.update({
        where: { id: parseInt(id as string) },
        data: updateData
      });

      // Log to history
      let historyAction = action || (oldAsset?.custodianId ? 'Transferred' : 'Assigned');
      if (action === 'Return') historyAction = 'Returned';

      await (prisma as any).assetHistory.create({
        data: {
          assetId: asset.id,
          action: historyAction,
          fromInfo: oldAsset?.custodian?.firstName || 'Stock',
          toInfo: action === 'Return' ? 'Stock' : (employeeName || 'New Custodian'),
          remark: remark || `Asset ${historyAction.toLowerCase()}`,
          doneBy: 'Admin'
        }
      });

      res.json(asset);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  // ---------------------------------------------------------------------------
  // 4. Maintenance
  // ---------------------------------------------------------------------------
  async getMaintenance(req: Request, res: Response) {
    try {
      const { status, type } = req.query;
      let where: any = {};
      
      if (status) where.status = status as string;
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (type === 'missing') {
        where.status = 'Pending';
        where.nextMaintenanceDate = { lt: today };
      } else if (type === 'upcoming') {
        where.status = 'Pending';
        where.nextMaintenanceDate = { gte: today };
      }

      const maintenance = await (prisma as any).assetMaintenance.findMany({
        where,
        include: { asset: { include: { category: true } } },
        orderBy: { nextMaintenanceDate: 'asc' }
      });
      res.json(maintenance);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  async createMaintenance(req: Request, res: Response) {
    try {
      const maint = await (prisma as any).assetMaintenance.create({ 
        data: {
          ...req.body,
          assetId: parseInt(req.body.assetId),
          nextMaintenanceDate: new Date(req.body.nextMaintenanceDate)
        } 
      });
      await (prisma as any).asset.update({
        where: { id: parseInt(req.body.assetId) },
        data: { status: 'UnderMaintenance' }
      });

      // Log to history
      await (prisma as any).assetHistory.create({
        data: {
          assetId: parseInt(req.body.assetId),
          action: 'Maintenance',
          remark: `Scheduled: ${req.body.maintenanceType} - ${req.body.notes || ''}`,
          doneBy: 'Admin'
        }
      });

      res.json(maint);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  async completeMaintenance(req: Request, res: Response) {
    try {
      const id = req.params.id;
      const { amountSpent, notes } = req.body;
      const maint = await (prisma as any).assetMaintenance.update({
        where: { id: parseInt(id as string) },
        data: { 
          status: 'Completed', 
          completedDate: new Date(),
          amountSpent: amountSpent ? parseFloat(amountSpent) : null,
          notes
        }
      });
      // Set asset back to active
      await (prisma as any).asset.update({
        where: { id: maint.assetId },
        data: { status: 'Active' }
      });

      // Log to history
      await (prisma as any).assetHistory.create({
        data: {
          assetId: maint.assetId,
          action: 'Maintenance',
          remark: `Completed: Spent ${amountSpent || 0}. Notes: ${notes || ''}`,
          doneBy: 'Admin'
        }
      });

      res.json(maint);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  // ---------------------------------------------------------------------------
  // 5. Scrap
  // ---------------------------------------------------------------------------
  async getScrap(req: Request, res: Response) {
    try {
      const scrap = await (prisma as any).assetScrap.findMany({
        include: { asset: { include: { category: true } } },
        orderBy: { scrapDate: 'desc' }
      });
      res.json(scrap);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  async scrapAsset(req: Request, res: Response) {
    try {
      const { assetId, reason, soldPrice, scrapDate, scrapBy } = req.body;
      const scrap = await (prisma as any).assetScrap.create({
        data: { 
          assetId: parseInt(assetId), 
          reason, 
          soldPrice: soldPrice ? parseFloat(soldPrice) : null, 
          scrapDate: new Date(scrapDate), 
          scrapBy 
        }
      });
      await (prisma as any).asset.update({
        where: { id: parseInt(assetId) },
        data: { status: 'Scrapped' }
      });
      // History
      await (prisma as any).assetHistory.create({
        data: {
          assetId: parseInt(assetId),
          action: 'Scrapped',
          remark: `Reason: ${reason}. Sold for: ${soldPrice || 0}`,
          doneBy: scrapBy || 'Admin'
        }
      });
      res.json(scrap);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  // ---------------------------------------------------------------------------
  // 6. History
  // ---------------------------------------------------------------------------
  async getAssetHistory(req: Request, res: Response) {
    try {
      const assetId = req.params.assetId;
      const history = await (prisma as any).assetHistory.findMany({
        where: { assetId: parseInt(assetId as string) },
        orderBy: { createdAt: 'desc' }
      });
      res.json(history);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  // ---------------------------------------------------------------------------
  // 7. Security Settings (Submodule 9)
  // ---------------------------------------------------------------------------
  async getSecuritySettings(req: Request, res: Response) {
    try {
      const settings = await (prisma as any).assetSetting.findMany({
        include: { employee: { select: { firstName: true, lastName: true, department: true } } }
      });
      res.json(settings);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  async updateSecuritySetting(req: Request, res: Response) {
    try {
      const { employeeId, viewScope } = req.body;
      const setting = await (prisma as any).assetSetting.upsert({
        where: { employeeId: parseInt(employeeId) },
        update: { viewScope },
        create: { employeeId: parseInt(employeeId), viewScope }
      });
      res.json(setting);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  // ---------------------------------------------------------------------------
  // 8. Stats & Reports
  // ---------------------------------------------------------------------------
  async getAssetStats(req: Request, res: Response) {
    try {
      const [total, active, scrapped, maintenance, categories, totalValue] = await Promise.all([
        (prisma as any).asset.count(),
        (prisma as any).asset.count({ where: { status: 'Active' } }),
        (prisma as any).asset.count({ where: { status: 'Scrapped' } }),
        (prisma as any).asset.count({ where: { status: 'UnderMaintenance' } }),
        (prisma as any).assetCategory.count(),
        (prisma as any).asset.aggregate({ _sum: { price: true } })
      ]);
      
      const upcomingMaint = await (prisma as any).assetMaintenance.count({
        where: { status: 'Pending', nextMaintenanceDate: { gte: new Date() } }
      });

      res.json({ 
        total, 
        active, 
        scrapped, 
        maintenance, 
        categories, 
        totalValue: totalValue._sum.price || 0,
        upcomingMaint
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
};
