import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../db/connection.js";

export async function registerUser(userData) {
    const {
        name,
        username,
        email,
        password
    } = userData;

    const passwordHash = await bcrypt.hash(password, 12);

    const userId = Date.now();

    await pool.query(`
        INSERT INTO users (
            id,
            name,
            username,
            email,
            password_hash
        )
        VALUES (?, ?, ?, ?, ?)
    `, [
        userId,
        name,
        username,
        email,
        passwordHash
    ]);

    return {
        id: userId,
        name,
        username,
        email
    };
}

export async function findUserByEmail(email) {
    const [rows] = await pool.query(`
        SELECT
            id,
            name,
            username,
            email,
            password_hash,
            avatar,
            bio,
            streak,
            last_streak_cycle_id,
            created_at
        FROM users
        WHERE email = ?
    `, [email]);

    return rows[0] || null;
}

export async function verifyPassword(password, passwordHash) {
    return bcrypt.compare(password, passwordHash);
}

export function generateToken(userId) {
    return jwt.sign(
        { userId },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRES_IN
        }
    );
}