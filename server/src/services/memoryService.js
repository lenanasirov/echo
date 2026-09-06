import pool from "../db/connection.js";

export async function getAllMemories() {
    const [rows] = await pool.query(
        `
        SELECT
            m.id,
            m.user_id,
            m.cycle_id,
            m.song_id,
            m.song_title,
            m.song_artist,
            m.mood,
            m.caption,
            m.location,
            m.image_url,
            m.created_at,

            u.name AS user_name,
            u.username AS user_username,
            u.avatar AS user_avatar

        FROM memories m

        INNER JOIN users u
            ON m.user_id = u.id

        ORDER BY m.created_at DESC
        `
    );

    return rows;
}

export async function createMemory(memoryData) {
    const {
        id,
        userId,
        cycleId,
        songId,
        songTitle,
        songArtist,
        mood,
        caption,
        location,
        imageUrl
    } = memoryData;

    await pool.query(
        `
        INSERT INTO memories (
            id,
            user_id,
            cycle_id,
            song_id,
            song_title,
            song_artist,
            mood,
            caption,
            location,
            image_url
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
            id,
            userId,
            cycleId,
            songId || null,
            songTitle || null,
            songArtist || null,
            mood || null,
            caption || null,
            location || null,
            imageUrl || null
        ]
    );

    const [rows] = await pool.query(
        `
        SELECT
            m.id,
            m.user_id,
            m.cycle_id,
            m.song_id,
            m.song_title,
            m.song_artist,
            m.mood,
            m.caption,
            m.location,
            m.image_url,
            m.created_at,
            u.name AS user_name,
            u.username AS user_username,
            u.avatar AS user_avatar
        FROM memories m
        INNER JOIN users u
            ON m.user_id = u.id
        WHERE m.id = ?
        `,
        [id]
    );

    return rows[0];
}