import { Outlet } from "react-router-dom";
import AppNavbar from "../components/layout/AppNavbar";
import { SpotifyPlayerProvider } from "../components/spotify/SpotifyPlayerProvider";
import SpotifyPlayerStatus from "../components/spotify/SpotifyPlayerStatus";

function AppLayout() {
    return (
        <SpotifyPlayerProvider>
            <div className="
                min-h-screen
                bg-[#0B0B10]
                text-white
            ">

                <AppNavbar />

                <main>
                    <Outlet />
                </main>

            </div>

            <SpotifyPlayerStatus />
        </SpotifyPlayerProvider>
    );
}

export default AppLayout;