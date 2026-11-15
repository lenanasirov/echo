import {
    decryptRefreshToken,
    encryptRefreshToken
} from "./spotifyTokenCrypto.js";

export const SpotifyOAuthStateErrorCodes = {
    missing: "missing",
    expired: "expired",
    reused: "reused",
    wrongUser: "wrong_user"
};

export class SpotifyOAuthStateError extends Error {
    constructor(code, message) {
        super(message);
        this.name = "SpotifyOAuthStateError";
        this.code = code;
    }
}

export function createSpotifyConnectionService({ query, encryptionKey, getConnection }) {
    if (typeof query !== "function") {
        throw new Error("A database query function is required.");
    }

    if (!Buffer.isBuffer(encryptionKey) || encryptionKey.length !== 32) {
        throw new Error("A 32-byte Spotify token encryption key is required.");
    }

    // The real MySQL pool passes getConnection, allowing the OAuth claim and
    // verifier read to run in one transaction on the same physical connection.
    if (getConnection != null && typeof getConnection !== "function") {
        throw new Error("getConnection must be a function when provided.");
    }

    async function upsertUserSpotifyConnection(userId, connection) {
        const echoUserId = assertEchoUserId(userId);
        const refreshToken = connection?.refreshToken;
        const encryptedRefreshToken = encryptRefreshToken(
            refreshToken,
            encryptionKey
        );

        await query(
            `
            INSERT INTO user_spotify_connections (
                user_id,
                refresh_token_encrypted,
                spotify_user_id,
                scope
            )
            VALUES (?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
                refresh_token_encrypted = VALUES(refresh_token_encrypted),
                spotify_user_id = VALUES(spotify_user_id),
                scope = VALUES(scope)
            `,
            [
                echoUserId,
                encryptedRefreshToken,
                normalizeOptionalString(connection?.spotifyUserId),
                normalizeOptionalString(connection?.scope)
            ]
        );

        return getUserSpotifyConnection(echoUserId);
    }

    async function getUserSpotifyConnection(userId) {
        const echoUserId = assertEchoUserId(userId);
        const [rows] = await query(
            `
            SELECT
                user_id,
                spotify_user_id,
                scope,
                created_at,
                updated_at
            FROM user_spotify_connections
            WHERE user_id = ?
            `,
            [echoUserId]
        );

        const row = rows[0];

        if (!row) {
            return null;
        }

        return mapConnectionRow(row);
    }

    async function getUserSpotifyRefreshToken(userId) {
        const echoUserId = assertEchoUserId(userId);
        const [rows] = await query(
            `
            SELECT refresh_token_encrypted
            FROM user_spotify_connections
            WHERE user_id = ?
            `,
            [echoUserId]
        );

        const encryptedRefreshToken = rows[0]?.refresh_token_encrypted;

        if (!encryptedRefreshToken) {
            return null;
        }

        return decryptRefreshToken(encryptedRefreshToken, encryptionKey);
    }

    async function deleteUserSpotifyConnection(userId) {
        const echoUserId = assertEchoUserId(userId);
        const [result] = await query(
            `
            DELETE FROM user_spotify_connections
            WHERE user_id = ?
            `,
            [echoUserId]
        );

        return Number(result?.affectedRows) > 0;
    }

    async function saveUserSpotifyOAuthState(userId, oauthState) {
        const echoUserId = assertEchoUserId(userId);
        const state = assertRequiredString(oauthState?.state, "OAuth state");
        const codeVerifier = assertRequiredString(
            oauthState?.codeVerifier,
            "PKCE code verifier"
        );
        const expiresAt = assertExpiresAt(oauthState?.expiresAt);

        await query(
            `
            INSERT INTO user_spotify_oauth_states (
                user_id,
                state,
                code_verifier,
                expires_at,
                consumed_at
            )
            VALUES (?, ?, ?, ?, NULL)
            ON DUPLICATE KEY UPDATE
                state = VALUES(state),
                code_verifier = VALUES(code_verifier),
                expires_at = VALUES(expires_at),
                consumed_at = NULL
            `,
            [echoUserId, state, codeVerifier, expiresAt]
        );

        return {
            userId: echoUserId,
            state,
            expiresAt
        };
    }

    async function consumeUserSpotifyOAuthState(userId, state) {
        const echoUserId = assertEchoUserId(userId);
        const oauthState = assertRequiredString(state, "OAuth state");

        // In production, getConnection is passed from mysql2/promise. A single
        // transaction holds the UPDATE row lock until its verifier is read.
        // This prevents a concurrent Connect from overwriting the row between
        // the claim and the verifier lookup.
        let claimed;
        if (getConnection) {
            const connection = await getConnection();
            try {
                await connection.beginTransaction();
                claimed = await claimOAuthStateWithQuery(
                    (...args) => connection.query(...args), echoUserId, oauthState
                );
                await connection.commit();
            } catch (error) {
                try {
                    await connection.rollback();
                } catch {
                    // Preserve the original failure.
                }
                throw error;
            } finally {
                connection.release();
            }
        } else {
            // Unit-test adapter for injected query mocks. The production
            // integration MUST provide getConnection to guarantee isolation.
            claimed = await claimOAuthStateWithQuery(query, echoUserId, oauthState);
        }

        if (claimed) {
            return { userId: echoUserId, state: oauthState, codeVerifier: claimed };
        }
        throw await classifyFailedOAuthStateClaim(echoUserId, oauthState);
    }

    async function claimOAuthStateWithQuery(runQuery, echoUserId, oauthState) {
        const [updateResult] = await runQuery(
            `
            UPDATE user_spotify_oauth_states
            SET consumed_at = CURRENT_TIMESTAMP(3)
            WHERE state = ?
              AND user_id = ?
              AND consumed_at IS NULL
              AND expires_at > CURRENT_TIMESTAMP(3)
            `,
            [oauthState, echoUserId]
        );

        if (Number(updateResult?.affectedRows) !== 1) {
            return null;
        }

        const [rows] = await runQuery(
            `
            SELECT code_verifier
            FROM user_spotify_oauth_states
            WHERE user_id = ?
              AND state = ?
              AND consumed_at IS NOT NULL
            `,
            [echoUserId, oauthState]
        );

        const codeVerifier = rows[0]?.code_verifier;
        if (!codeVerifier) {
            throw new SpotifyOAuthStateError(
                SpotifyOAuthStateErrorCodes.missing,
                "Spotify authorization could not be verified."
            );
        }
        return codeVerifier;
    }

    async function classifyFailedOAuthStateClaim(echoUserId, oauthState) {
        const [rows] = await query(
            `
            SELECT
                user_id,
                consumed_at,
                expires_at
            FROM user_spotify_oauth_states
            WHERE state = ?
            `,
            [oauthState]
        );

        const row = rows[0];

        if (!row) {
            return new SpotifyOAuthStateError(
                SpotifyOAuthStateErrorCodes.missing,
                "Spotify authorization could not be verified."
            );
        }

        if (!isSameEchoUserId(row.user_id, echoUserId)) {
            return new SpotifyOAuthStateError(
                SpotifyOAuthStateErrorCodes.wrongUser,
                "Spotify authorization could not be verified."
            );
        }

        if (row.consumed_at) {
            return new SpotifyOAuthStateError(
                SpotifyOAuthStateErrorCodes.reused,
                "Spotify authorization has already been used."
            );
        }

        if (isExpiredTimestamp(row.expires_at)) {
            return new SpotifyOAuthStateError(
                SpotifyOAuthStateErrorCodes.expired,
                "Spotify authorization expired. Please connect again."
            );
        }

        return new SpotifyOAuthStateError(
            SpotifyOAuthStateErrorCodes.missing,
            "Spotify authorization could not be verified."
        );
    }

    return {
        upsertUserSpotifyConnection,
        getUserSpotifyConnection,
        getUserSpotifyRefreshToken,
        deleteUserSpotifyConnection,
        saveUserSpotifyOAuthState,
        consumeUserSpotifyOAuthState
    };
}

function mapConnectionRow(row) {
    return {
        userId: row.user_id,
        spotifyUserId: row.spotify_user_id ?? null,
        scope: row.scope ?? null,
        createdAt: row.created_at,
        updatedAt: row.updated_at
    };
}

function assertEchoUserId(userId) {
    if (typeof userId === "number" && Number.isInteger(userId) && userId > 0) {
        return userId;
    }

    if (typeof userId === "string" && /^\d+$/.test(userId) && userId !== "0") {
        return userId;
    }

    throw new Error("An authenticated Echo user ID is required.");
}

function assertRequiredString(value, label) {
    if (typeof value !== "string" || value.trim().length === 0) {
        throw new Error(`${label} is required.`);
    }

    return value;
}

function assertExpiresAt(value) {
    const expiresAt = value instanceof Date ? value : new Date(value);

    if (Number.isNaN(expiresAt.getTime())) {
        throw new Error("A valid OAuth state expiration is required.");
    }

    return expiresAt;
}

function normalizeOptionalString(value) {
    if (value == null) {
        return null;
    }

    if (typeof value !== "string") {
        throw new Error("Optional Spotify connection fields must be strings.");
    }

    const trimmed = value.trim();
    return trimmed.length === 0 ? null : trimmed;
}

function isSameEchoUserId(left, right) {
    return String(left) === String(right);
}

function isExpiredTimestamp(value) {
    const expiresAt = value instanceof Date ? value : new Date(value);

    if (Number.isNaN(expiresAt.getTime())) {
        return true;
    }

    return expiresAt.getTime() <= Date.now();
}
