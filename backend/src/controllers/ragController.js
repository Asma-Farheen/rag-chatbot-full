import { runRagQuery } from "../services/ragService.js";

export async function queryRag(req, res) {
    const { query } = req.body || {};
    if (!query || !query.trim()) return res.status(400).json({ error: "query is required" });

    try {
        const result = await runRagQuery(query);
        res.json(result);
    } catch (err) {
        console.error("Error /api/query:", err);
        res.status(500).json({ error: "Internal server error while processing RAG query." });
    }
}
