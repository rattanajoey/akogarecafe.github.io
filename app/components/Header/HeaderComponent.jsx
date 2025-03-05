import React from "react";
import { Box, IconButton, Button } from "@mui/material";
import YouTubeIcon from "@mui/icons-material/YouTube";
import InstagramIcon from "@mui/icons-material/Instagram";
import TwitterIcon from "@mui/icons-material/Twitter";
import GamesIcon from "@mui/icons-material/Games";
import GitHubIcon from "@mui/icons-material/GitHub";
import { SocialMediaContainer, Title, NavLinksContainer } from "./style";
import Link from "next/link";

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
          href="https://twitter.com/akogarecafe"
          target="_blank"
          aria-label="Twitter"
        >
          <TwitterIcon />
        </IconButton>
        <IconButton
          href="https://github.com/akogarecafe"
          target="_blank"
          aria-label="GitHub"
        >
          <GitHubIcon />
        </IconButton>
      </SocialMediaContainer>

      <Title>
        <Link href="/" passHref>
          <span>Akogare Cafe</span>
        </Link>
      </Title>

      <NavLinksContainer>
        <Link href="/" passHref>
          <Button
            startIcon={<GamesIcon />}
            color="inherit"
            sx={{ textTransform: "none" }}
          >
            Shogi
          </Button>
        </Link>
        <Link href="/music" passHref>
          <Button color="inherit" sx={{ textTransform: "none" }}>
            Music
          </Button>
        </Link>
        <Link href="/portfolio" passHref>
          <Button color="inherit" sx={{ textTransform: "none" }}>
            Portfolio
          </Button>
        </Link>
      </NavLinksContainer>
    </Box>
  );
};

export default HeaderComponent; 