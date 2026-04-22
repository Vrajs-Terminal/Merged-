"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const escalationController_1 = require("../controllers/escalationController");
const router = (0, express_1.Router)();
router.get('/', escalationController_1.getEscalations);
router.get('/:id', escalationController_1.getEscalationById);
router.post('/', escalationController_1.createEscalation);
router.put('/:id/status', escalationController_1.updateStatus);
router.post('/:id/reply', escalationController_1.addReply);
exports.default = router;
//# sourceMappingURL=escalationRoutes.js.map