import { Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import AppNavbar from "../components/layout/AppNavbar";
import { SpotifyPlayerProvider } from "../components/spotify/SpotifyPlayerProvider";
import SpotifyPlayerStatus from "../components/spotify/SpotifyPlayerStatus";
import PendingSpotifyPlayback from "../components/spotify/PendingSpotifyPlayback";

function AppLayout() {
    const { user } = useAuth();

    return (
        // Force the Spotify SDK provider to remount if the authenticated
        // Echo user changes without a complete page navigation.
        <SpotifyPlayerProvider key={user?.id ?? "no-user"}>
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