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
import useEchoCycle from "./hooks/useEchoCycle";
import useEchoNotification from "./hooks/useEchoNotification";
import EchoNotification from "./components/echo/EchoNotification";


function App() {
  useEchoCycle();

  const { notification, dismissNotification } = useEchoNotification();
  
  return (
    <BrowserRouter>
          <ScrollToTop />

          {notification && (
            <EchoNotification
              type={notification.type}
              onClose={dismissNotification}
            />
          )}

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