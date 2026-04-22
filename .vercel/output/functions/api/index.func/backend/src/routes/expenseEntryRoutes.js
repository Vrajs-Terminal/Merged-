"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const expenseEntryController_1 = require("../controllers/expenseEntryController");
const router = (0, express_1.Router)();
router.get('/', expenseEntryController_1.getEntries);
router.post('/', expenseEntryController_1.createEntry);
router.put('/:id/approve', expenseEntryController_1.approveEntry);
router.put('/:id/reject', expenseEntryController_1.rejectEntry);
router.put('/:id/pay', expenseEntryController_1.markPaid);
router.put('/bulk/pay', expenseEntryController_1.bulkMarkPaid);
router.get('/analytics/group-wise', expenseEntryController_1.getGroupWise);
router.get('/analytics/day-wise', expenseEntryController_1.getDayWise);
exports.default = router;
//# sourceMappingURL=expenseEntryRoutes.js.map