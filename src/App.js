import React, { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  HashRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { Box } from "@mui/material";
import "./App.css";
import HeaderComponent from "./components/Header/HeaderComponent";
import ShogiBoardComponent from "./components/Shogi/ShogiBoardComponent";
import SpeedDialComponent from "./components/SpeedDial/SpeedDialComponent";
import MusicSection from "./components/Music/MusicSection";
import PortfolioSection from "./components/Portfolio/Portfolio";
import MovieClub from "./components/MovieClub/MovieClub";
import MovieClubAdmin from "./components/MovieClub/MovieComponents/MovieClubAdmin";
import MovieDiscovery from "./components/MovieClub/MovieComponents/MovieDiscovery";
import HomeComponent from "./components/Home/Home";
import AboutPage from "./components/About/AboutPage";
import PrivacyPolicy from "./components/Legal/PrivacyPolicy";
import TermsOfService from "./components/Legal/TermsOfService";
import ContactPage from "./components/Contact/ContactPage";
import Footer from "./components/Footer/Footer";

const RedirectToHash = () => {
  useEffect(() => {
    const currentPath = window.location.pathname + window.location.search;
    if (!window.location.hash) {
      window.location.replace(`/#${currentPath}`);
    }
  }, []);

  return null;
};

const AppContent = () => {
  const location = useLocation();

  // Only show footer on essential pages, not on main interactive content
  const showFooter = ["/about", "/privacy", "/terms", "/contact"].includes(
    location.pathname
  );

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <HeaderComponent />
      <div className="cursor"></div>
      <Box
        sx={{ display: { xs: "none", md: "block" } }}
        className="follower"
      ></Box>
      <Box component="main" sx={{ flexGrow: 1 }}>
        <Routes>
          <Route path="/" element={<HomeComponent />} />
          <Route path="/shogi" element={<ShogiBoardComponent />} />
          <Route path="/music" element={<MusicSection />} />
          <Route path="/portfolio" element={<PortfolioSection />} />
          <Route path="/MovieClub" element={<MovieClub />} />
          <Route path="/MovieDiscovery" element={<MovieDiscovery />} />
          <Route path="/Admin" element={<MovieClubAdmin />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/contact" element={<ContactPage />} />
        </Routes>
      </Box>
      {showFooter && <Footer />}
      <SpeedDialComponent />
    </Box>
  );
};

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Router basename="/">
        <RedirectToHash />
        <AppContent />
      </Router>
    </QueryClientProvider>
  );
};

export default App;
