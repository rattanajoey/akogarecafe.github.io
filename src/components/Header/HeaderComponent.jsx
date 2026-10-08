import React from "react";
import { Box, IconButton, Menu, MenuItem, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import YouTubeIcon from "@mui/icons-material/YouTube";
import InstagramIcon from "@mui/icons-material/Instagram";
import TwitterIcon from "@mui/icons-material/Twitter";
import GamesIcon from "@mui/icons-material/Games";
import GitHubIcon from "@mui/icons-material/GitHub";
import MenuIcon from "@mui/icons-material/Menu";
import { SocialMediaContainer, Title } from "./style";

const HeaderComponent = () => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const menuItems = [
    { label: "Home", path: "/" },
    { label: "About", path: "/about" },
    { label: "Portfolio", path: "/portfolio" },
    { label: "Shogi Game", path: "/shogi" },
    { label: "Music", path: "/music" },
    { label: "Movie Club", path: "/MovieClub" },
    { label: "Contact", path: "/contact" },
    { label: "Privacy Policy", path: "/privacy" },
    { label: "Terms of Service", path: "/terms" },
  ];

  return (
    <Box
      component="header"
      className="App-header"
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: { xs: "0.75rem 1rem", sm: "1rem 1.5rem", md: "1rem 2rem" },
        backgroundColor: "rgba(0, 0, 0, 0.9)",
        backdropFilter: "blur(10px)",
        borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
        gap: { xs: 1, sm: 2 },
        flexWrap: { xs: "wrap", sm: "nowrap" },
        position: "relative",
      }}
    >
      <SocialMediaContainer
        sx={{
          gap: { xs: 0.5, sm: 1 },
          order: { xs: 3, sm: 0 },
          width: { xs: "100%", sm: "auto" },
          justifyContent: "center",
          "& .MuiIconButton-root": {
            padding: { xs: "6px", sm: "8px" },
          },
        }}
      >
        <IconButton
          href="https://www.youtube.com/c/akogarecafe"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="YouTube"
          size="small"
        >
          <YouTubeIcon sx={{ fontSize: { xs: "1.2rem", sm: "1.5rem" } }} />
        </IconButton>
        <IconButton
          href="https://www.instagram.com/akogarecafe"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Instagram"
          size="small"
        >
          <InstagramIcon sx={{ fontSize: { xs: "1.2rem", sm: "1.5rem" } }} />
        </IconButton>
        <IconButton
          href="https://x.com/AkogareCafe_JR"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Twitter"
          size="small"
        >
          <TwitterIcon sx={{ fontSize: { xs: "1.2rem", sm: "1.5rem" } }} />
        </IconButton>
        <IconButton
          href="https://www.twitch.tv/akogarecafe"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Twitch"
          size="small"
        >
          <GamesIcon sx={{ fontSize: { xs: "1.2rem", sm: "1.5rem" } }} />
        </IconButton>
        <IconButton
          href="https://github.com/rattanajoey"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="GitHub"
          size="small"
        >
          <GitHubIcon sx={{ fontSize: { xs: "1.2rem", sm: "1.5rem" } }} />
        </IconButton>
      </SocialMediaContainer>

      <Title
        variant="h4"
        component={RouterLink}
        to="/"
        sx={{
          color: "white",
          textDecoration: "none",
          textAlign: { xs: "left", sm: "center" },
          "&:hover": { opacity: 0.8 },
          fontSize: { xs: "1rem", sm: "1.25rem", md: "1.5rem" },
          whiteSpace: "nowrap",
        }}
      >
        Akogare Cafe
      </Title>

      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <Box sx={{ display: { xs: "none", md: "flex" }, gap: 1 }}>
          <Typography
            component={RouterLink}
            to="/about"
            sx={{
              textDecoration: "none",
              color: "white",
              "&:hover": { color: "#4ecdc4" },
              fontSize: "0.9rem",
              fontWeight: "500",
            }}
          >
            About
          </Typography>
          <Typography
            component={RouterLink}
            to="/contact"
            sx={{
              textDecoration: "none",
              color: "white",
              "&:hover": { color: "#4ecdc4" },
              fontSize: "0.9rem",
              fontWeight: "500",
            }}
          >
            Contact
          </Typography>
        </Box>

        <IconButton
          id="navigation-button"
          aria-haspopup="menu"
          aria-controls={open ? "navigation-menu" : undefined}
          aria-expanded={open ? "true" : undefined}
          onClick={handleClick}
          aria-label="Navigation Menu"
          sx={{
            color: "white",
            padding: { xs: "6px", sm: "8px" },
          }}
          size="small"
        >
          <MenuIcon sx={{ fontSize: { xs: "1.5rem", sm: "1.75rem" } }} />
        </IconButton>

        <Menu
          id="navigation-menu"
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          MenuListProps={{
            "aria-labelledby": "navigation-button",
          }}
          PaperProps={{
            sx: {
              backgroundColor: "rgba(0, 0, 0, 0.9)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              minWidth: "200px",
            },
          }}
        >
          {menuItems.map((item) => (
            <MenuItem
              key={item.path}
              component={RouterLink}
              to={item.path}
              onClick={handleClose}
              sx={{
                color: "white",
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                  color: "#4ecdc4",
                },
              }}
            >
              {item.label}
            </MenuItem>
          ))}
        </Menu>
      </Box>
    </Box>
  );
};

export default HeaderComponent;
