import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
    AUTH_SESSION_CHANGE_KEY,
    didEchoUserChange,
    notifyAuthSessionChange,
    subscribeToAuthSessionChanges
} from "./authSessionSync.js";

describe("Echo cross-tab session synchronization", () => {
    it("publishes a non-secret change marker", () => {
        let savedKey, savedValue;
        const storage = { setItem(key, value) { savedKey=key; savedValue=value; } };
        assert.equal(notifyAuthSessionChange(storage, () => "change-001"), true);
        assert.equal(savedKey, AUTH_SESSION_CHANGE_KEY);
        assert.equal(savedValue, "change-001");
    });

    it("does not throw when storage is unavailable", () => {
        const storage = { setItem() { throw new Error("storage unavailable"); } };
        assert.equal(notifyAuthSessionChange(storage), false);
    });

    it("notifies for matching cross-tab events but ignores unrelated keys", () => {
        const events = new Map();
        const browserWindow = {
            addEventListener(type, callback) { events.set(type, callback); },
            removeEventListener(type, callback) {
                if (events.get(type) === callback) events.delete(type);
            }
        };
        let called=0;
        const unsubscribe = subscribeToAuthSessionChanges(browserWindow, () => called++);
        events.get("storage")({ key: "unrelated", newValue: "anything" });
        events.get("storage")({ key: AUTH_SESSION_CHANGE_KEY, newValue: null });
        assert.equal(called, 0);
        events.get("storage")({ key: AUTH_SESSION_CHANGE_KEY, newValue: "change-002" });
        assert.equal(called, 1);
        unsubscribe();
        assert.equal(events.has("storage"), false);
    });

    it("detects account switches and logout", () => {
        assert.equal(didEchoUserChange(100, "100"), false);
        assert.equal(didEchoUserChange(100, 200), true);
        assert.equal(didEchoUserChange(100, null), true);
        assert.equal(didEchoUserChange(null, null), false);
    });
});
