import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createHash } from "node:crypto";
import { createSpotifyOAuthService, SpotifyOAuthError } from "./spotifyOAuthService.js";
import { createSpotifyOAuthController } from "../controllers/spotifyOAuthController.js";

const clientId = "spotify-app-client-id";
const redirectUri = "http://127.0.0.1:5173/spotify/callback";
const scopes = "streaming user-read-playback-state user-modify-playback-state";
const TOKENS = { access_token: "spotify-access", refresh_token: "spotify-refresh", expires_in: 3600, scope: scopes };
const ok = (data) => ({ ok: true, status: 200, json: async () => data });

function setup({ fetchImpl } = {}) {
    const states = new Map();
    const connections = new Map();
    const calls = [];
    const repository = {
        async saveUserSpotifyOAuthState(userId, data) {
            states.set(String(userId), { ...data, used: false });
        },
        async consumeUserSpotifyOAuthState(userId, state) {
            const stored = states.get(String(userId));
            if (!stored || stored.state !== state || stored.used || stored.expiresAt < new Date()) {
                const err = new Error("Invalid OAuth state");
                err.name = "SpotifyOAuthStateError";
                err.code = "wrong_user";
                throw err;
            }
            stored.used = true;
            return { userId, state, codeVerifier: stored.codeVerifier };
        },
        async upsertUserSpotifyConnection(userId, data) {
            connections.set(String(userId), data);
            return { userId };
        }
    };
    const fetcher = fetchImpl ?? (async (url, init) => {
        calls.push({ url, init });
        return url.includes("/api/token") ? ok(TOKENS) : ok({ account_id: "immutable-account-id", id: "legacy-id" });
    });
    const service = createSpotifyOAuthService({ connectionService: repository, clientId, redirectUri, scopes, fetchImpl: fetcher });
    return { service, states, connections, calls, repository };
}

async function begin(service, userId = 1) {
    const { authorizationUrl } = await service.startConnection(userId);
    return new URL(authorizationUrl);
}

describe("Spotify backend OAuth Batch 3", () => {
    it("generates Spotify PKCE S256 URL, state, and verifier saved per Echo user", async () => {
        const { service, states } = setup();
        const url = await begin(service, 23);
        const saved = states.get("23");
        assert.equal(url.origin, "https://accounts.spotify.com");
        assert.equal(url.searchParams.get("client_id"), clientId);
        assert.equal(url.searchParams.get("redirect_uri"), redirectUri);
        assert.equal(url.searchParams.get("scope"), scopes);
        assert.equal(url.searchParams.get("code_challenge_method"), "S256");
        assert.equal(url.searchParams.get("state"), saved.state);
        assert.equal(url.searchParams.get("code_challenge"), createHash("sha256").update(saved.codeVerifier).digest("base64url"));
        assert.ok(saved.codeVerifier.length >= 43 && saved.codeVerifier.length <= 128);
        assert.ok(saved.expiresAt.getTime() > Date.now());
    });

    it("exchanges a valid code, stores only refresh token through repository, and never returns refresh token", async () => {
        const { service, states, connections, calls } = setup();
        const url = await begin(service, 47);
        const result = await service.completeConnection(47, { code: "auth-code", state: url.searchParams.get("state") });
        const tokenRequest = calls[0];
        assert.equal(tokenRequest.url, "https://accounts.spotify.com/api/token");
        assert.equal(tokenRequest.init.body.get("code"), "auth-code");
        assert.equal(tokenRequest.init.body.get("client_id"), clientId);
        assert.equal(tokenRequest.init.body.get("code_verifier"), states.get("47").codeVerifier);
        assert.equal(tokenRequest.init.body.get("redirect_uri"), redirectUri);
        assert.equal(connections.get("47").refreshToken, "spotify-refresh");
        assert.equal(result.spotifyUserId, "immutable-account-id");
        assert.equal(result.accessToken, "spotify-access");
        assert.ok(result.expiresAt > Date.now());
        assert.equal("refreshToken" in result, false);
        assert.equal("refresh_token" in result, false);
        assert.ok(!JSON.stringify(result).includes("spotify-refresh"));
    });

    it("isolates connections by Echo user and rejects a wrong-user callback", async () => {
        const { service, connections } = setup();
        const url = await begin(service, 101);
        await assert.rejects(
            () => service.completeConnection(202, { code: "a-code", state: url.searchParams.get("state") }),
            (e) => e instanceof SpotifyOAuthError && e.code === "invalid_spotify_state"
        );
        assert.equal(connections.size, 0);
        await service.completeConnection(101, { code: "a-code", state: url.searchParams.get("state") });
        assert.equal(connections.size, 1);
        assert.equal(connections.has("202"), false);
    });

    it("rejects missing code, malformed state, and unauthenticated attempts", async () => {
        const { service } = setup();
        await assert.rejects(() => service.startConnection(undefined), { status: 401 });
        await assert.rejects(() => service.completeConnection(1, { code: "", state: "a" }), { status: 400 });
        await assert.rejects(() => service.completeConnection(1, { code: "a", state: "a" }), { status: 400 });
    });

    it("rejects replayed OAuth states", async () => {
        const { service } = setup();
        const state = (await begin(service)).searchParams.get("state");
        await service.completeConnection(1, { code: "code", state });
        await assert.rejects(() => service.completeConnection(1, { code: "code", state }), { code: "invalid_spotify_state" });
    });

    it("rejects an expired OAuth state", async () => {
        const { service, states } = setup();
        const state = (await begin(service)).searchParams.get("state");
        states.get("1").expiresAt = new Date(Date.now() - 5000);
        await assert.rejects(() => service.completeConnection(1, { code: "code", state }), { code: "invalid_spotify_state" });
    });

    it("does not save credentials if Spotify rejects the code", async () => {
        const { service, connections } = setup({fetchImpl: async () => ({ok:false,status:400})});
        const state = (await begin(service)).searchParams.get("state");
        await assert.rejects(() => service.completeConnection(1, { code: "bad-code", state }), { code: "spotify_exchange_failed" });
        assert.equal(connections.size, 0);
    });

    it("handles Spotify network errors without saving tokens", async () => {
        const { service, connections } = setup({fetchImpl: async () => { throw new Error("secret request details"); }});
        const state = (await begin(service)).searchParams.get("state");
        await assert.rejects(
            () => service.completeConnection(1, { code: "code", state }),
            e => e instanceof SpotifyOAuthError && !e.message.includes("secret request details")
        );
        assert.equal(connections.size, 0);
    });

    it("still saves a connection if the optional Spotify profile lookup fails", async () => {
        const { service, connections } = setup({fetchImpl: async url => url.includes("/api/token") ? ok(TOKENS) : {ok:false,status:429}});
        const state = (await begin(service)).searchParams.get("state");
        const data = await service.completeConnection(1, { code: "code", state });
        assert.equal(data.spotifyUserId, null);
        assert.equal(connections.size, 1);
    });

    it("rejects duplicate-state database errors with safe output", async () => {
        const { service, repository } = setup();
        repository.saveUserSpotifyOAuthState = async () => { throw Object.assign(new Error("SQL sensitive data"), { code: "ER_DUP_ENTRY" }); };
        await assert.rejects(() => service.startConnection(1), e => e.status === 409 && !e.message.includes("SQL sensitive data"));
    });

    it("rejects database write failures with safe output", async () => {
        const { service, repository } = setup();
        repository.upsertUserSpotifyConnection = async () => { throw new Error("DB secrets here"); };
        const state = (await begin(service)).searchParams.get("state");
        await assert.rejects(() => service.completeConnection(1, { code: "code", state }), e => e.status === 503 && !e.message.includes("DB secrets"));
    });

    it("controller uses req.user.id and never trusts body.userId", async () => {
        const calls = [];
        const oauth = {
            async startConnection(id) { calls.push(id); return { authorizationUrl: "https://accounts.spotify.com/authorize" }; },
            async completeConnection(id, body) { calls.push([id,body]); return { accessToken: "access", expiresAt: 4 }; }
        };
        const controller = createSpotifyOAuthController(oauth);
        const response = () => ({ status(code) { this.code = code; return this; }, json(value) { this.body = value; return this; } });
        const res1 = response();
        const res2 = response();
        await controller.connect({user:{id:11},body:{userId:999}},res1,()=>assert.fail("next called"));
        await controller.callback({user:{id:11},body:{userId:999, code:"x",state:"y"}},res2,()=>assert.fail("next called"));
        assert.deepEqual(calls, [11, [11,{code:"x", state:"y"}]]);
        assert.equal(res1.code,200);
        assert.equal(res2.code,200);
    });
});
