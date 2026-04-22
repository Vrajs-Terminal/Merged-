"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const expenseAdvanceController_1 = require("../controllers/expenseAdvanceController");
const router = (0, express_1.Router)();
router.get('/', expenseAdvanceController_1.getAdvances);
router.post('/', expenseAdvanceController_1.createAdvance);
router.put('/:id/approve', expenseAdvanceController_1.approveAdvance);
router.put('/:id/reject', expenseAdvanceController_1.rejectAdvance);
router.put('/:id/adjust', expenseAdvanceController_1.adjustAdvance);
exports.default = router;
//# sourceMappingURL=expenseAdvanceRoutes.js.map