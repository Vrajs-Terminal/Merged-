import express from "express";
import * as PollController from "../controllers/pollController";

const router = express.Router();

router.get("/", PollController.getAllPolls);
router.post("/", PollController.createPoll);
router.delete("/:id", PollController.deletePoll);
router.post("/vote", PollController.votePoll);

export default router;
