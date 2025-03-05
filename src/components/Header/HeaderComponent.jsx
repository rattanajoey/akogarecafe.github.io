import React from "react";
import { Box, IconButton, Typography } from "@mui/material";
import YouTubeIcon from "@mui/icons-material/YouTube";
import InstagramIcon from "@mui/icons-material/Instagram";
import TwitterIcon from "@mui/icons-material/Twitter";
import GamesIcon from "@mui/icons-material/Games";
import GitHubIcon from "@mui/icons-material/GitHub";
import { SocialMediaContainer } from "./style";

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
      <Typography variant="h4" style={{ textAlign: "center", flexGrow: 1 }}>
        Akogare Cafe
      </Typography>
    </Box>
  );
};

export default HeaderComponent;
