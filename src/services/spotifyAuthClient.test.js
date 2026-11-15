import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createSpotifyAuthClient } from "./spotifyAuthClient.js";

function harness(overrides = {}) {
    const map = new Map(Object.entries(overrides.saved ?? {}));
    const storage = {
        getItem: (k) => map.get(k) ?? null,
        setItem: (k, v) => map.set(k, String(v)),
        removeItem: (k) => map.delete(k)
    };
    const calls = [];
    const routes = overrides.routes ?? {};
    const api = {
        get: async (path) => { calls.push({ method: "get", path }); return routes[`get ${path}`]?.() ?? { data: { data: {} } }; },
        post: async (path, data) => { calls.push({ method: "post", path, data }); return routes[`post ${path}`]?.(data) ?? { data: { data: {} } }; },
        delete: async (path) => { calls.push({ method: "delete", path }); return routes[`delete ${path}`]?.() ?? { data: { data: {} } }; }
    };
    const urls = [];
    const location = { pathname: "/feed", assign: (url) => urls.push(url) };
    const client = createSpotifyAuthClient({ api, storage, location, now: () => overrides.time ?? 1000 });
    return { api, storage, map, calls, urls, location, client };
}
function validToken(token = "short-lived-access") {
    return { data: { data: { accessToken: token, expiresAt: 1_000_000, expiresIn: 1000 } } };
}
function httpError(status, code = "error", message = "Backend error") {
    return { response: { status, data: { code, message } } };
}

describe("Spotify browser authentication — Batch 5", () => {
    it("clears legacy browser OAuth and token secrets without removing return/pending metadata", () => {
        const { map } = harness({ saved: {
            spotify_refresh_token: "secret",
            spotify_access_token: "secret2",
            spotify_code_verifier: "verifier",
            spotify_auth_state: "state",
            spotify_token_expires_at: "123",
            spotify_return_to: "/memories",
            spotify_pending_playback: '{"id":"abc"}'
        } });
        for (const key of ["spotify_refresh_token", "spotify_access_token", "spotify_code_verifier", "spotify_auth_state", "spotify_token_expires_at"]) {
            assert.equal(map.has(key), false);
        }
        assert.equal(map.get("spotify_return_to"), "/memories");
        assert.equal(map.get("spotify_pending_playback"), '{"id":"abc"}');
    });

    it("starts OAuth using the authenticated Echo backend and keeps only a safe return path", async () => {
        const h = harness({ routes: {
            "post /spotify/connect": () => ({ data: { data: { authorizationUrl: "https://accounts.spotify.com/authorize?state=abc" } } })
        } });
        await h.client.startSpotifyAuthorization("/memories/123?view=full");
        assert.deepEqual(h.calls, [{ method: "post", path: "/spotify/connect", data: undefined }]);
        assert.deepEqual(h.urls, ["https://accounts.spotify.com/authorize?state=abc"]);
        assert.equal(h.map.get("spotify_return_to"), "/memories/123?view=full");
        assert.equal(h.map.has("spotify_refresh_token"), false);
    });

    it("rejects cross-origin return paths and invalid authorization URLs", async () => {
        const h = harness({ routes: {
            "post /spotify/connect": () => ({ data: { data: { authorizationUrl: "https://attacker.example/authorize" } } })
        } });
        await assert.rejects(() => h.client.startSpotifyAuthorization("//evil.example"), /invalid Spotify authorization URL/);
        assert.equal(h.map.get("spotify_return_to"), "/feed");
        assert.deepEqual(h.urls, []);
    });

    it("posts code/state to the backend, caches only access token in memory and never saves refresh token", async () => {
        const h = harness({ routes: {
            "post /spotify/callback": (body) => {
                assert.deepEqual(body, { code: "code", state: "state" });
                return validToken("callback-access");
            }
        } });
        await h.client.completeSpotifyAuthorization("code", "state");
        assert.equal(await h.client.getSpotifyAccessToken(), "callback-access");
        assert.equal(h.calls.length, 1);
        assert.equal(h.map.has("spotify_access_token"), false);
        assert.equal(h.map.has("spotify_refresh_token"), false);
    });

    it("restores after page navigation by asking the backend for status and a new access token", async () => {
        const h = harness({ routes: {
            "get /spotify/status": () => ({ data: { data: { connected: true, spotifyUserId: "spotify-a", scope: "streaming" } } }),
            "get /spotify/access-token": () => validToken("restored-a")
        } });
        const result = await h.client.getSpotifyConnectionStatus();
        assert.equal(result.connected, true);
        assert.equal(await h.client.getSpotifyAccessToken(), "restored-a");
        assert.deepEqual(h.calls.map((c) => c.path), ["/spotify/status", "/spotify/access-token"]);
        assert.equal(h.map.has("spotify_access_token"), false);
    });

    it("reuses valid tokens without repeatedly calling the API", async () => {
        const h = harness({ routes: { "get /spotify/access-token": () => validToken("cached") } });
        assert.equal(await h.client.getSpotifyAccessToken(), "cached");
        assert.equal(await h.client.getSpotifyAccessToken(), "cached");
        assert.equal(h.calls.length, 1);
    });

    it("deduplicates overlapping requests for one browser session", async () => {
        let resolve;
        const h = harness({ routes: {
            "get /spotify/access-token": () => new Promise((r) => { resolve = r; })
        } });
        const a = h.client.getSpotifyAccessToken();
        const b = h.client.getSpotifyAccessToken();
        resolve(validToken("same-token"));
        assert.deepEqual(await Promise.all([a, b]), ["same-token", "same-token"]);
        assert.equal(h.calls.length, 1);
    });

    it("Echo logout clears browser data but never deletes the saved MySQL connection", async () => {
        const h = harness({ routes: { "get /spotify/access-token": () => validToken() } });
        await h.client.getSpotifyAccessToken();
        h.client.savePendingSpotifyPlayback({ id: "track" });
        h.client.disconnectSpotify();
        assert.equal(h.client.isSpotifyConnected(), false);
        assert.equal(h.map.has("spotify_pending_playback"), false);
        assert.equal(h.calls.some((c) => c.method === "delete"), false);
    });

    it("explicit Profile disconnect deletes the saved connection and clears the local cache", async () => {
        const h = harness({ routes: {
            "get /spotify/access-token": () => validToken(),
            "delete /spotify/connection": () => ({ data: { data: { disconnected: true } } })
        } });
        await h.client.getSpotifyAccessToken();
        await h.client.disconnectSpotifyAccount();
        assert.equal(h.client.isSpotifyConnected(), false);
        assert.ok(h.calls.some((c) => c.method === "delete" && c.path === "/spotify/connection"));
    });

    it("does not claim successful Profile disconnect when the backend fails", async () => {
        const h = harness({ routes: {
            "delete /spotify/connection": () => { throw httpError(503, "spotify_session_unavailable", "Temporarily unavailable"); }
        } });
        await assert.rejects(() => h.client.disconnectSpotifyAccount(), /Temporarily unavailable/);
    });

    it("does not return an access token from a request that completes after logout", async () => {
        let resolve;
        const h = harness({ routes: {
            "get /spotify/access-token": () => new Promise((r) => { resolve = r; })
        } });
        const inflight = h.client.getSpotifyAccessToken();
        h.client.disconnectSpotify();
        resolve(validToken("old-user-token"));
        await assert.rejects(inflight, /Spotify session has changed/);
        assert.equal(h.client.isSpotifyConnected(), false);
    });

    it("does not delete saved authorization for temporary errors", async () => {
        const h = harness({ routes: {
            "get /spotify/access-token": () => { throw httpError(503, "spotify_session_unavailable", "Try again"); }
        } });
        await assert.rejects(() => h.client.getSpotifyAccessToken(), /Try again/);
        assert.equal(h.calls.some((c) => c.method === "delete"), false);
    });

    it("exposes a reauthorization error without browser token persistence", async () => {
        const h = harness({ routes: {
            "get /spotify/access-token": () => { throw httpError(401, "spotify_reauthorization_required", "Connect your Spotify account"); }
        } });
        await assert.rejects(() => h.client.getSpotifyAccessToken(), (err) => err.code === "spotify_reauthorization_required");
        assert.equal(h.client.isSpotifyConnected(), false);
    });

    it("preserves pending playback and safely consumes the saved return path", () => {
        const h = harness();
        h.client.savePendingSpotifyPlayback({ id: "abc", title: "Song" });
        assert.deepEqual(h.client.consumePendingSpotifyPlayback(), { id: "abc", title: "Song" });
        assert.equal(h.client.consumePendingSpotifyPlayback(), null);
        h.map.set("spotify_return_to", "/feed");
        assert.equal(h.client.consumeSpotifyReturnTo(), "/feed");
        assert.equal(h.map.has("spotify_return_to"), false);
    });
    it("a disconnected backend status clears any previously cached access token", async () => {
        const h = harness({ routes: {
            "get /spotify/access-token": () => validToken(),
            "get /spotify/status": () => ({ data: { data: { connected: false, spotifyUserId: null, scope: null } } })
        } });
        await h.client.getSpotifyAccessToken();
        assert.equal(h.client.isSpotifyConnected(), true);
        assert.equal((await h.client.getSpotifyConnectionStatus()).connected, false);
        assert.equal(h.client.isSpotifyConnected(), false);
    });

    it("a new Echo user cannot receive a prior Echo user's cached access token after logout", async () => {
        let currentUser = "A";
        const h = harness({ routes: {
            "get /spotify/access-token": () => validToken(`token-${currentUser}`)
        } });
        assert.equal(await h.client.getSpotifyAccessToken(), "token-A");
        h.client.disconnectSpotify();
        currentUser = "B";
        assert.equal(await h.client.getSpotifyAccessToken(), "token-B");
        assert.equal(h.calls.filter((c) => c.path === "/spotify/access-token").length, 2);
    });

    it("rejects an OAuth callback that completes after Echo logout", async () => {
        let resolve;
        const h = harness({ routes: {
            "post /spotify/callback": () => new Promise((r) => { resolve = r; })
        } });
        const inflight = h.client.completeSpotifyAuthorization("code", "state");
        h.client.disconnectSpotify();
        resolve(validToken("old-user-callback-token"));
        await assert.rejects(inflight, /authorization was cancelled/);
        assert.equal(h.client.isSpotifyConnected(), false);
    });

    it("ignores a stale disconnected status received after Echo logout and a new user's token", async () => {
        let resolveStatus;
        let tokenName = "B";
        const h = harness({ routes: {
            "get /spotify/status": () => new Promise(resolve => { resolveStatus = resolve; }),
            "get /spotify/access-token": () => validToken(`user-${tokenName}`)
        } });
        const stale = h.client.getSpotifyConnectionStatus();
        h.client.disconnectSpotify();
        assert.equal(await h.client.getSpotifyAccessToken(), "user-B");
        resolveStatus({ data: { data: { connected: false } } });
        await assert.rejects(stale, /Spotify session has changed/);
        assert.equal(h.client.isSpotifyConnected(), true);
        assert.equal(await h.client.getSpotifyAccessToken(), "user-B");
    });

    it("does not redirect an old Echo user to Spotify when Connect resolves after logout", async () => {
        let resolveConnect;
        const h = harness({ routes: {
            "post /spotify/connect": () => new Promise(resolve => { resolveConnect = resolve; })
        } });
        const stale = h.client.startSpotifyAuthorization("/feed");
        h.client.disconnectSpotify();
        resolveConnect({ data: { data: { authorizationUrl: "https://accounts.spotify.com/authorize?state=old" } } });
        await assert.rejects(stale, /Spotify session has changed/);
        assert.deepEqual(h.urls, []);
    });

    it("an older account's disconnect completion cannot clear the new account's token", async () => {
        let resolveDelete;
        const h = harness({ routes: {
            "delete /spotify/connection": () => new Promise(resolve => { resolveDelete = resolve; }),
            "get /spotify/access-token": () => validToken("new-user-token")
        } });
        const oldDisconnect = h.client.disconnectSpotifyAccount();
        h.client.disconnectSpotify();
        assert.equal(await h.client.getSpotifyAccessToken(), "new-user-token");
        resolveDelete({ data: { data: { disconnected: true } } });
        await assert.rejects(oldDisconnect, /Spotify session has changed/);
        assert.equal(await h.client.getSpotifyAccessToken(), "new-user-token");
    });

});
