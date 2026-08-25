import express from "express";
import cors from "cors";

import pool from "./db/connection.js";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        message: "Echo API is running"
    });
});

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


const PORT = process.env.PORT || 5000;

// Start server
app.listen(PORT, () => {
    console.log(`Echo API running on http://localhost:${PORT}`);
});