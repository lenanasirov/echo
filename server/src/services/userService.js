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

export async function updateUser(userId, userData) {
    const allowedFields = {
        name: "name",
        username: "username",
        email: "email",
        avatar: "avatar",
        bio: "bio",
        streak: "streak",
        lastStreakCycleId: "last_streak_cycle_id"
    };

    const updates = [];
    const values = [];

    for (const [field, column] of Object.entries(allowedFields)) {
        if (Object.prototype.hasOwnProperty.call(userData, field)) {
            updates.push(`${column} = ?`);
            values.push(userData[field]);
        }
    }

    if (updates.length === 0) {
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
                last_streak_cycle_id
            FROM users
            WHERE id = ?
            `,
            [userId]
        );

        return rows[0];
    }

    values.push(userId);

    await pool.query(
        `
        UPDATE users
        SET ${updates.join(", ")}
        WHERE id = ?
        `,
        values
    );

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
            last_streak_cycle_id
        FROM users
        WHERE id = ?
        `,
        [userId]
    );

    return rows[0];
}