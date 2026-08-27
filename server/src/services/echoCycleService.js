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


export async function createEchoCycle(cycleData) {
    const {
        id,
        startedAt,
        endsAt,
        previousCycleId
    } = cycleData;

    const startedAtMySQL = new Date(startedAt)
        .toISOString()
        .slice(0, 23)
        .replace("T", " ");

    const endsAtMySQL = new Date(endsAt)
        .toISOString()
        .slice(0, 23)
        .replace("T", " ");

    await pool.query(
        `
        INSERT INTO echo_cycles (
            id,
            started_at,
            ends_at,
            previous_cycle_id
        )
        VALUES (?, ?, ?, ?)
        `,
        [
            id,
            startedAtMySQL,
            endsAtMySQL,
            previousCycleId || null
        ]
    );

    return {
        id,
        startedAt,
        endsAt,
        previousCycleId: previousCycleId || null
    };
}