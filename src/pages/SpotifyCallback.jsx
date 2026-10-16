import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
    completeSpotifyAuthorization,
    startSpotifyAuthorization,
} from "../services/spotifyAuthService";

function SpotifyCallback() {
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState("connecting");
    const [error, setError] = useState("");
    const startedRef = useRef(false);

    useEffect(() => {
        if (startedRef.current) {
            return;
        }

        startedRef.current = true;

        const code = searchParams.get("code");
        const state = searchParams.get("state");
        const spotifyError = searchParams.get("error");

        const finishAuthorization = async () => {
            if (spotifyError) {
                setError(
                    spotifyError === "access_denied"
                        ? "Spotify authorization was cancelled."
                        : "Spotify authorization failed. Please try again."
                );
                setStatus("error");
                return;
            }

            if (!code || !state) {
                setError(
                    "The Spotify callback is missing authorization details."
                );
                setStatus("error");
                return;
            }

            try {
                await completeSpotifyAuthorization(code, state);
                setStatus("success");
            } catch (err) {
                setError(
                    err.message ||
                    "Couldn't connect to Spotify. Please try again."
                );
                setStatus("error");
            }
        };

        finishAuthorization();
    }, [searchParams]);

    const handleReconnect = async () => {
        try {
            await startSpotifyAuthorization();
        } catch (err) {
            setError(err.message || "Couldn't start Spotify authorization.");
            setStatus("error");
        }
    };

    return (
        <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-4 text-white">
            <section className="w-full max-w-md rounded-2xl border border-white/10 bg-zinc-900 p-8 text-center">
                <h1 className="text-2xl font-semibold">
                    {status === "connecting" && "Connecting Spotify..."}
                    {status === "success" && "Spotify connected"}
                    {status === "error" && "Couldn't connect Spotify"}
                </h1>

                <p className="mt-3 text-sm text-zinc-400">
                    {status === "connecting" &&
                        "Finishing your Spotify authorization."}
                    {status === "success" &&
                        "Your account is authorized. You can return to Echo."}
                    {status === "error" && error}
                </p>

                {status === "success" && (
                    <Link
                        to="/feed"
                        className="mt-6 inline-flex rounded-xl bg-linear-to-r from-purple-500 to-pink-500 px-5 py-3 font-medium text-white transition hover:opacity-90"
                    >
                        Return to Echo
                    </Link>
                )}

                {status === "error" && (
                    <button
                        type="button"
                        onClick={handleReconnect}
                        className="mt-6 rounded-xl bg-linear-to-r from-purple-500 to-pink-500 px-5 py-3 font-medium text-white transition hover:opacity-90"
                    >
                        Try again
                    </button>
                )}
            </section>
        </main>
    );
}

export default SpotifyCallback;