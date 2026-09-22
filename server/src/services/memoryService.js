import pool from "../db/connection.js";

export async function getAllMemories(userId=null) {
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
            u.avatar AS user_avatar,
    
            COUNT(DISTINCT ml.user_id) AS like_count,
            COUNT(DISTINCT mc.id) AS comment_count,
    
            CASE
                WHEN ? IS NOT NULL
                     AND EXISTS (
                         SELECT 1
                         FROM memory_likes current_user_like
                         WHERE current_user_like.memory_id = m.id
                           AND current_user_like.user_id = ?
                     )
                THEN TRUE
                ELSE FALSE
            END AS liked_by_current_user
    
        FROM memories m
    
        INNER JOIN users u
            ON m.user_id = u.id
    
        LEFT JOIN memory_likes ml
            ON ml.memory_id = m.id

        LEFT JOIN memory_comments mc
            ON mc.memory_id = m.id
    
        GROUP BY
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
            u.name,
            u.username,
            u.avatar
    
        ORDER BY m.created_at DESC
        `,
        [userId, userId]
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

export async function likeMemory(memoryId, userId) {
    const [memoryRows] = await pool.query(
        `
            SELECT id
            FROM memories
            WHERE id = ?
        `,
        [memoryId]
    );

    if (memoryRows.length === 0) {
        const error = new Error("Memory not found.");
        error.status = 404;
        throw error;
    }

    try {
        await pool.query(
            `
                INSERT INTO memory_likes (
                    memory_id,
                    user_id
                )
                VALUES (?, ?)
            `,
            [
                memoryId,
                userId
            ]
        );
    } catch (error) {
        if (error.code === "ER_DUP_ENTRY") {
            const duplicateError = new Error("Memory already liked.");
            duplicateError.status = 409;
            throw duplicateError;
        }

        throw error;        
    }
}

export async function unlikeMemory(memoryId, userId) {
    const [result] = await pool.query(
        `
            DELETE FROM memory_likes
            WHERE memory_id = ?
            AND user_id = ?
        `,
        [
            memoryId,
            userId
        ]
    );

    if (result.affectedRows === 0) {
        const error = new Error("Memory is not liked by this user.");
        error.status = 404;
        throw error;
    }
}

export async function getMemoryComments(memoryId) {
    const [memoryRows] = await pool.query(
        `
        SELECT id
        FROM memories
        WHERE id = ?
        `,
        [memoryId]
    );

    if (memoryRows.length === 0) {
        const error = new Error("Memory not found.");
        error.status = 404;
        throw error;
    }

    const [rows] = await pool.query(        
        `
        SELECT
            mc.id,
            mc.memory_id,
            mc.user_id,
            mc.content,
            mc.created_at,
            u.name AS user_name,
            u.username AS user_username,
            u.avatar AS user_avatar
        FROM memory_comments mc
        INNER JOIN users u
            ON mc.user_id = u.id
        WHERE mc.memory_id = ?
        ORDER BY mc.created_at ASC
        `,
        [memoryId]
    );

    return rows;
}

export async function createMemoryComment({
    memoryId,
    userId, 
    content
}) {
    const [memoryRows] = await pool.query(
        `
            SELECT id
            FROM memories
            WHERE id = ?
        `,
        [memoryId]
    );

    if (memoryRows.length === 0) {
        const error = new Error("Memory not found.");
        error.status = 404;
        throw error;
    }

    if (!content || !content.trim()) {
        const error = new Error("Comment content is required.");
        error.status = 400;
        throw error;
    }


    const [result] =await pool.query(
        `
        INSERT INTO memory_comments (
            memory_id,
            user_id,
            content
        )
        VALUES (?, ?, ?)
        `,
        [
            memoryId,
            userId,
            content.trim()
        ]
    );

    const [rows] = await pool.query(
        `
        SELECT
            mc.id,
            mc.memory_id,
            mc.user_id,
            mc.content,
            mc.created_at,
            u.name AS user_name,
            u.username AS user_username,
            u.avatar AS user_avatar
        FROM memory_comments mc
        INNER JOIN users u
            ON mc.user_id = u.id
        WHERE mc.id = ?
        `,
        [result.insertId]
    );

    return rows[0];
}

export async function updateMemoryComment({
    memoryId,
    commentId,
    userId,
    content
}) {
    if(!content || !content.trim()) {
        const error = new Error("Comment content is required.");
        error.status = 400;
        throw error;
    }

    const [commentRows] = await pool.query(
        `
        SELECT 
            id,
            user_id
        FROM memory_comments
        WHERE id = ?
            AND memory_id = ?
        `,
        [
            commentId,
            memoryId
        ]
    );

    if (commentRows.length === 0) {
        const error = new Error("Comment not found.");
        error.status = 404;
        throw error;
    }

    if(commentRows[0].user_id !== userId) {
        const error = new Error("You can only modify your own comments.");
        error.status = 403;
        throw error;
    }

    await pool.query(
        `
        UPDATE memory_comments
        SET content = ?
        WHERE id = ?
        `,
        [
            content.trim(),
            commentId
        ]
    );

    const [rows] = await pool.query(
        `
        SELECT
            mc.id,
            mc.memory_id,
            mc.user_id,
            mc.content,
            mc.created_at,
            u.name AS user_name,
            u.username AS user_username,
            u.avatar AS user_avatar
        FROM memory_comments mc
        INNER JOIN users u
            ON mc.user_id = u.id
        WHERE mc.id = ?
        `,
        [commentId]
    );

    return rows[0];
}

export async function deleteMemoryComment({
    memoryId,
    commentId,
    userId
}) {
    const [commentRows] = await pool.query(
        `
        SELECT 
            id,
            user_id
        FROM memory_comments
        WHERE id = ?
            AND memory_id = ?
        `,
        [
            commentId,
            memoryId
        ]
    );

    if (commentRows.length === 0) {
        const error = new Error("Comment not found.");
        error.status = 404;
        throw error;
    }

    if(commentRows[0].user_id !== userId) {
        const error = new Error("You can only modify your own comments.");
        error.status = 403;
        throw error;
    }

    await pool.query(
        `
        DELETE FROM memory_comments
        WHERE id = ?
        `,
        [
            commentId
        ]
    );
}