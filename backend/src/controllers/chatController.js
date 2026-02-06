import * as chatService from "../services/chatService.js";

export async function handleChat(req, res) {
    const { sessionId, userMessage } = req.body || {};
    if (!sessionId || !userMessage || !userMessage.trim()) {
        return res.status(400).json({ error: "sessionId and userMessage are required" });
    }

    try {
        const result = await chatService.processChat(sessionId, userMessage);
        res.json(result);
    } catch (err) {
        console.error("Error /api/chat:", err);
        res.status(500).json({ error: "Internal server error while processing chat." });
    }
}

export async function getSessionHistory(req, res) {
    try {
        const sessionId = req.params.id;
        const history = await chatService.getHistory(sessionId);
        res.json({ sessionId, history });
    } catch (err) {
        console.error("Error /api/session/:id/history:", err);
        res.status(500).json({ error: "Internal server error" });
    }
}

export async function clearSessionHistory(req, res) {
    try {
        const sessionId = req.params.id;
        const result = await chatService.clearHistory(sessionId);
        res.json(result);
    } catch (err) {
        console.error("Error /api/session/:id/clear:", err);
        res.status(500).json({ error: "Internal server error" });
    }
}
