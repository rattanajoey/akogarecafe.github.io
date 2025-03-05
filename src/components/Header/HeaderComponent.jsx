import React from "react";
import { Box, IconButton, Button } from "@mui/material";
import YouTubeIcon from "@mui/icons-material/YouTube";
import InstagramIcon from "@mui/icons-material/Instagram";
import TwitterIcon from "@mui/icons-material/Twitter";
import GamesIcon from "@mui/icons-material/Games";
import GitHubIcon from "@mui/icons-material/GitHub";
import { SocialMediaContainer, Title, NavLinksContainer } from "./style";
import { Link } from "react-router-dom";

const HeaderComponent = () => {
  return (
    <Box
      className="App-header"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
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
      <Title variant="h4">Akogare Cafe</Title>
      <NavLinksContainer>
        <Button component={Link} to="/" color="inherit">
          Home
        </Button>
        <Button component={Link} to="/music" color="inherit">
          Music
        </Button>
        <Button component={Link} to="/portfolio" color="inherit">
          Portfolio
        </Button>
      </NavLinksContainer>
    </Box>
  );
};

export default HeaderComponent;
