import React from "react";
import "./App.css";
import ShogiBoardComponent from "./components/Shogi/ShogiBoardComponent";
import SpeedDialComponent from "./components/SpeedDial/SpeedDialComponent";
import MusicSection from "./components/Music/MusicSection";
import HeaderComponent from "./components/Header/HeaderComponent";
import PortfolioSection from "./components/Portfolio/Portfolio";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Box } from "@mui/material";

const App = () => {
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
        </Routes>
        <SpeedDialComponent />
      </div>
    </Router>
  );
};

export default App;
