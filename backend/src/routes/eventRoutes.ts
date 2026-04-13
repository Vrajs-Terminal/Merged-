import express from "express";
import { createEvent, getEvents, getEventById, updateEvent, deleteEvent, rsvpEvent, getEventsReport } from "../controllers/eventController";

const router = express.Router();

router.get("/", getEvents);
router.get("/report", getEventsReport);
router.get("/:id", getEventById);
router.post("/", createEvent);
router.put("/:id", updateEvent);
router.delete("/:id", deleteEvent);
router.post("/rsvp", rsvpEvent);

export default router;
