"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const eventController_1 = require("../controllers/eventController");
const router = express_1.default.Router();
router.get("/", eventController_1.getEvents);
router.get("/report", eventController_1.getEventsReport);
router.get("/:id", eventController_1.getEventById);
router.post("/", eventController_1.createEvent);
router.put("/:id", eventController_1.updateEvent);
router.delete("/:id", eventController_1.deleteEvent);
router.post("/rsvp", eventController_1.rsvpEvent);
exports.default = router;
