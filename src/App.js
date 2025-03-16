import React, { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import { Box } from "@mui/material";
import "./App.css";
import HeaderComponent from "./components/Header/HeaderComponent";
import ShogiBoardComponent from "./components/Shogi/ShogiBoardComponent";
import SpeedDialComponent from "./components/SpeedDial/SpeedDialComponent";
import MusicSection from "./components/Music/MusicSection";
import PortfolioSection from "./components/Portfolio/Portfolio";
import MovieClub from "./components/MovieClub/MovieClub";

const RedirectToHash = () => {
  useEffect(() => {
    const currentPath = window.location.pathname + window.location.search;
    if (!window.location.hash) {
      window.location.replace(`/#${currentPath}`);
    }
  }, []);

  return null;
};

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Router basename="/">
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
            <Route path="/MovieClub" element={<MovieClub />} />
          </Routes>
          <SpeedDialComponent />
        </div>
      </Router>
    </QueryClientProvider>
  );
};

export default App;
