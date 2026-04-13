import express from "express";
import { 
    getQuotationConfigs, updateQuotationConfigs 
} from "../controllers/quotationConfigController";

const router = express.Router();

router.get("/", getQuotationConfigs);
router.post("/update", updateQuotationConfigs);

export default router;
