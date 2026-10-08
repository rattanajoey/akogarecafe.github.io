import React, { lazy, Suspense, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter as Router, Routes, Route, useLocation, Link as RouterLink } from "react-router-dom";
import { Box, Button, CircularProgress, Typography } from "@mui/material";
import "./App.css";
import HeaderComponent from "./components/Header/HeaderComponent";
import SpeedDialComponent from "./components/SpeedDial/SpeedDialComponent";
import PointerFollower from "./components/PointerFollower";
import Footer from "./components/Footer/Footer";

const HomeComponent = lazy(() => import("./components/Home/Home"));
const ShogiBoardComponent = lazy(() => import("./components/Shogi/ShogiBoardComponent"));
const MusicSection = lazy(() => import("./components/Music/MusicSection"));
const PortfolioSection = lazy(() => import("./components/Portfolio/Portfolio"));
const MovieClub = lazy(() => import("./components/MovieClub/MovieClub"));
const MovieClubAdmin = lazy(() => import("./components/MovieClub/MovieComponents/MovieClubAdmin"));
const AboutPage = lazy(() => import("./components/About/AboutPage"));
const PrivacyPolicy = lazy(() => import("./components/Legal/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./components/Legal/TermsOfService"));
const ContactPage = lazy(() => import("./components/Contact/ContactPage"));

const PageMessage = ({ title, children, reload = false }) => (
  <Box sx={{ color: "white", textAlign: "center", px: 2, py: 8 }}>
    <Typography component="h1" variant="h4" gutterBottom>{title}</Typography>
    <Typography sx={{ mb: 3 }}>{children}</Typography>
    {reload && <Button onClick={() => window.location.reload()} variant="contained" sx={{ mr: 2 }}>Reload page</Button>}
    <Button component={RouterLink} to="/" variant="outlined" color="inherit">Back to Home</Button>
  </Box>
);

class PageBoundary extends React.Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    return this.state.failed ? (
      <PageMessage title="This page couldn't load" reload>
        Please refresh the page to try again, or return to Home.
      </PageMessage>
    ) : this.props.children;
  }
}

const AppContent = () => {
  const location = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
    const titles = { "/": "Home", "/portfolio": "Joey Rattana · Portfolio", "/music": "Music Collection", "/shogi": "Shogi", "/about": "About", "/contact": "Contact", "/privacy": "Privacy Policy", "/terms": "Terms of Service", "/MovieClub": "Movie Club", "/Admin": "Admin" };
    document.title = `${titles[location.pathname] || "Page not found"} | Akogare Cafe`;
  }, [location.pathname]);
  const showFooter = ["/about", "/privacy", "/terms", "/contact"].includes(location.pathname);
  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <a className="skip-link" href="#main-content" onClick={(event) => {
        event.preventDefault();
        document.getElementById("main-content")?.focus();
      }}>Skip to content</a>
      <HeaderComponent />
      <PointerFollower />
      <Box component="main" id="main-content" tabIndex={-1} sx={{ flexGrow: 1, minWidth: 0 }}>
        <PageBoundary key={location.pathname}>
          <Suspense fallback={<Box role="status" sx={{ color: "white", textAlign: "center", py: 8 }}><CircularProgress color="inherit" size={24} /><Typography>Loading page…</Typography></Box>}>
            <Routes>
              <Route path="/" element={<HomeComponent />} />
              <Route path="/shogi" element={<ShogiBoardComponent />} />
              <Route path="/music" element={<MusicSection />} />
              <Route path="/portfolio" element={<PortfolioSection />} />
              <Route path="/MovieClub" element={<MovieClub />} />
              <Route path="/Admin" element={<MovieClubAdmin />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<TermsOfService />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="*" element={<PageMessage title="Page not found">That address doesn't match a page at Akogare Cafe.</PageMessage>} />
            </Routes>
          </Suspense>
        </PageBoundary>
      </Box>
      {showFooter && <Footer />}
      <SpeedDialComponent />
    </Box>
  );
};

const queryClient = new QueryClient();
const App = () => <QueryClientProvider client={queryClient}><Router><AppContent /></Router></QueryClientProvider>;
export default App;
