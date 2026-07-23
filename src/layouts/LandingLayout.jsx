import { Outlet } from "react-router-dom";
import LandingNavbar from "../components/layout/LandingNavbar";

function LandingLayout() {
  return (
    <div className="min-h-screen bg-[#0B0B10] text-white">
      <LandingNavbar />

      <main>
        <Outlet />
      </main>
    </div>
  );
}

export default LandingLayout;