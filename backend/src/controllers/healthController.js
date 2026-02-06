import { redisClient } from "../redisClient.js";
import { QDRANT_URL } from "../config/env.js";

export function getHealth(req, res) {
    const redisOk = redisClient && redisClient.isOpen;
    res.json({
        status: "ok",
        message: "Backend running (local)",
        redis: redisOk ? "connected" : "not_connected",
        qdrant: QDRANT_URL,
    });
}

export function getRoot(req, res) {
    res.send("OK");
}
