import express from "express";
import cors from "cors";
import apiRoutes from "./routes/apiRoutes.js";

const app = express();

// Allow all origins in production (or specify your EC2 IP)
app.use(
    cors({
        origin: true, // Allow all origins
        credentials: true,
    })
);
app.use(express.json());

// Mount routes
app.use(apiRoutes);

export default app;
