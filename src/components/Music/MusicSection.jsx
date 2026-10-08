import React from "react";
import { Box, Typography } from "@mui/material";
import { MusicWrapper } from "./style";
import MusicEffect from "../MusicEffect/MusicEffect";
import MusicShelf from "../MusicShelf/MusicShelf";

const MusicSection = () => (
  <MusicWrapper sx={{ display: "block", position: "relative", px: { xs: 2, sm: 3 }, pt: 4, pb: 14 }}>
    <MusicEffect />
    <Box sx={{ color: "white", textAlign: "center", position: "relative", zIndex: 1, mb: 4 }}>
      <Typography component="h1" variant="h3" gutterBottom sx={{ fontSize: { xs: "2rem", sm: "3rem" } }}>Music Collection</Typography>
      <Typography sx={{ color: "rgba(255,255,255,0.75)" }}>Select an album to explore its artwork and story.</Typography>
    </Box>
    <MusicShelf />
  </MusicWrapper>
);
export default MusicSection;
