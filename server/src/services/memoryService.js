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