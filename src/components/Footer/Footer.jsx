import React from "react";
import {
  Box,
  Typography,
  Container,
  Grid2,
  Link,
  Divider,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";

const FooterWrapper = styled(Box)({
  backgroundColor: "rgba(0, 0, 0, 0.95)",
  color: "white",
  paddingTop: "3rem",
  paddingBottom: "1rem",
  marginTop: "auto",
});

const FooterLink = styled(Link)({
  color: "rgba(255, 255, 255, 0.8)",
  textDecoration: "none",
  fontSize: "0.9rem",
  cursor: "pointer",
  "&:hover": {
    color: "#4ecdc4",
    textDecoration: "underline",
  },
});

const Footer = () => {
  const navigate = useNavigate();

  const footerSections = [
    {
      title: "Explore",
      links: [
        { label: "Home", path: "/" },
        { label: "About", path: "/about" },
        { label: "Portfolio", path: "/portfolio" },
        { label: "Contact", path: "/contact" },
      ],
    },
    {
      title: "Interactive",
      links: [
        { label: "Shogi Game", path: "/shogi" },
        { label: "Music Collection", path: "/music" },
        { label: "Movie Club", path: "/MovieClub" },
      ],
    },
    {
      title: "Legal",
      links: [
        { label: "Privacy Policy", path: "/privacy" },
        { label: "Terms of Service", path: "/terms" },
      ],
    },
    {
      title: "Connect",
      links: [
        { label: "YouTube", url: "https://www.youtube.com/c/akogarecafe" },
        { label: "Instagram", url: "https://www.instagram.com/akogarecafe" },
        { label: "Twitter/X", url: "https://x.com/AkogareCafe_JR" },
        { label: "Twitch", url: "https://www.twitch.tv/akogarecafe" },
        { label: "GitHub", url: "https://github.com/rattanajoey" },
      ],
    },
  ];

  const handleNavigation = (path, url) => {
    if (url) {
      window.open(url, "_blank", "noopener noreferrer");
    } else {
      navigate(path);
    }
  };

  return (
    <FooterWrapper>
      <Container maxWidth="lg">
        <Grid2 container spacing={4}>
          <Grid2 item xs={12} md={4}>
            <Typography
              variant="h5"
              gutterBottom
              sx={{
                background: "linear-gradient(45deg, #ff6b6b, #4ecdc4)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                color: "transparent",
                fontWeight: "bold",
              }}
            >
              Akogare Cafe
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: "rgba(255,255,255,0.7)", mb: 2 }}
            >
              A digital sanctuary blending Japanese culture, interactive gaming,
              curated music, and technology. Explore our world of creativity,
              community, and code.
            </Typography>
            <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.6)" }}>
              憧れカフェ - Where yearning meets creation
            </Typography>
          </Grid2>

          {footerSections.map((section, index) => (
            <Grid2 item xs={6} sm={3} md={2} key={index}>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ color: "white", fontWeight: "bold", fontSize: "1rem" }}
              >
                {section.title}
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {section.links.map((link, linkIndex) => (
                  <FooterLink
                    key={linkIndex}
                    onClick={() => handleNavigation(link.path, link.url)}
                  >
                    {link.label}
                  </FooterLink>
                ))}
              </Box>
            </Grid2>
          ))}
        </Grid2>

        <Divider sx={{ my: 3, backgroundColor: "rgba(255,255,255,0.1)" }} />

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexDirection: { xs: "column", sm: "row" },
            gap: 2,
          }}
        >
          <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.6)" }}>
            © {new Date().getFullYear()} Akogare Cafe. All rights reserved.
          </Typography>

          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            <FooterLink onClick={() => navigate("/privacy")}>
              Privacy
            </FooterLink>
            <Typography sx={{ color: "rgba(255,255,255,0.4)" }}>|</Typography>
            <FooterLink onClick={() => navigate("/terms")}>Terms</FooterLink>
            <Typography sx={{ color: "rgba(255,255,255,0.4)" }}>|</Typography>
            <FooterLink onClick={() => navigate("/contact")}>
              Contact
            </FooterLink>
          </Box>
        </Box>

        <Box sx={{ mt: 2, textAlign: "center" }}>
          <Typography
            variant="body2"
            sx={{ color: "rgba(255,255,255,0.5)", fontSize: "0.8rem" }}
          >
            Built with React, Material-UI, and passion for Japanese culture and
            technology.
          </Typography>
        </Box>
      </Container>
    </FooterWrapper>
  );
};

export default Footer;
