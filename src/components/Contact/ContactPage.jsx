import React from "react";
import { Box, Typography, Container, Grid2, Card, CardActionArea, CardContent } from "@mui/material";
import YouTubeIcon from "@mui/icons-material/YouTube";
import InstagramIcon from "@mui/icons-material/Instagram";
import TwitterIcon from "@mui/icons-material/Twitter";
import GamesIcon from "@mui/icons-material/Games";
import GitHubIcon from "@mui/icons-material/GitHub";

const ContactPage = () => {
  const socialLinks = [
    {
      name: "YouTube",
      icon: <YouTubeIcon sx={{ fontSize: 40 }} />,
      url: "https://www.youtube.com/c/akogarecafe",
      description: "Latest videos and content",
      color: "#FF0000",
    },
    {
      name: "Instagram",
      icon: <InstagramIcon sx={{ fontSize: 40 }} />,
      url: "https://www.instagram.com/akogarecafe",
      description: "Behind the scenes content",
      color: "#E4405F",
    },
    {
      name: "Twitter/X",
      icon: <TwitterIcon sx={{ fontSize: 40 }} />,
      url: "https://x.com/AkogareCafe_JR",
      description: "Updates and quick thoughts",
      color: "#1DA1F2",
    },
    {
      name: "Twitch",
      icon: <GamesIcon sx={{ fontSize: 40 }} />,
      url: "https://www.twitch.tv/akogarecafe",
      description: "Live streaming and gaming",
      color: "#9146FF",
    },
    {
      name: "GitHub",
      icon: <GitHubIcon sx={{ fontSize: 40 }} />,
      url: "https://github.com/rattanajoey",
      description: "Code and projects",
      color: "#bbb",
    },
  ];


  return (
    <Box sx={{ color: "white", bgcolor: "#000", py: 6 }}>
      <Container maxWidth="md">
        <Typography component="h1" variant="h2" align="center" sx={{ fontSize: { xs: "2.5rem", sm: "3.75rem" }, fontWeight: "bold", mb: 3, background: "linear-gradient(45deg, #ff6b6b, #4ecdc4)", backgroundClip: "text", color: "transparent" }}>
          Get In Touch
        </Typography>
        <Typography align="center" sx={{ color: "rgba(255,255,255,0.8)", mb: 5, maxWidth: 560, mx: "auto" }}>
          Have a project idea or want to say hello? Connect with me through my public profiles. For a direct message, find me on Instagram or X.
        </Typography>
        <Grid2 container spacing={3}>
          {socialLinks.map((social) => (
            <Grid2 key={social.name} size={{ xs: 12, sm: 6 }}>
              <Card sx={{ height: "100%", color: "white", bgcolor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 3 }}>
                <CardActionArea component="a" href={social.url} target="_blank" rel="noopener noreferrer" sx={{ height: "100%" }}>
                  <CardContent sx={{ textAlign: "center", p: 3 }}>
                    <Box sx={{ color: social.color, mb: 1 }}>{social.icon}</Box>
                    <Typography component="h2" variant="h5" gutterBottom>{social.name}</Typography>
                    <Typography sx={{ color: "rgba(255,255,255,0.75)" }}>{social.description}</Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid2>
          ))}
        </Grid2>
      </Container>
    </Box>
  );
};
export default ContactPage;
