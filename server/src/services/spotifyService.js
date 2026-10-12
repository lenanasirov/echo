
import env from "../config/env.js";

const SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token";
const SPOTIFY_API_URL = "https://api.spotify.com/v1";


function createSpotifyError(message, status = 502) {
    const error = new Error(message);
    error.status = status;
    return error;
}

let cachedAccessToken = null;
let tokenExpiresAt = 0;

async function getAccessToken() {
    if (cachedAccessToken && Date.now() < tokenExpiresAt) {
        return cachedAccessToken;
    }

    const { clientId, clientSecret } = env.spotify;

    if (!clientId || !clientSecret) {
        throw new Error("Spotify API credentials are not configured.");
    }

    const credentials = Buffer
        .from(`${clientId}:${clientSecret}`)
        .toString("base64");

    const response = await fetch(SPOTIFY_TOKEN_URL, {
        method: "POST",
        headers: {
            Authorization: `Basic ${credentials}`,
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams({
            grant_type: "client_credentials"
        })
    });


    if (!response.ok) {
        console.error(
            "Spotify token request failed:",
            response.status
        );
    
        throw createSpotifyError(
            "Unable to authenticate with Spotify.",
            response.status === 429 ? 429 : 502
        );
    }

    const data = await response.json();

    cachedAccessToken = data.access_token;

    // Refresh the token 60 seconds before it expires.
    tokenExpiresAt = Date.now() + (data.expires_in - 60) * 1000;

    return cachedAccessToken;
}


export async function searchSpotifyTracks(query) {
    const params = new URLSearchParams({
        q: query,
        type: "track",
        limit: "10"
    });

    for (let attempt = 0; attempt < 2; attempt++) {
        const accessToken = await getAccessToken();

        const response = await fetch(
            `${SPOTIFY_API_URL}/search?${params}`,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            }
        );

        if (response.status === 401 && attempt === 0) {
            cachedAccessToken = null;
            tokenExpiresAt = 0;
            continue;
        }

        if (!response.ok) {
            console.error(
                "Spotify track search failed:",
                response.status
            );

            throw createSpotifyError(
                response.status === 429
                    ? "Spotify search rate limit reached. Please try again later."
                    : "Unable to search Spotify tracks.",
                response.status === 429 ? 429 : 502
            );
        }

        const data = await response.json();

        return (data.tracks?.items ?? []).map((track) => ({
            id: track.id,
            title: track.name,
            artist: track.artists
                .map((artist) => artist.name)
                .join(", "),
            albumArtUrl: track.album?.images?.[0]?.url ?? null,
            spotifyUrl: track.external_urls?.spotify ?? null
        }));
    }

    throw createSpotifyError(
        "Spotify authentication failed. Please try again.",
        502
    );
}