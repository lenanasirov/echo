import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
    createSpotifySessionService,
    SpotifySessionError
} from "./spotifySessionService.js";
import { createSpotifySessionController } from "../controllers/spotifySessionController.js";

const USER_A = "101";
const USER_B = "202";
const A_REFRESH = "refresh-user-a";
const B_REFRESH = "refresh-user-b";

function harness({ provider = () => tokenResponse(), now = () => 1_000_000 } = {}) {
    const store = new Map();
    let serial = 0;
    const metrics = { calls: [], refreshCount: 0, rotations: 0, deletes: 0 };
    const put = (id, refreshToken, metadata = {}) => {
        store.set(String(id), {
            refreshToken,
            encryptedVersion: `encrypted-v${++serial}`,
            spotifyUserId: metadata.spotifyUserId ?? `spotify-${id}`,
            scope: metadata.scope ?? "streaming"
        });
    };
    put(USER_A, A_REFRESH);
    put(USER_B, B_REFRESH);
    const repo = {
        async getUserSpotifyConnection(id) {
            const item = store.get(String(id));
            return item ? { spotifyUserId: item.spotifyUserId, scope: item.scope } : null;
        },
        async getUserSpotifyRefreshTokenSnapshot(id) {
            const row = store.get(String(id));
            return row ? { refreshToken: row.refreshToken, encryptedVersion: row.encryptedVersion } : null;
        },
        async rotateUserSpotifyRefreshTokenIfUnchanged(id, expected, newToken) {
            const row = store.get(String(id));
            if (!row || row.encryptedVersion !== expected) return null;
            metrics.rotations++;
            row.refreshToken = newToken;
            row.encryptedVersion = `encrypted-v${++serial}`;
            return { encryptedVersion: row.encryptedVersion };
        },
        async deleteUserSpotifyConnectionIfUnchanged(id, expected) {
            const row = store.get(String(id));
            if (!row || row.encryptedVersion !== expected) return false;
            metrics.deletes++;
            store.delete(String(id));
            return true;
        },
        async deleteUserSpotifyConnection(id) {
            metrics.deletes++;
            return store.delete(String(id));
        }
    };
    const fetchImpl = async (url, options) => {
        metrics.calls.push({ url, options });
        metrics.refreshCount++;
        return provider(url, options, { store, put, metrics });
    };
    const service = createSpotifySessionService({
        connectionService: repo,
        clientId: "test-client-id",
        now,
        fetchImpl
    });
    return { service, repo, store, put, metrics };
}

function tokenResponse(accessToken = "access-user-a", extra = {}) {
    return new Response(JSON.stringify({
        access_token: accessToken,
        expires_in: 3600,
        token_type: "Bearer",
        ...extra
    }), { status: 200, headers: { "Content-Type": "application/json" } });
}
function spotifyError(status, code, headers = {}) {
    return new Response(JSON.stringify({ error: code }), {
        status, headers: { "Content-Type": "application/json", ...headers }
    });
}
async function rejectCode(operation, code, status) {
    await assert.rejects(operation, (error) =>
        error instanceof SpotifySessionError && error.code === code &&
        (status == null || error.status === status));
}

function makeResponse() {
    return {
        statusCode: 200, headers: {}, payload: null,
        set(name, value) { this.headers[name] = value; return this; },
        status(value) { this.statusCode = value; return this; },
        json(value) { this.payload = value; return this; }
    };
}

describe("Spotify user-session service — Batch 4", () => {
    it("reports connected status and metadata without tokens", async () => {
        const h = harness();
        const status = await h.service.getStatus(USER_A);
        assert.deepEqual(status, { connected: true, spotifyUserId: `spotify-${USER_A}`, scope: "streaming" });
        assert.equal(JSON.stringify(status).includes(A_REFRESH), false);
        assert.equal(JSON.stringify(status).includes("encrypted-v"), false);
    });

    it("reports disconnected without a saved connection", async () => {
        const h = harness();
        h.store.delete(USER_A);
        assert.deepEqual(await h.service.getStatus(USER_A), {
            connected: false, spotifyUserId: null, scope: null
        });
        await rejectCode(() => h.service.getAccessToken(USER_A), "spotify_reauthorization_required", 401);
        assert.equal(h.metrics.refreshCount, 0);
    });

    it("refreshes using PKCE parameters and never returns the refresh token", async () => {
        const h = harness();
        const data = await h.service.getAccessToken(USER_A);
        const call = h.metrics.calls[0];
        assert.equal(call.url, "https://accounts.spotify.com/api/token");
        assert.equal(call.options.method, "POST");
        assert.equal(call.options.headers["Content-Type"], "application/x-www-form-urlencoded");
        const params = new URLSearchParams(call.options.body);
        assert.equal(params.get("grant_type"), "refresh_token");
        assert.equal(params.get("refresh_token"), A_REFRESH);
        assert.equal(params.get("client_id"), "test-client-id");
        assert.equal(call.options.headers.Authorization, undefined);
        assert.equal(data.accessToken, "access-user-a");
        assert.equal(data.expiresIn, 3600);
        assert.equal(JSON.stringify(data).includes(A_REFRESH), false);
    });

    it("reuses a still-valid access token without additional Spotify calls", async () => {
        const h = harness();
        await h.service.getAccessToken(USER_A);
        const second = await h.service.getAccessToken(USER_A);
        assert.equal(second.accessToken, "access-user-a");
        assert.equal(h.metrics.refreshCount, 1);
    });

    it("refreshes again when the cached access token approaches expiry", async () => {
        let nowMs = 0;
        const h = harness({ now: () => nowMs });
        await h.service.getAccessToken(USER_A);
        nowMs = 3_550_000;
        await h.service.getAccessToken(USER_A);
        assert.equal(h.metrics.refreshCount, 2);
    });

    it("rotates the refresh token when Spotify returns a new one", async () => {
        const h = harness({ provider: () => tokenResponse("a-token", { refresh_token: "refresh-next" }) });
        const data = await h.service.getAccessToken(USER_A);
        assert.equal(data.accessToken, "a-token");
        assert.equal(h.metrics.rotations, 1);
        assert.equal(h.store.get(USER_A).refreshToken, "refresh-next");
        assert.equal(JSON.stringify(data).includes("refresh-next"), false);
    });

    it("keeps the existing refresh token when Spotify omits a new one", async () => {
        const h = harness();
        await h.service.getAccessToken(USER_A);
        assert.equal(h.store.get(USER_A).refreshToken, A_REFRESH);
        assert.equal(h.metrics.rotations, 0);
    });

    it("keeps tokens independent for two Echo users", async () => {
        const h = harness({ provider: (_url, options) => {
            const token = new URLSearchParams(options.body).get("refresh_token");
            return tokenResponse(token === A_REFRESH ? "access-A" : "access-B");
        } });
        assert.equal((await h.service.getAccessToken(USER_A)).accessToken, "access-A");
        assert.equal((await h.service.getAccessToken(USER_B)).accessToken, "access-B");
        assert.equal((await h.service.getAccessToken(USER_A)).accessToken, "access-A");
        assert.equal(h.metrics.refreshCount, 2);
    });

    it("coalesces concurrent refresh calls for the same Echo user", async () => {
        let resolveProvider;
        const started = new Promise((resolve) => { resolveProvider = resolve; });
        let completeProvider;
        const wait = new Promise((resolve) => { completeProvider = resolve; });
        const h = harness({ provider: async () => { resolveProvider(); await wait; return tokenResponse(); } });
        const one = h.service.getAccessToken(USER_A);
        const two = h.service.getAccessToken(USER_A);
        const three = h.service.getAccessToken(USER_A);
        await started;
        completeProvider();
        const tokens = await Promise.all([one, two, three]);
        assert.equal(tokens.length, 3);
        assert.equal(h.metrics.refreshCount, 1);
        assert.ok(tokens.every((t) => t.accessToken === "access-user-a"));
    });

    it("removes the saved connection only for invalid_grant", async () => {
        const h = harness({ provider: () => spotifyError(400, "invalid_grant") });
        await rejectCode(() => h.service.getAccessToken(USER_A), "spotify_reauthorization_required", 401);
        assert.equal(h.store.has(USER_A), false);
        assert.equal(h.store.has(USER_B), true);
        assert.equal(h.metrics.deletes, 1);
    });

    it("does NOT erase the connection after network error", async () => {
        const h = harness({ provider: async () => { throw new Error("network failed"); } });
        await rejectCode(() => h.service.getAccessToken(USER_A), "spotify_session_unavailable", 503);
        assert.equal(h.store.get(USER_A).refreshToken, A_REFRESH);
        assert.equal(h.metrics.deletes, 0);
    });

    it("does NOT erase a connection after 429 and exposes a safe Retry-After", async () => {
        const h = harness({ provider: () => spotifyError(429, "slow_down", { "Retry-After": "12" }) });
        await assert.rejects(() => h.service.getAccessToken(USER_A), (error) => {
            assert.equal(error.code, "spotify_rate_limited");
            assert.equal(error.retryAfterSeconds, 12);
            assert.equal(error.status, 429);
            return true;
        });
        assert.equal(h.store.has(USER_A), true);
    });

    it("does NOT erase the connection for 500, 401, or invalid JSON", async () => {
        for (const status of [500, 401]) {
            const h = harness({ provider: () => spotifyError(status, "server_error") });
            await rejectCode(() => h.service.getAccessToken(USER_A), "spotify_session_unavailable", 503);
            assert.equal(h.store.has(USER_A), true);
        }
        const h = harness({ provider: () => new Response("not-json", { status: 200 }) });
        await rejectCode(() => h.service.getAccessToken(USER_A), "spotify_session_unavailable", 503);
        assert.equal(h.store.has(USER_A), true);
    });

    it("does NOT erase the connection for an incomplete token response", async () => {
        const h = harness({ provider: () => tokenResponse("", { expires_in: 0 }) });
        await rejectCode(() => h.service.getAccessToken(USER_A), "spotify_session_unavailable", 503);
        assert.equal(h.store.has(USER_A), true);
    });

    it("cannot overwrite a newer authorization during refresh-token rotation", async () => {
        const h = harness({ provider: (_url, _opts, { put }) => {
            put(USER_A, "brand-new-login");
            return tokenResponse("obsolete-access", { refresh_token: "obsolete-rotated-token" });
        } });
        await rejectCode(() => h.service.getAccessToken(USER_A), "spotify_connection_changed", 409);
        assert.equal(h.store.get(USER_A).refreshToken, "brand-new-login");
    });

    it("cannot delete a newer authorization after stale invalid_grant", async () => {
        const h = harness({ provider: (_url, _opts, { put }) => {
            put(USER_A, "brand-new-login");
            return spotifyError(400, "invalid_grant");
        } });
        await rejectCode(() => h.service.getAccessToken(USER_A), "spotify_connection_changed", 409);
        assert.equal(h.store.get(USER_A).refreshToken, "brand-new-login");
    });

    it("explicit disconnect is idempotent, user-bound, and invalidates cache", async () => {
        const h = harness();
        await h.service.getAccessToken(USER_A);
        assert.deepEqual(await h.service.disconnect(USER_A), { disconnected: true });
        assert.deepEqual(await h.service.disconnect(USER_A), { disconnected: true });
        assert.equal(h.store.has(USER_A), false);
        assert.equal(h.store.has(USER_B), true);
        await rejectCode(() => h.service.getAccessToken(USER_A), "spotify_reauthorization_required", 401);
        assert.equal(h.metrics.refreshCount, 1);
    });

    it("rejects requests missing an authenticated Echo user", async () => {
        const h = harness();
        await rejectCode(() => h.service.getStatus(null), "authentication_required", 401);
        await rejectCode(() => h.service.getAccessToken(undefined), "authentication_required", 401);
        await rejectCode(() => h.service.disconnect("bad-user"), "authentication_required", 401);
    });

    it("fails safely on database read/write errors", async () => {
        const h = harness();
        h.repo.getUserSpotifyRefreshTokenSnapshot = async () => { throw new Error("sensitive sql error"); };
        await rejectCode(() => h.service.getAccessToken(USER_A), "spotify_session_unavailable", 503);
        assert.equal(h.store.has(USER_A), true);
        h.repo.deleteUserSpotifyConnection = async () => { throw new Error("database disconnected"); };
        await rejectCode(() => h.service.disconnect(USER_A), "spotify_session_unavailable", 503);
    });
});

describe("Spotify session controller", () => {
    it("uses only req.user.id, never client supplied userId", async () => {
        const h = harness();
        const controller = createSpotifySessionController(h.service);
        const res = makeResponse();
        await controller.status({ user: { id: USER_A }, body: { userId: USER_B } }, res, () => {});
        assert.equal(res.statusCode, 200);
        assert.equal(res.payload.data.spotifyUserId, `spotify-${USER_A}`);
        assert.equal(res.headers["Cache-Control"], "no-store");
        const tokenRes = makeResponse();
        await controller.accessToken({ user: { id: USER_A }, body: { userId: USER_B } }, tokenRes, () => {});
        assert.equal(tokenRes.payload.data.accessToken, "access-user-a");
        assert.equal(tokenRes.headers["Cache-Control"], "no-store");
        const disconnectRes = makeResponse();
        await controller.disconnect({ user: { id: USER_A }, body: { userId: USER_B } }, disconnectRes, () => {});
        assert.equal(h.store.has(USER_A), false);
        assert.equal(h.store.has(USER_B), true);
    });

    it("returns safe no-store errors without disclosing tokens", async () => {
        const h = harness({ provider: () => spotifyError(400, "invalid_grant") });
        const controller = createSpotifySessionController(h.service);
        const res = makeResponse();
        await controller.accessToken({ user: { id: USER_A } }, res, () => {});
        assert.equal(res.statusCode, 401);
        assert.equal(res.payload.code, "spotify_reauthorization_required");
        assert.equal(res.headers["Cache-Control"], "no-store");
        assert.equal(JSON.stringify(res.payload).includes(A_REFRESH), false);
    });
});
