import React, { useEffect } from "react";
import "./App.css";
import ShogiBoardComponent from "./components/Shogi/ShogiBoardComponent";
import SpeedDialComponent from "./components/SpeedDial/SpeedDialComponent";
import MusicSection from "./components/Music/MusicSection";
import HeaderComponent from "./components/Header/HeaderComponent";
import PortfolioSection from "./components/Portfolio/Portfolio";
import { HashRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Box } from "@mui/material";

const App = () => {
  // Effect to handle cursor movement
  useEffect(() => {
    const cursor = document.querySelector(".cursor");
    const follower = document.querySelector(".follower");

    document.addEventListener("mousemove", (e) => {
      if (cursor) cursor.style.cssText = `left: ${e.clientX}px; top: ${e.clientY}px;`;
      if (follower) follower.style.cssText = `left: ${e.clientX}px; top: ${e.clientY}px;`;
    });
  }, []);

  return (
    <Router>
      <div className="App">
        <HeaderComponent />
        <div className="cursor"></div>
        <Box
          sx={{ display: { xs: "none", md: "block" } }}
          className="follower"
        ></Box>
        <Routes>
          <Route path="/" element={<ShogiBoardComponent />} />
          <Route path="/music" element={<MusicSection />} />
          <Route path="/portfolio" element={<PortfolioSection />} />
          {/* Catch-all route to redirect any unmatched routes to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <SpeedDialComponent />
      </div>
    </Router>
  );
};

export default App;
