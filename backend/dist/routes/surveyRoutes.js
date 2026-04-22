"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const surveyController_1 = require("../controllers/surveyController");
const router = (0, express_1.Router)();
// Survey management routes
router.get('/', surveyController_1.surveyController.getAll);
router.get('/:id', surveyController_1.surveyController.getById);
router.post('/', surveyController_1.surveyController.create);
router.put('/:id', surveyController_1.surveyController.update);
router.delete('/:id', surveyController_1.surveyController.delete);
// Submission routes
router.post('/submit', surveyController_1.surveyController.submitResponse);
exports.default = router;
