import pool from "../db/connection.js";

export async function getAllUsers() {
    const [rows] = await pool.query(
        `
        SELECT
            id,
            name,
            username,
            email,
            avatar,
            bio,
            streak,
            last_streak_cycle_id,
            created_at
        FROM users
        ORDER BY created_at DESC
        `
    );

    return rows;
}

export async function createUser(userData) {
    const {
        id,
        name,
        username,
        email,
        avatar,
        bio
    } = userData;

    await pool.query(
        `
        INSERT INTO users (
            id,
            name,
            username,
            email,
            avatar,
            bio
        )
        VALUES (?, ?, ?, ?, ?, ?)
        `,
        [
            id,
            name,
            username,
            email,
            avatar || null,
            bio || null
        ]
    );

    return {
        id,
        name,
        username,
        email,
        avatar: avatar || null,
        bio: bio || null,
        streak: 0,
        lastStreakCycleId: null
    };
}