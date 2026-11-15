import assert from "node:assert/strict";
import { describe, it } from "node:test";
import crypto from "node:crypto";

import { decryptRefreshToken } from "./spotifyTokenCrypto.js";
import {
    createSpotifyConnectionService,
    SpotifyOAuthStateError,
    SpotifyOAuthStateErrorCodes
} from "./spotifyConnectionService.js";

const REFRESH_TOKEN = "spotify-refresh-token-value";
const OTHER_REFRESH_TOKEN = "other-user-spotify-refresh-token";

describe("createSpotifyConnectionService", () => {
    it("requires a query function and a 32-byte encryption key", () => {
        const key = createKey();

        assert.throws(
            () => createSpotifyConnectionService({ encryptionKey: key }),
            /query function/
        );
        assert.throws(
            () => createSpotifyConnectionService({
                query: async () => [],
                encryptionKey: crypto.randomBytes(16)
            }),
            /32-byte/
        );
    });
});

describe("Spotify connections", () => {
    it("creates and retrieves a connection without exposing the refresh token", async () => {
        const { service, connections } = createHarness();

        const saved = await service.upsertUserSpotifyConnection(101, {
            refreshToken: REFRESH_TOKEN,
            spotifyUserId: "spotify-user-101",
            scope: "streaming user-read-email"
        });

        assert.equal(saved.userId, 101);
        assert.equal(saved.spotifyUserId, "spotify-user-101");
        assert.equal(saved.scope, "streaming user-read-email");
        assert.equal("refreshToken" in saved, false);
        assert.equal("refresh_token_encrypted" in saved, false);

        const stored = connections.get("101");
        assert.equal(stored.refreshTokenEncrypted.includes(REFRESH_TOKEN), false);
        assert.match(stored.refreshTokenEncrypted, /^v1:[0-9a-f]+:[0-9a-f]+:[0-9a-f]+$/);

        const retrieved = await service.getUserSpotifyConnection(101);
        assert.deepEqual(retrieved, saved);
        assert.equal(
            await service.getUserSpotifyRefreshToken(101),
            REFRESH_TOKEN
        );
    });

    it("encrypts the refresh token before the SQL insert", async () => {
        const { service, statements } = createHarness();

        await service.upsertUserSpotifyConnection(202, {
            refreshToken: REFRESH_TOKEN
        });

        const insert = statements.find((statement) => (
            statement.sql.includes("INSERT INTO user_spotify_connections")
        ));

        assert.ok(insert);
        assert.equal(insert.params[0], 202);
        assert.equal(insert.params.includes(REFRESH_TOKEN), false);
        assert.equal(
            decryptRefreshToken(insert.params[1], insert.key),
            REFRESH_TOKEN
        );
    });

    it("updates an existing connection for the same Echo user", async () => {
        const { service, connections } = createHarness();

        await service.upsertUserSpotifyConnection(303, {
            refreshToken: REFRESH_TOKEN,
            spotifyUserId: "spotify-user-old",
            scope: "streaming"
        });

        const updated = await service.upsertUserSpotifyConnection(303, {
            refreshToken: "rotated-spotify-refresh-token",
            spotifyUserId: "spotify-user-new",
            scope: "streaming user-modify-playback-state"
        });

        assert.equal(updated.spotifyUserId, "spotify-user-new");
        assert.equal(updated.scope, "streaming user-modify-playback-state");
        assert.equal(connections.size, 1);
        assert.equal(
            await service.getUserSpotifyRefreshToken(303),
            "rotated-spotify-refresh-token"
        );
        assert.equal(
            connections.get("303").refreshTokenEncrypted.includes(
                "rotated-spotify-refresh-token"
            ),
            false
        );
    });

    it("keeps connections isolated between Echo users", async () => {
        const { service } = createHarness();

        await service.upsertUserSpotifyConnection(401, {
            refreshToken: REFRESH_TOKEN,
            spotifyUserId: "spotify-a"
        });
        await service.upsertUserSpotifyConnection(402, {
            refreshToken: OTHER_REFRESH_TOKEN,
            spotifyUserId: "spotify-b"
        });

        const userA = await service.getUserSpotifyConnection(401);
        const userB = await service.getUserSpotifyConnection(402);

        assert.equal(userA.spotifyUserId, "spotify-a");
        assert.equal(userB.spotifyUserId, "spotify-b");
        assert.equal(await service.getUserSpotifyRefreshToken(401), REFRESH_TOKEN);
        assert.equal(
            await service.getUserSpotifyRefreshToken(402),
            OTHER_REFRESH_TOKEN
        );
        assert.equal(await service.getUserSpotifyConnection(403), null);
    });

    it("reads an internal refresh-token snapshot with a ciphertext version", async () => {
        const { service } = createHarness();
        await service.upsertUserSpotifyConnection(450, { refreshToken: REFRESH_TOKEN });
        const snapshot = await service.getUserSpotifyRefreshTokenSnapshot(450);
        assert.equal(snapshot.refreshToken, REFRESH_TOKEN);
        assert.ok(snapshot.encryptedVersion.startsWith("v1:"));
        assert.equal(snapshot.encryptedVersion.includes(REFRESH_TOKEN), false);
        assert.equal(await service.getUserSpotifyRefreshTokenSnapshot(9999), null);
    });

    it("conditionally rotates an encrypted refresh token and rejects stale versions", async () => {
        const { service, connections } = createHarness();
        await service.upsertUserSpotifyConnection(451, { refreshToken: REFRESH_TOKEN });
        const old = await service.getUserSpotifyRefreshTokenSnapshot(451);
        const rotated = await service.rotateUserSpotifyRefreshTokenIfUnchanged(
            451, old.encryptedVersion, "rotated-refresh-token"
        );
        assert.ok(rotated.encryptedVersion.startsWith("v1:"));
        assert.notEqual(rotated.encryptedVersion, old.encryptedVersion);
        assert.equal(await service.getUserSpotifyRefreshToken(451), "rotated-refresh-token");
        assert.equal(connections.get("451").refreshTokenEncrypted.includes("rotated-refresh-token"), false);
        assert.equal(
            await service.rotateUserSpotifyRefreshTokenIfUnchanged(451, old.encryptedVersion, "stale"),
            null
        );
        assert.equal(await service.getUserSpotifyRefreshToken(451), "rotated-refresh-token");
    });

    it("conditionally deletes only if the refresh token has not been replaced", async () => {
        const { service } = createHarness();
        await service.upsertUserSpotifyConnection(452, { refreshToken: REFRESH_TOKEN });
        const old = await service.getUserSpotifyRefreshTokenSnapshot(452);
        await service.upsertUserSpotifyConnection(452, { refreshToken: OTHER_REFRESH_TOKEN });
        assert.equal(
            await service.deleteUserSpotifyConnectionIfUnchanged(452, old.encryptedVersion), false
        );
        assert.equal(await service.getUserSpotifyRefreshToken(452), OTHER_REFRESH_TOKEN);
        const current = await service.getUserSpotifyRefreshTokenSnapshot(452);
        assert.equal(
            await service.deleteUserSpotifyConnectionIfUnchanged(452, current.encryptedVersion), true
        );
        assert.equal(await service.getUserSpotifyConnection(452), null);
    });

    it("deletes a connection by Echo user ID only", async () => {
        const { service } = createHarness();

        await service.upsertUserSpotifyConnection(501, {
            refreshToken: REFRESH_TOKEN
        });
        await service.upsertUserSpotifyConnection(502, {
            refreshToken: OTHER_REFRESH_TOKEN
        });

        assert.equal(await service.deleteUserSpotifyConnection(501), true);
        assert.equal(await service.getUserSpotifyConnection(501), null);
        assert.equal(await service.getUserSpotifyRefreshToken(501), null);
        assert.equal(await service.deleteUserSpotifyConnection(501), false);
        assert.equal(
            await service.getUserSpotifyRefreshToken(502),
            OTHER_REFRESH_TOKEN
        );
    });
});

describe("Spotify OAuth states", () => {
    it("saves and consumes a valid unused state exactly once", async () => {
        const { service, statements } = createHarness();
        const expiresAt = minutesFromNow(10);

        await service.saveUserSpotifyOAuthState(601, {
            state: "state-601",
            codeVerifier: "verifier-601",
            expiresAt
        });

        const claimed = await service.consumeUserSpotifyOAuthState(
            601,
            "state-601"
        );

        assert.deepEqual(claimed, {
            userId: 601,
            state: "state-601",
            codeVerifier: "verifier-601"
        });

        const consumeUpdate = statements.find((statement) => (
            statement.sql.includes("UPDATE user_spotify_oauth_states")
        ));

        assert.ok(consumeUpdate);
        assert.match(consumeUpdate.sql, /consumed_at IS NULL/);
        assert.match(consumeUpdate.sql, /expires_at > CURRENT_TIMESTAMP\(3\)/);
        assert.match(consumeUpdate.sql, /user_id = \?/);
        assert.match(consumeUpdate.sql, /state = \?/);
        assert.deepEqual(consumeUpdate.params, ["state-601", 601]);
    });

    it("rejects an expired OAuth state", async () => {
        const { service } = createHarness();

        await service.saveUserSpotifyOAuthState(701, {
            state: "state-701",
            codeVerifier: "verifier-701",
            expiresAt: minutesFromNow(-1)
        });

        await assert.rejects(
            () => service.consumeUserSpotifyOAuthState(701, "state-701"),
            (error) => isOAuthStateError(
                error,
                SpotifyOAuthStateErrorCodes.expired
            )
        );
    });

    it("rejects a reused OAuth state", async () => {
        const { service } = createHarness();

        await service.saveUserSpotifyOAuthState(801, {
            state: "state-801",
            codeVerifier: "verifier-801",
            expiresAt: minutesFromNow(10)
        });

        await service.consumeUserSpotifyOAuthState(801, "state-801");

        await assert.rejects(
            () => service.consumeUserSpotifyOAuthState(801, "state-801"),
            (error) => isOAuthStateError(
                error,
                SpotifyOAuthStateErrorCodes.reused
            )
        );
    });

    it("rejects a state that belongs to a different Echo user", async () => {
        const { service } = createHarness();

        await service.saveUserSpotifyOAuthState(901, {
            state: "state-901",
            codeVerifier: "verifier-901",
            expiresAt: minutesFromNow(10)
        });

        await assert.rejects(
            () => service.consumeUserSpotifyOAuthState(902, "state-901"),
            (error) => isOAuthStateError(
                error,
                SpotifyOAuthStateErrorCodes.wrongUser
            )
        );

        const claimed = await service.consumeUserSpotifyOAuthState(
            901,
            "state-901"
        );

        assert.equal(claimed.codeVerifier, "verifier-901");
    });

    it("rejects a missing OAuth state", async () => {
        const { service } = createHarness();

        await assert.rejects(
            () => service.consumeUserSpotifyOAuthState(1001, "missing-state"),
            (error) => isOAuthStateError(
                error,
                SpotifyOAuthStateErrorCodes.missing
            )
        );
    });

    it("does not return the PKCE verifier on a failed claim lookup", async () => {
        const { service, statements } = createHarness();

        await service.saveUserSpotifyOAuthState(1101, {
            state: "state-1101",
            codeVerifier: "verifier-1101",
            expiresAt: minutesFromNow(10)
        });

        await assert.rejects(
            () => service.consumeUserSpotifyOAuthState(1102, "state-1101"),
            SpotifyOAuthStateError
        );

        const failureLookup = statements.find((statement) => (
            statement.sql.includes("FROM user_spotify_oauth_states") &&
            statement.sql.includes("consumed_at") &&
            !statement.sql.includes("code_verifier")
        ));

        assert.ok(failureLookup);
        assert.equal(failureLookup.sql.includes("code_verifier"), false);
    });


    it("claims and reads the verifier inside one transaction on one MySQL connection", async () => {
        const harness = createHarness();
        const events = [];
        const connection = {
            async beginTransaction() { events.push("begin"); },
            async query(sql, params) {
                events.push(sql.includes("UPDATE user_spotify_oauth_states") ? "update" :
                    sql.includes("code_verifier") ? "read" : "other");
                return harness.query(sql, params);
            },
            async commit() { events.push("commit"); },
            async rollback() { events.push("rollback"); },
            release() { events.push("release"); }
        };
        const service = createSpotifyConnectionService({
            query: harness.query,
            getConnection: async () => connection,
            encryptionKey: harness.key
        });
        await service.saveUserSpotifyOAuthState(1301, {
            state: "state-1301",
            codeVerifier: "verifier-1301",
            expiresAt: minutesFromNow(10)
        });
        const claim = await service.consumeUserSpotifyOAuthState(1301, "state-1301");
        assert.equal(claim.codeVerifier, "verifier-1301");
        assert.deepEqual(events, ["begin", "update", "read", "commit", "release"]);
    });

    it("fails closed if a newer Connect replaces the state before the verifier read in mock mode", async () => {
        const harness = createHarness();
        let replaced = false;
        const queryWithReplacement = async (sql, params) => {
            if (!replaced && sql.includes("SELECT code_verifier")) {
                replaced = true;
                await harness.query(
                    "INSERT INTO user_spotify_oauth_states",
                    [1401, "new-state-1401", "new-verifier-1401", minutesFromNow(10)]
                );
            }
            return harness.query(sql, params);
        };
        const service = createSpotifyConnectionService({
            query: queryWithReplacement,
            encryptionKey: harness.key
        });
        await service.saveUserSpotifyOAuthState(1401, {
            state: "old-state-1401",
            codeVerifier: "old-verifier-1401",
            expiresAt: minutesFromNow(10)
        });
        await assert.rejects(
            () => service.consumeUserSpotifyOAuthState(1401, "old-state-1401"),
            (error) => isOAuthStateError(error, SpotifyOAuthStateErrorCodes.missing)
        );
    });

    it("allows only one concurrent consume to claim a state", async () => {
        const { service, oauthStates } = createHarness();

        await service.saveUserSpotifyOAuthState(1201, {
            state: "state-1201",
            codeVerifier: "verifier-1201",
            expiresAt: minutesFromNow(10)
        });

        const firstClaim = service.consumeUserSpotifyOAuthState(1201, "state-1201");
        const secondClaim = service.consumeUserSpotifyOAuthState(1201, "state-1201");

        const results = await Promise.allSettled([firstClaim, secondClaim]);
        const fulfilled = results.filter((result) => result.status === "fulfilled");
        const rejected = results.filter((result) => result.status === "rejected");

        assert.equal(fulfilled.length, 1);
        assert.equal(rejected.length, 1);
        assert.equal(fulfilled[0].value.codeVerifier, "verifier-1201");
        assert.equal(
            rejected[0].reason.code,
            SpotifyOAuthStateErrorCodes.reused
        );
        assert.equal(oauthStates.get("state-1201").consumeCount, 1);
    });
});

function createHarness() {
    const key = createKey();
    const connections = new Map();
    const oauthStates = new Map();
    const statements = [];
    const query = createMemoryQuery({
        connections,
        oauthStates,
        statements,
        key
    });

    return {
        key,
        query,
        connections,
        oauthStates,
        statements,
        service: createSpotifyConnectionService({
            query,
            encryptionKey: key
        })
    };
}

function createMemoryQuery({ connections, oauthStates, statements, key }) {
    return async (sql, params = []) => {
        statements.push({ sql, params, key });

        if (sql.includes("INSERT INTO user_spotify_connections")) {
            const [userId, encrypted, spotifyUserId, scope] = params;
            const existing = connections.get(String(userId));
            connections.set(String(userId), {
                userId,
                refreshTokenEncrypted: encrypted,
                spotifyUserId: spotifyUserId ?? null,
                scope: scope ?? null,
                createdAt: existing?.createdAt ?? new Date(),
                updatedAt: new Date()
            });

            return [{ affectedRows: existing ? 2 : 1 }];
        }

        if (sql.includes("UPDATE user_spotify_connections")) {
            const [nextEncrypted, userId, expectedEncrypted] = params;
            const current = connections.get(String(userId));
            if (!current || current.refreshTokenEncrypted !== expectedEncrypted) {
                return [{ affectedRows: 0 }];
            }
            current.refreshTokenEncrypted = nextEncrypted;
            return [{ affectedRows: 1 }];
        }

        if (sql.includes("DELETE FROM user_spotify_connections") &&
            sql.includes("refresh_token_encrypted")) {
            const [userId, expectedEncrypted] = params;
            const current = connections.get(String(userId));
            if (!current || current.refreshTokenEncrypted !== expectedEncrypted) {
                return [{ affectedRows: 0 }];
            }
            connections.delete(String(userId));
            return [{ affectedRows: 1 }];
        }

        if (sql.includes("DELETE FROM user_spotify_connections")) {
            const existed = connections.delete(String(params[0]));
            return [{ affectedRows: existed ? 1 : 0 }];
        }

        if (
            sql.includes("SELECT") &&
            sql.includes("FROM user_spotify_connections") &&
            sql.includes("refresh_token_encrypted")
        ) {
            const stored = connections.get(String(params[0]));

            return [[stored
                ? { refresh_token_encrypted: stored.refreshTokenEncrypted }
                : undefined
            ].filter(Boolean)];
        }

        if (sql.includes("SELECT") && sql.includes("FROM user_spotify_connections")) {
            const stored = connections.get(String(params[0]));

            return [[stored
                ? {
                    user_id: stored.userId,
                    spotify_user_id: stored.spotifyUserId,
                    scope: stored.scope,
                    created_at: stored.createdAt,
                    updated_at: stored.updatedAt
                }
                : undefined
            ].filter(Boolean)];
        }

        if (sql.includes("INSERT INTO user_spotify_oauth_states")) {
            const [userId, state, codeVerifier, expiresAt] = params;

            for (const [existingState, row] of oauthStates.entries()) {
                if (String(row.userId) === String(userId)) {
                    oauthStates.delete(existingState);
                }
            }

            oauthStates.set(state, {
                userId,
                state,
                codeVerifier,
                expiresAt,
                consumedAt: null,
                consumeCount: 0
            });

            return [{ affectedRows: 1 }];
        }

        if (sql.includes("UPDATE user_spotify_oauth_states")) {
            const [state, userId] = params;
            const row = oauthStates.get(state);
            const now = Date.now();

            if (
                row &&
                String(row.userId) === String(userId) &&
                row.consumedAt == null &&
                new Date(row.expiresAt).getTime() > now &&
                acquireConsumeLock(row)
            ) {
                row.consumedAt = new Date();
                row.consumeCount += 1;
                return [{ affectedRows: 1 }];
            }

            return [{ affectedRows: 0 }];
        }

        if (
            sql.includes("FROM user_spotify_oauth_states") &&
            sql.includes("code_verifier")
        ) {
            const [userId, state] = params;
            const row = oauthStates.get(state);

            return [[row && String(row.userId) === String(userId)
                ? { code_verifier: row.codeVerifier }
                : undefined
            ].filter(Boolean)];
        }

        if (sql.includes("FROM user_spotify_oauth_states")) {
            const row = oauthStates.get(params[0]);

            return [[row
                ? {
                    user_id: row.userId,
                    consumed_at: row.consumedAt,
                    expires_at: row.expiresAt
                }
                : undefined
            ].filter(Boolean)];
        }

        throw new Error("Unexpected query in unit test harness.");
    };
}

function acquireConsumeLock(row) {
    if (row.claimLock) {
        return false;
    }

    row.claimLock = true;
    return true;
}

function createKey() {
    return crypto.randomBytes(32);
}

function minutesFromNow(minutes) {
    return new Date(Date.now() + minutes * 60_000);
}

function isOAuthStateError(error, code) {
    return error instanceof SpotifyOAuthStateError && error.code === code;
}
