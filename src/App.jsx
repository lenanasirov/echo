import { BrowserRouter, Routes, Route } from "react-router-dom";

import LandingLayout from "./layouts/LandingLayout";
import AppLayout from "./layouts/AppLayout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Feed from "./pages/Feed";
import CreateMemory from "./pages/CreateMemory";
import MemoryDetails from "./pages/MemoryDetails";
import AuthLayout from "./layouts/AuthLayout";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import ScrollToTop from "./components/common/ScrollToTop";
import EditMemory from "./pages/EditMemory";
import EditProfile from "./pages/EditProfile";


function App() {
  
  return (
    <BrowserRouter>
      <ScrollToTop />

      <Routes>
        {/* Landing */}
        <Route element={<LandingLayout />}>
          <Route path="/" element={<Home />} />
        </Route>

        {/* Protected App */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/feed" element={<Feed />} />
            <Route path="/create" element={<CreateMemory />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/profile/edit" element={<EditProfile />} />
            <Route path="/memory/:id" element={<MemoryDetails />} />
            <Route path="/memory/:id/edit" element={<EditMemory />} />
          </Route>
        </Route>


        {/* Authentication */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;