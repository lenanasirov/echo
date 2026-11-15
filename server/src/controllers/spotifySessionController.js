import { SpotifySessionError } from "../services/spotifySessionService.js";

/**
 * These endpoints are mounted behind the existing JWT authenticate middleware.
 * Never trust userId in the URL, query string, or body.
 */
export function createSpotifySessionController(sessionService) {
    for (const method of ["getStatus", "getAccessToken", "disconnect"]) {
        if (typeof sessionService?.[method] !== "function") {
            throw new Error(`Spotify session controller requires ${method}.`);
        }
    }

    function errorResponse(error, res, next) {
        res.set?.("Cache-Control", "no-store");
        if (error instanceof SpotifySessionError) {
            if (error.retryAfterSeconds != null) {
                res.set?.("Retry-After", String(error.retryAfterSeconds));
            }
            return res.status(error.status).json({
                success: false,
                code: error.code,
                message: error.message
            });
        }
        return next(error);
    }

    function handle(method) {
        return async (req, res, next) => {
            try {
                const data = await sessionService[method](req.user?.id);
                res.set?.("Cache-Control", "no-store");
                return res.status(200).json({ success: true, data });
            } catch (error) {
                return errorResponse(error, res, next);
            }
        };
    }

    return {
        status: handle("getStatus"),
        accessToken: handle("getAccessToken"),
        disconnect: handle("disconnect")
    };
}
