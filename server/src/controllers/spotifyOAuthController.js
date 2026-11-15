import { SpotifyOAuthError } from "../services/spotifyOAuthService.js";

/** Controllers use only the JWT-authenticated req.user.id, never req.body.userId. */
export function createSpotifyOAuthController(oauthService) {
    if (!oauthService?.startConnection || !oauthService?.completeConnection) {
        throw new Error("Spotify OAuth service is required.");
    }

    function respondWithError(error, res, next) {
        if (error instanceof SpotifyOAuthError) {
            return res.status(error.status).json({
                success: false,
                message: error.message,
                code: error.code
            });
        }
        // The application-level error middleware handles unexpected errors.
        return next(error);
    }

    return {
        async connect(req, res, next) {
            try {
                const data = await oauthService.startConnection(req.user?.id);
                // OAuth state is embedded in this URL; do not allow response caching.
                res.set?.("Cache-Control", "no-store");
                return res.status(200).json({ success: true, data });
            } catch (error) {
                return respondWithError(error, res, next);
            }
        },
        async callback(req, res, next) {
            try {
                const data = await oauthService.completeConnection(req.user?.id, {
                    code: req.body?.code,
                    state: req.body?.state
                });
                // Do not cache access tokens in proxies or browser HTTP caches.
                res.set?.("Cache-Control", "no-store");
                return res.status(200).json({ success: true, data });
            } catch (error) {
                return respondWithError(error, res, next);
            }
        }
    };
}
