import express from "express";
import { 
    getLedgerTransactions, createLedgerTransaction, deleteLedgerTransaction 
} from "../controllers/ledgerController";

const router = express.Router();

router.get("/", getLedgerTransactions);
router.post("/", createLedgerTransaction);
router.delete("/:id", deleteLedgerTransaction);

export default router;
