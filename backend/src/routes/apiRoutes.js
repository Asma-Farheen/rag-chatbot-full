import express from "express";
import { getHealth, getRoot } from "../controllers/healthController.js";
import { queryRag } from "../controllers/ragController.js";
import { handleChat, getSessionHistory, clearSessionHistory } from "../controllers/chatController.js";

const router = express.Router();

// Health
router.get("/", getRoot);
router.get("/health", getHealth);

// RAG
router.post("/api/query", queryRag);

// Chat
router.post("/api/chat", handleChat);
router.get("/api/session/:id/history", getSessionHistory);
router.post("/api/session/:id/clear", clearSessionHistory);

export default router;
