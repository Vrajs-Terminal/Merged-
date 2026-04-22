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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.assetController = void 0;
const prismaClient_1 = __importDefault(require("../lib/prismaClient"));
/**
 * Assets Module Controller
 * Using (prisma as any) for newly added models until generation is complete/cached
 */
exports.assetController = {
    // ---------------------------------------------------------------------------
    // 1. Asset Category Management
    // ---------------------------------------------------------------------------
    getCategories(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const categories = yield prismaClient_1.default.assetCategory.findMany({
                    include: { _count: { select: { assets: true } } }
                });
                res.json(categories);
            }
            catch (error) {
                res.status(500).json({ error: error.message });
            }
        });
    },
    createCategory(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const category = yield prismaClient_1.default.assetCategory.create({ data: req.body });
                res.json(category);
            }
            catch (error) {
                res.status(500).json({ error: error.message });
            }
        });
    },
    updateCategory(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = req.params.id;
                const category = yield prismaClient_1.default.assetCategory.update({
                    where: { id: parseInt(id) },
                    data: req.body
                });
                res.json(category);
            }
            catch (error) {
                res.status(500).json({ error: error.message });
            }
        });
    },
    deleteCategory(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = req.params.id;
                yield prismaClient_1.default.assetCategory.delete({ where: { id: parseInt(id) } });
                res.json({ message: 'Category deleted' });
            }
            catch (error) {
                res.status(500).json({ error: error.message });
            }
        });
    },
    // ---------------------------------------------------------------------------
    // 2. Asset ID Settings
    // ---------------------------------------------------------------------------
    getIDSettings(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let settings = yield prismaClient_1.default.assetIDSetting.findFirst();
                if (!settings) {
                    settings = yield prismaClient_1.default.assetIDSetting.create({ data: {} });
                }
                res.json(settings);
            }
            catch (error) {
                res.status(500).json({ error: error.message });
            }
        });
    },
    updateIDSettings(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const _b = req.body, { id, updateExisting } = _b, data = __rest(_b, ["id", "updateExisting"]);
                const settings = yield prismaClient_1.default.assetIDSetting.upsert({
                    where: { id: id || 0 },
                    update: Object.assign(Object.assign({}, data), { updateExisting }),
                    create: Object.assign(Object.assign({}, data), { updateExisting })
                });
                // If updateExisting is true, trigger mass update of asset IDs
                if (updateExisting) {
                    const assets = yield prismaClient_1.default.asset.findMany({
                        include: { category: true }
                    });
                    for (const asset of assets) {
                        const prefix = settings.prefix || 'AST';
                        const catCode = settings.includeCategoryCode ? (((_a = asset.category) === null || _a === void 0 ? void 0 : _a.code) || '') : '';
                        const serial = asset.id.toString().padStart(3, '0');
                        const newId = `${prefix}${catCode}${serial}`;
                        yield prismaClient_1.default.asset.update({
                            where: { id: asset.id },
                            data: { assetCode: newId }
                        });
                    }
                }
                res.json(settings);
            }
            catch (error) {
                res.status(500).json({ error: error.message });
            }
        });
    },
    // ---------------------------------------------------------------------------
    // 3. Manage Assets
    // ---------------------------------------------------------------------------
    getAssets(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { category, branch, employee, status, search } = req.query;
                const where = {};
                if (category)
                    where.categoryId = parseInt(category);
                if (branch)
                    where.branchId = parseInt(branch);
                if (employee)
                    where.custodianId = parseInt(employee);
                if (status)
                    where.status = status;
                if (search) {
                    where.OR = [
                        { assetCode: { contains: search } },
                        { itemName: { contains: search } },
                        { brand: { contains: search } },
                        { serialNo: { contains: search } }
                    ];
                }
                const assets = yield prismaClient_1.default.asset.findMany({
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
            }
            catch (error) {
                res.status(500).json({ error: error.message });
            }
        });
    },
    createAsset(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const data = req.body;
                // Auto-generate ID if enabled
                let assetCode = data.assetCode;
                const settings = yield prismaClient_1.default.assetIDSetting.findFirst();
                if ((settings === null || settings === void 0 ? void 0 : settings.enableAutoGenerate) && !assetCode) {
                    const category = yield prismaClient_1.default.assetCategory.findUnique({ where: { id: parseInt(data.categoryId) } });
                    const count = yield prismaClient_1.default.asset.count();
                    const prefix = settings.prefix || 'AST';
                    const catCode = settings.includeCategoryCode ? ((category === null || category === void 0 ? void 0 : category.code) || '') : '';
                    const serial = (count + 1).toString().padStart(3, '0');
                    assetCode = `${prefix}${catCode}${serial}`;
                }
                const asset = yield prismaClient_1.default.asset.create({
                    data: Object.assign(Object.assign({}, data), { assetCode, categoryId: parseInt(data.categoryId), custodianId: data.custodianId ? parseInt(data.custodianId) : null, branchId: data.branchId ? parseInt(data.branchId) : null, price: data.price ? parseFloat(data.price) : null, purchaseDate: data.purchaseDate ? new Date(data.purchaseDate) : null, warrantyExpiry: data.warrantyExpiry ? new Date(data.warrantyExpiry) : null }),
                    include: { category: true }
                });
                // Auto-generate history for creation
                yield prismaClient_1.default.assetHistory.create({
                    data: {
                        assetId: asset.id,
                        action: 'Created',
                        remark: 'Asset added to system (Auto-ID: ' + assetCode + ')',
                        doneBy: 'Admin'
                    }
                });
                res.json(asset);
            }
            catch (error) {
                res.status(500).json({ error: error.message });
            }
        });
    },
    updateAsset(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = req.params.id;
                const data = req.body;
                const asset = yield prismaClient_1.default.asset.update({
                    where: { id: parseInt(id) },
                    data: Object.assign(Object.assign({}, data), { categoryId: data.categoryId ? parseInt(data.categoryId) : undefined, custodianId: data.custodianId ? parseInt(data.custodianId) : null, branchId: data.branchId ? parseInt(data.branchId) : null, price: data.price ? parseFloat(data.price) : null, purchaseDate: data.purchaseDate ? new Date(data.purchaseDate) : null, warrantyExpiry: data.warrantyExpiry ? new Date(data.warrantyExpiry) : null })
                });
                res.json(asset);
            }
            catch (error) {
                res.status(500).json({ error: error.message });
            }
        });
    },
    deleteAsset(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = req.params.id;
                yield prismaClient_1.default.asset.delete({ where: { id: parseInt(id) } });
                res.json({ message: 'Asset deleted' });
            }
            catch (error) {
                res.status(500).json({ error: error.message });
            }
        });
    },
    bulkUploadAssets(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { assets } = req.body;
                const settings = yield prismaClient_1.default.assetIDSetting.findFirst();
                const results = [];
                for (const data of assets) {
                    let assetCode = data.assetCode;
                    if ((settings === null || settings === void 0 ? void 0 : settings.enableAutoGenerate) && !assetCode) {
                        const category = yield prismaClient_1.default.assetCategory.findUnique({ where: { id: parseInt(data.categoryId) } });
                        const count = yield prismaClient_1.default.asset.count();
                        const prefix = settings.prefix || 'AST';
                        const catCode = settings.includeCategoryCode ? ((category === null || category === void 0 ? void 0 : category.code) || '') : '';
                        const serial = (count + 1).toString().padStart(3, '0');
                        assetCode = `${prefix}${catCode}${serial}`;
                    }
                    const asset = yield prismaClient_1.default.asset.create({
                        data: Object.assign(Object.assign({}, data), { assetCode, categoryId: parseInt(data.categoryId), custodianId: data.custodianId ? parseInt(data.custodianId) : null, branchId: data.branchId ? parseInt(data.branchId) : null, price: data.price ? parseFloat(data.price) : null, purchaseDate: data.purchaseDate ? new Date(data.purchaseDate) : null, warrantyExpiry: data.warrantyExpiry ? new Date(data.warrantyExpiry) : null })
                    });
                    results.push(asset);
                }
                res.json({ message: `${results.length} assets uploaded successfully`, results });
            }
            catch (error) {
                res.status(500).json({ error: error.message });
            }
        });
    },
    assignAsset(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const id = req.params.id;
                const { custodianId, branchId, remark, employeeName, action } = req.body; // action: 'Assign' | 'Transfer' | 'Return'
                const oldAsset = yield prismaClient_1.default.asset.findUnique({ where: { id: parseInt(id) }, include: { custodian: true } });
                const updateData = {
                    custodianId: custodianId ? parseInt(custodianId) : null,
                    branchId: branchId ? parseInt(branchId) : null,
                    status: 'Active'
                };
                if (action === 'Return') {
                    updateData.custodianId = null;
                    updateData.status = 'InStock';
                }
                const asset = yield prismaClient_1.default.asset.update({
                    where: { id: parseInt(id) },
                    data: updateData
                });
                // Log to history
                let historyAction = action || ((oldAsset === null || oldAsset === void 0 ? void 0 : oldAsset.custodianId) ? 'Transferred' : 'Assigned');
                if (action === 'Return')
                    historyAction = 'Returned';
                yield prismaClient_1.default.assetHistory.create({
                    data: {
                        assetId: asset.id,
                        action: historyAction,
                        fromInfo: ((_a = oldAsset === null || oldAsset === void 0 ? void 0 : oldAsset.custodian) === null || _a === void 0 ? void 0 : _a.firstName) || 'Stock',
                        toInfo: action === 'Return' ? 'Stock' : (employeeName || 'New Custodian'),
                        remark: remark || `Asset ${historyAction.toLowerCase()}`,
                        doneBy: 'Admin'
                    }
                });
                res.json(asset);
            }
            catch (error) {
                res.status(500).json({ error: error.message });
            }
        });
    },
    // ---------------------------------------------------------------------------
    // 4. Maintenance
    // ---------------------------------------------------------------------------
    getMaintenance(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { status, type } = req.query;
                let where = {};
                if (status)
                    where.status = status;
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                if (type === 'missing') {
                    where.status = 'Pending';
                    where.nextMaintenanceDate = { lt: today };
                }
                else if (type === 'upcoming') {
                    where.status = 'Pending';
                    where.nextMaintenanceDate = { gte: today };
                }
                const maintenance = yield prismaClient_1.default.assetMaintenance.findMany({
                    where,
                    include: { asset: { include: { category: true } } },
                    orderBy: { nextMaintenanceDate: 'asc' }
                });
                res.json(maintenance);
            }
            catch (error) {
                res.status(500).json({ error: error.message });
            }
        });
    },
    createMaintenance(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const maint = yield prismaClient_1.default.assetMaintenance.create({
                    data: Object.assign(Object.assign({}, req.body), { assetId: parseInt(req.body.assetId), nextMaintenanceDate: new Date(req.body.nextMaintenanceDate) })
                });
                yield prismaClient_1.default.asset.update({
                    where: { id: parseInt(req.body.assetId) },
                    data: { status: 'UnderMaintenance' }
                });
                // Log to history
                yield prismaClient_1.default.assetHistory.create({
                    data: {
                        assetId: parseInt(req.body.assetId),
                        action: 'Maintenance',
                        remark: `Scheduled: ${req.body.maintenanceType} - ${req.body.notes || ''}`,
                        doneBy: 'Admin'
                    }
                });
                res.json(maint);
            }
            catch (error) {
                res.status(500).json({ error: error.message });
            }
        });
    },
    completeMaintenance(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = req.params.id;
                const { amountSpent, notes } = req.body;
                const maint = yield prismaClient_1.default.assetMaintenance.update({
                    where: { id: parseInt(id) },
                    data: {
                        status: 'Completed',
                        completedDate: new Date(),
                        amountSpent: amountSpent ? parseFloat(amountSpent) : null,
                        notes
                    }
                });
                // Set asset back to active
                yield prismaClient_1.default.asset.update({
                    where: { id: maint.assetId },
                    data: { status: 'Active' }
                });
                // Log to history
                yield prismaClient_1.default.assetHistory.create({
                    data: {
                        assetId: maint.assetId,
                        action: 'Maintenance',
                        remark: `Completed: Spent ${amountSpent || 0}. Notes: ${notes || ''}`,
                        doneBy: 'Admin'
                    }
                });
                res.json(maint);
            }
            catch (error) {
                res.status(500).json({ error: error.message });
            }
        });
    },
    // ---------------------------------------------------------------------------
    // 5. Scrap
    // ---------------------------------------------------------------------------
    getScrap(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const scrap = yield prismaClient_1.default.assetScrap.findMany({
                    include: { asset: { include: { category: true } } },
                    orderBy: { scrapDate: 'desc' }
                });
                res.json(scrap);
            }
            catch (error) {
                res.status(500).json({ error: error.message });
            }
        });
    },
    scrapAsset(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { assetId, reason, soldPrice, scrapDate, scrapBy } = req.body;
                const scrap = yield prismaClient_1.default.assetScrap.create({
                    data: {
                        assetId: parseInt(assetId),
                        reason,
                        soldPrice: soldPrice ? parseFloat(soldPrice) : null,
                        scrapDate: new Date(scrapDate),
                        scrapBy
                    }
                });
                yield prismaClient_1.default.asset.update({
                    where: { id: parseInt(assetId) },
                    data: { status: 'Scrapped' }
                });
                // History
                yield prismaClient_1.default.assetHistory.create({
                    data: {
                        assetId: parseInt(assetId),
                        action: 'Scrapped',
                        remark: `Reason: ${reason}. Sold for: ${soldPrice || 0}`,
                        doneBy: scrapBy || 'Admin'
                    }
                });
                res.json(scrap);
            }
            catch (error) {
                res.status(500).json({ error: error.message });
            }
        });
    },
    // ---------------------------------------------------------------------------
    // 6. History
    // ---------------------------------------------------------------------------
    getAssetHistory(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const assetId = req.params.assetId;
                const history = yield prismaClient_1.default.assetHistory.findMany({
                    where: { assetId: parseInt(assetId) },
                    orderBy: { createdAt: 'desc' }
                });
                res.json(history);
            }
            catch (error) {
                res.status(500).json({ error: error.message });
            }
        });
    },
    // ---------------------------------------------------------------------------
    // 7. Security Settings (Submodule 9)
    // ---------------------------------------------------------------------------
    getSecuritySettings(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const settings = yield prismaClient_1.default.assetSetting.findMany({
                    include: { employee: { select: { firstName: true, lastName: true, department: true } } }
                });
                res.json(settings);
            }
            catch (error) {
                res.status(500).json({ error: error.message });
            }
        });
    },
    updateSecuritySetting(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { employeeId, viewScope } = req.body;
                const setting = yield prismaClient_1.default.assetSetting.upsert({
                    where: { employeeId: parseInt(employeeId) },
                    update: { viewScope },
                    create: { employeeId: parseInt(employeeId), viewScope }
                });
                res.json(setting);
            }
            catch (error) {
                res.status(500).json({ error: error.message });
            }
        });
    },
    // ---------------------------------------------------------------------------
    // 8. Stats & Reports
    // ---------------------------------------------------------------------------
    getAssetStats(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const [total, active, scrapped, maintenance, categories, totalValue] = yield Promise.all([
                    prismaClient_1.default.asset.count(),
                    prismaClient_1.default.asset.count({ where: { status: 'Active' } }),
                    prismaClient_1.default.asset.count({ where: { status: 'Scrapped' } }),
                    prismaClient_1.default.asset.count({ where: { status: 'UnderMaintenance' } }),
                    prismaClient_1.default.assetCategory.count(),
                    prismaClient_1.default.asset.aggregate({ _sum: { price: true } })
                ]);
                const upcomingMaint = yield prismaClient_1.default.assetMaintenance.count({
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
            }
            catch (error) {
                res.status(500).json({ error: error.message });
            }
        });
    }
};
