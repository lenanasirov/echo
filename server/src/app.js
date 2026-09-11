import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import pool from "./db/connection.js";

import userRoutes from "./routes/userRoutes.js";
import memoryRoutes from "./routes/memoryRoutes.js";
import echoCycleRoutes from "./routes/echoCycleRoutes.js";
import authRoutes from "./routes/authRoutes.js";

import { errorHandler } from "./middleware/errorHandler.js";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(cookieParser());

// Health check
app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        message: "Echo API is running"
    });
});

// Database health check
app.get("/api/health/db", async (req, res) => {
    try {
        const connection = await pool.getConnection();

        connection.release();

        res.json({
            success: true,
            message: "Database connection is working"
        });
    } catch (error) {
        console.error("Database connection failed:", error);

        res.status(500).json({
            success: false,
            message: "Database connection failed"
        });
    }
});

// API routes
app.use("/api/users", userRoutes);
app.use("/api/memories", memoryRoutes);
app.use("/api/echo-cycles", echoCycleRoutes);
app.use("/api/auth", authRoutes);

// Error handling
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;


app.listen(PORT, () => {
    console.log(`Echo API running on http://localhost:${PORT}`);
});