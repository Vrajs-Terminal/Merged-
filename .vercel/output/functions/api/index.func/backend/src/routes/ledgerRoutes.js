"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const ledgerController_1 = require("../controllers/ledgerController");
const router = express_1.default.Router();
router.get("/", ledgerController_1.getLedgerTransactions);
router.post("/", ledgerController_1.createLedgerTransaction);
router.delete("/:id", ledgerController_1.deleteLedgerTransaction);
exports.default = router;
//# sourceMappingURL=ledgerRoutes.js.map