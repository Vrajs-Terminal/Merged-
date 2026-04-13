import { Router } from 'express';
import { assetController } from '../controllers/assetController';

const router = Router();

// 1. Asset Category Management
router.get('/categories', assetController.getCategories);
router.post('/categories', assetController.createCategory);
router.put('/categories/:id', assetController.updateCategory);
router.delete('/categories/:id', assetController.deleteCategory);

// 2. Asset ID Settings
router.get('/id-settings', assetController.getIDSettings);
router.put('/id-settings', assetController.updateIDSettings);

// 3. Manage Assets
router.get('/', assetController.getAssets);
router.post('/', assetController.createAsset);
router.post('/bulk', assetController.bulkUploadAssets);
router.put('/:id', assetController.updateAsset);
router.delete('/:id', assetController.deleteAsset);
router.post('/:id/assign', assetController.assignAsset);

// 4. Maintenance
router.get('/maintenance', assetController.getMaintenance);
router.post('/maintenance', assetController.createMaintenance);
router.put('/maintenance/:id/complete', assetController.completeMaintenance);

// 5. Scrap
router.get('/scrap', assetController.getScrap);
router.post('/scrap', assetController.scrapAsset);

// 6. History
router.get('/:assetId/history', assetController.getAssetHistory);

// 7. Security Settings
router.get('/security-settings', assetController.getSecuritySettings);
router.put('/security-settings', assetController.updateSecuritySetting);

// 8. Stats
router.get('/stats', assetController.getAssetStats);

export default router;
