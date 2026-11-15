import { Router } from "express";
import { searchTracks } from "../controllers/spotifyController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { createSpotifyOAuthService } from "../services/spotifyOAuthService.js";
import { createSpotifyOAuthController } from "../controllers/spotifyOAuthController.js";
import { createSpotifySessionService } from "../services/spotifySessionService.js";
import { createSpotifySessionController } from "../controllers/spotifySessionController.js";

const router = Router();

// Existing Client Credentials search stays public and unchanged.
router.get("/search", searchTracks);

let oauthRoutesRegistered = false;

/**
 * Call ONCE during backend startup (before app.listen), after constructing
 * the Batch 2 repository with the existing MySQL pool and encryption key.
 * Keeps this module independent of the currently unknown pool import path.
 */
export function registerSpotifyOAuthRoutes({ connectionService, clientId, redirectUri, scopes, fetchImpl }) {
    if (oauthRoutesRegistered) {
        throw new Error("Spotify OAuth routes are already registered.");
    }

    const service = createSpotifyOAuthService({
        connectionService,
        clientId,
        redirectUri,
        scopes,
        ...(fetchImpl ? { fetchImpl } : {})
    });
    const controller = createSpotifyOAuthController(service);

    router.post("/connect", authenticate, controller.connect);
    router.post("/callback", authenticate, controller.callback);

    // Batch 4: owner-only Spotify session endpoints. Keep /search public.
    const sessionService = createSpotifySessionService({
        connectionService,
        clientId,
        ...(fetchImpl ? { fetchImpl } : {})
    });
    const sessionController = createSpotifySessionController(sessionService);
    router.get("/status", authenticate, sessionController.status);
    router.get("/access-token", authenticate, sessionController.accessToken);
    router.delete("/connection", authenticate, sessionController.disconnect);

    oauthRoutesRegistered = true;
}

export default router;
