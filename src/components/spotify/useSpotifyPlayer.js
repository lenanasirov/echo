import { useContext } from "react";
import SpotifyPlayerContext from "./SpotifyPlayerContext";

export default function useSpotifyPlayer() {
    const context = useContext(SpotifyPlayerContext);

    if (!context) {
        throw new Error(
            "useSpotifyPlayer must be used within SpotifyPlayerProvider."
        );
    }

    return context;
}
