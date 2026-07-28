import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";

import LandingLayout from "./layouts/LandingLayout";
import AppLayout from "./layouts/AppLayout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Feed from "./pages/Feed";
import CreateMemory from "./pages/CreateMemory";
import mockMemories from "./data/mockMemories";


function App() {
  const [memories, setMemories] = useState(mockMemories);
  
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing */}
        <Route element={<LandingLayout />}>
          <Route path="/" element={<Home />} />
        </Route>

        {/* Application */}
        <Route element={<AppLayout />}>
          <Route path="/feed" element={<Feed memories={memories}/>} />
          <Route path="/create" element={<CreateMemory memories={memories} setMemories={setMemories} />} />
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