import assert from "node:assert/strict";
import { describe, it } from "node:test";
import crypto from "node:crypto";

import {
    decryptRefreshToken,
    encryptRefreshToken,
    parseSpotifyTokenEncryptionKey
} from "./spotifyTokenCrypto.js";

const createKey = () => crypto.randomBytes(32);

describe("parseSpotifyTokenEncryptionKey", () => {
    it("accepts a 32-byte hex key", () => {
        const hex = createKey().toString("hex");
        const key = parseSpotifyTokenEncryptionKey(` ${hex} `);

        assert.equal(key.length, 32);
        assert.equal(key.toString("hex"), hex);
    });

    it("rejects missing, short, and non-hex keys", () => {
        assert.throws(() => parseSpotifyTokenEncryptionKey(), /SPOTIFY_TOKEN_ENCRYPTION_KEY/);
        assert.throws(() => parseSpotifyTokenEncryptionKey(""), /SPOTIFY_TOKEN_ENCRYPTION_KEY/);
        assert.throws(
            () => parseSpotifyTokenEncryptionKey(crypto.randomBytes(16).toString("hex")),
            /SPOTIFY_TOKEN_ENCRYPTION_KEY/
        );
        assert.throws(
            () => parseSpotifyTokenEncryptionKey("z".repeat(64)),
            /SPOTIFY_TOKEN_ENCRYPTION_KEY/
        );
    });
});

describe("encryptRefreshToken and decryptRefreshToken", () => {
    it("round-trips a refresh token", () => {
        const key = createKey();
        const token = "spotify-refresh-token-value";
        const payload = encryptRefreshToken(token, key);

        assert.match(payload, /^v1:[0-9a-f]+:[0-9a-f]+:[0-9a-f]+$/);
        assert.equal(decryptRefreshToken(payload, key), token);
        assert.equal(payload.includes(token), false);
    });

    it("produces a different ciphertext each time", () => {
        const key = createKey();
        const token = "spotify-refresh-token-value";

        assert.notEqual(
            encryptRefreshToken(token, key),
            encryptRefreshToken(token, key)
        );
    });

    it("fails closed on tampered or foreign-key payloads", () => {
        const key = createKey();
        const otherKey = createKey();
        const payload = encryptRefreshToken("spotify-refresh-token-value", key);
        const parts = payload.split(":");
        parts[3] = parts[3].replace(/[0-9a-f]/, (digit) => (
            digit === "0" ? "1" : "0"
        ));

        assert.throws(
            () => decryptRefreshToken(payload, otherKey),
            /could not be decrypted/
        );
        assert.throws(
            () => decryptRefreshToken(parts.join(":"), key),
            /could not be decrypted/
        );
        assert.throws(
            () => decryptRefreshToken("not-a-valid-payload", key),
            /could not be decrypted/
        );
        assert.throws(
            () => decryptRefreshToken("not-a-valid-payload", key),
            (error) => !String(error.message).includes("not-a-valid-payload")
        );
    });
});
