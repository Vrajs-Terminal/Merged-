"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const assetController_1 = require("../controllers/assetController");
const router = (0, express_1.Router)();
// 1. Asset Category Management
router.get('/categories', assetController_1.assetController.getCategories);
router.post('/categories', assetController_1.assetController.createCategory);
router.put('/categories/:id', assetController_1.assetController.updateCategory);
router.delete('/categories/:id', assetController_1.assetController.deleteCategory);
// 2. Asset ID Settings
router.get('/id-settings', assetController_1.assetController.getIDSettings);
router.put('/id-settings', assetController_1.assetController.updateIDSettings);
// 3. Manage Assets
router.get('/', assetController_1.assetController.getAssets);
router.post('/', assetController_1.assetController.createAsset);
router.post('/bulk', assetController_1.assetController.bulkUploadAssets);
router.put('/:id', assetController_1.assetController.updateAsset);
router.delete('/:id', assetController_1.assetController.deleteAsset);
router.post('/:id/assign', assetController_1.assetController.assignAsset);
// 4. Maintenance
router.get('/maintenance', assetController_1.assetController.getMaintenance);
router.post('/maintenance', assetController_1.assetController.createMaintenance);
router.put('/maintenance/:id/complete', assetController_1.assetController.completeMaintenance);
// 5. Scrap
router.get('/scrap', assetController_1.assetController.getScrap);
router.post('/scrap', assetController_1.assetController.scrapAsset);
// 6. History
router.get('/:assetId/history', assetController_1.assetController.getAssetHistory);
// 7. Security Settings
router.get('/security-settings', assetController_1.assetController.getSecuritySettings);
router.put('/security-settings', assetController_1.assetController.updateSecuritySetting);
// 8. Stats
router.get('/stats', assetController_1.assetController.getAssetStats);
exports.default = router;
//# sourceMappingURL=assetRoutes.js.map