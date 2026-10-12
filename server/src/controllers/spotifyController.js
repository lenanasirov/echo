import { searchSpotifyTracks } from "../services/spotifyService.js";

export async function searchTracks(req, res, next) {
    try {
        const query = req.query.q?.trim();

        if (!query) {
            return res.status(400).json({
                success: false,
                message: "A search query is required."
            });
        }

        if (query.length > 100) {
            return res.status(400).json({
                success: false,
                message: "Search query must be 100 characters or fewer."
            });
        }

        const tracks = await searchSpotifyTracks(query);

        res.status(200).json({
            success: true,
            data: tracks
        });
    } catch (error) {
        next(error);
    }
}