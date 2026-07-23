import { Outlet } from "react-router-dom";
import AppNavbar from "../components/layout/AppNavbar";

function AppLayout() {
    return (
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
    );
}

export default AppLayout;