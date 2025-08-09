import React from "react";
import { Box, IconButton, Menu, MenuItem, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import YouTubeIcon from "@mui/icons-material/YouTube";
import InstagramIcon from "@mui/icons-material/Instagram";
import TwitterIcon from "@mui/icons-material/Twitter";
import GamesIcon from "@mui/icons-material/Games";
import GitHubIcon from "@mui/icons-material/GitHub";
import MenuIcon from "@mui/icons-material/Menu";
import { SocialMediaContainer, Title } from "./style";

const HeaderComponent = () => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNavigation = (path) => {
    navigate(path);
    handleClose();
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
      className="App-header"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "1rem 2rem",
        backgroundColor: "rgba(0, 0, 0, 0.9)",
        backdropFilter: "blur(10px)",
        borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
      }}
    >
      <SocialMediaContainer>
        <IconButton
          href="https://www.youtube.com/c/akogarecafe"
          target="_blank"
          aria-label="YouTube"
        >
          <YouTubeIcon />
        </IconButton>
        <IconButton
          href="https://www.instagram.com/akogarecafe"
          target="_blank"
          aria-label="Instagram"
        >
          <InstagramIcon />
        </IconButton>
        <IconButton
          href="https://x.com/AkogareCafe_JR"
          target="_blank"
          aria-label="Twitter"
        >
          <TwitterIcon />
        </IconButton>
        <IconButton
          href="https://www.twitch.tv/akogarecafe"
          target="_blank"
          aria-label="Twitch"
        >
          <GamesIcon />
        </IconButton>
        <IconButton
          href="https://github.com/rattanajoey"
          target="_blank"
          aria-label="GitHub"
        >
          <GitHubIcon />
        </IconButton>
      </SocialMediaContainer>

      <Title
        variant="h4"
        onClick={() => navigate("/")}
        sx={{ cursor: "pointer", "&:hover": { opacity: 0.8 } }}
      >
        Akogare Cafe
      </Title>

      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <Box sx={{ display: { xs: "none", md: "flex" }, gap: 1 }}>
          <Typography
            onClick={() => navigate("/about")}
            sx={{
              cursor: "pointer",
              color: "white",
              "&:hover": { color: "#4ecdc4" },
              fontSize: "0.9rem",
              fontWeight: "500",
            }}
          >
            About
          </Typography>
          <Typography
            onClick={() => navigate("/contact")}
            sx={{
              cursor: "pointer",
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
          onClick={handleClick}
          aria-label="Navigation Menu"
          sx={{ color: "white" }}
        >
          <MenuIcon />
        </IconButton>

        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          MenuListProps={{
            "aria-labelledby": "basic-button",
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
              onClick={() => handleNavigation(item.path)}
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
