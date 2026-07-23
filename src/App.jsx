import { BrowserRouter, Routes, Route } from "react-router-dom";

import LandingLayout from "./layouts/LandingLayout";
import AppLayout from "./layouts/AppLayout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Feed from "./pages/Feed";
import CreateMemory from "./pages/CreateMemory";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing */}
        <Route element={<LandingLayout />}>
          <Route path="/" element={<Home />} />
        </Route>

        {/* Application */}
        <Route element={<AppLayout />}>
          <Route path="/feed" element={<Feed />} />
          <Route path="/create" element={<CreateMemory />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
        
        {/* Authentication */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;