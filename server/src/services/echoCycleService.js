import pool from "../db/connection.js";

export async function getAllEchoCycles() {
    const [rows] = await pool.query(
        `
        SELECT
            id,
            started_at,
            ends_at,
            previous_cycle_id,
            created_at
        FROM echo_cycles
        ORDER BY started_at DESC
        `
    );

    return rows;
}