import { Outlet } from "react-router-dom";
import AppNavbar from "../components/layout/AppNavbar";
import { SpotifyPlayerProvider } from "../components/spotify/SpotifyPlayerProvider";
import SpotifyPlayerStatus from "../components/spotify/SpotifyPlayerStatus";
import PendingSpotifyPlayback from "../components/spotify/PendingSpotifyPlayback";

function AppLayout() {
    return (
        <SpotifyPlayerProvider>
            <div
                className="
                    min-h-screen
                    bg-[#0B0B10]
                    text-white
                "
            >
                <AppNavbar />

                <main>
                    <Outlet />
                </main>
            </div>

            <SpotifyPlayerStatus />
            <PendingSpotifyPlayback />
        </SpotifyPlayerProvider>
    );
}

export default AppLayout;