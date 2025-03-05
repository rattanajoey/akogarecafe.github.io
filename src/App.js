import React, { useEffect } from "react";
import "./App.css";
import ShogiBoardComponent from "./components/Shogi/ShogiBoardComponent";
import SpeedDialComponent from "./components/SpeedDial/SpeedDialComponent";
import MusicSection from "./components/Music/MusicSection";
import HeaderComponent from "./components/Header/HeaderComponent";
import PortfolioSection from "./components/Portfolio/Portfolio";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import { Box } from "@mui/material";

const RedirectToHash = () => {
  useEffect(() => {
    const currentPath = window.location.pathname + window.location.search; // Preserve any query params
    if (!window.location.hash) {
      window.location.replace(`/#${currentPath}`);
    }
  }, []);

  return null;
};

const App = () => {
  return (
    <Router>
      <RedirectToHash />
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
        </Routes>
        <SpeedDialComponent />
      </div>
    </Router>
  );
};

export default App;
