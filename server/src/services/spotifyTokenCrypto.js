import crypto from "node:crypto";

const PAYLOAD_VERSION = "v1";
const KEY_BYTE_LENGTH = 32;
const IV_BYTE_LENGTH = 12;
const AUTH_TAG_BYTE_LENGTH = 16;
const HEX_KEY_LENGTH = KEY_BYTE_LENGTH * 2;

const INVALID_KEY_MESSAGE =
    "SPOTIFY_TOKEN_ENCRYPTION_KEY is missing or invalid. " +
    "It must be a 64-character hex string (32 bytes). " +
    "Generate one with: node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\". " +
    "Store it in server/.env. " +
    "If this key is lost or changed, existing encrypted Spotify refresh tokens cannot be decrypted and users must reconnect Spotify.";

export function parseSpotifyTokenEncryptionKey(value) {
    if (typeof value !== "string") {
        throw new Error(INVALID_KEY_MESSAGE);
    }

    const normalized = value.trim();

    if (!/^[0-9a-fA-F]+$/.test(normalized) || normalized.length !== HEX_KEY_LENGTH) {
        throw new Error(INVALID_KEY_MESSAGE);
    }

    const key = Buffer.from(normalized, "hex");

    if (key.length !== KEY_BYTE_LENGTH) {
        throw new Error(INVALID_KEY_MESSAGE);
    }

    return key;
}

export function encryptRefreshToken(plaintext, key) {
    if (typeof plaintext !== "string" || plaintext.length === 0) {
        throw new Error("A Spotify refresh token is required to encrypt.");
    }

    assertEncryptionKey(key);

    const iv = crypto.randomBytes(IV_BYTE_LENGTH);
    const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
    const ciphertext = Buffer.concat([
        cipher.update(plaintext, "utf8"),
        cipher.final()
    ]);
    const authTag = cipher.getAuthTag();

    return [
        PAYLOAD_VERSION,
        iv.toString("hex"),
        authTag.toString("hex"),
        ciphertext.toString("hex")
    ].join(":");
}

export function decryptRefreshToken(payload, key) {
    assertEncryptionKey(key);

    if (typeof payload !== "string") {
        throw createDecryptionError();
    }

    const parts = payload.split(":");

    if (parts.length !== 4 || parts[0] !== PAYLOAD_VERSION) {
        throw createDecryptionError();
    }

    const [, ivHex, authTagHex, ciphertextHex] = parts;

    try {
        const iv = bufferFromHex(ivHex, IV_BYTE_LENGTH);
        const authTag = bufferFromHex(authTagHex, AUTH_TAG_BYTE_LENGTH);
        const ciphertext = bufferFromHex(ciphertextHex);

        const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
        decipher.setAuthTag(authTag);

        return Buffer.concat([
            decipher.update(ciphertext),
            decipher.final()
        ]).toString("utf8");
    } catch {
        throw createDecryptionError();
    }
}

function assertEncryptionKey(key) {
    if (!Buffer.isBuffer(key) || key.length !== KEY_BYTE_LENGTH) {
        throw new Error(INVALID_KEY_MESSAGE);
    }
}

function bufferFromHex(value, expectedLength) {
    if (typeof value !== "string" || value.length === 0 || value.length % 2 !== 0) {
        throw new Error("Invalid hex value.");
    }

    const buffer = Buffer.from(value, "hex");

    if (expectedLength && buffer.length !== expectedLength) {
        throw new Error("Invalid hex value.");
    }

    return buffer;
}

function createDecryptionError() {
    return new Error("Stored Spotify refresh token could not be decrypted.");
}
