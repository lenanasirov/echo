import { Outlet } from "react-router-dom";
import Navbar from "../components/layout/Navbar";

function MainLayout() {
  return (
    <div className="min-h-screen bg-[#0B0B10] text-white">
      <Navbar />

      <main>
        <Outlet />
      </main>
    </div>
  );
}

export default MainLayout;