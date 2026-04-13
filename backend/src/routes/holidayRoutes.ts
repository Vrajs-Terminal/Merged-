import express from "express";
import * as holidayController from "../controllers/holidayController";

const router = express.Router();

// Holidays
router.post("/", holidayController.createHoliday);
router.get("/", holidayController.getHolidays);
router.delete("/:id", holidayController.deleteHoliday);

// Assignments
router.post("/assign", holidayController.assignHoliday);

// Exchange Requests
router.post("/exchange", holidayController.createExchangeRequest);
router.get("/exchange", holidayController.getExchangeRequests);
router.patch("/exchange/:id", holidayController.updateExchangeStatus);

export default router;
