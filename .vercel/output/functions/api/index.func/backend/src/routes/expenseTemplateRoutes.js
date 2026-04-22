"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const expenseTemplateController_1 = require("../controllers/expenseTemplateController");
const router = (0, express_1.Router)();
router.get('/', expenseTemplateController_1.getTemplates);
router.post('/', expenseTemplateController_1.createTemplate);
router.put('/:id', expenseTemplateController_1.updateTemplate);
router.delete('/:id', expenseTemplateController_1.deleteTemplate);
router.get('/assignments', expenseTemplateController_1.getAssignments);
router.post('/assign', expenseTemplateController_1.assignTemplate);
router.delete('/assignments/:id', expenseTemplateController_1.deleteAssignment);
exports.default = router;
//# sourceMappingURL=expenseTemplateRoutes.js.map