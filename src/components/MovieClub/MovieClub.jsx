import React from "react";
import MovieSubmission from "./MovieComponents/MovieSubmission";
import SubmissionList from "./MovieComponents/SubmissionList";
import { Box, Typography, Grid2 } from "@mui/material";

const MovieClub = () => {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100%",
        background: "linear-gradient(to bottom, #d2d2cb, #4d695d)",
        color: "#bc252d",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
      pt={{ xs: 4, md: 6 }}
    >
      <Typography
        variant="h2"
        sx={{
          fontWeight: "bold",
          fontFamily: "'Merriweather', serif",
          textShadow: "2px 2px 6px rgba(0,0,0,0.5)",
        }}
      >
        🎥 Movie Club
      </Typography>

      <Grid2
        container
        spacing={4}
        justifyContent={{ xs: "center", lg: "flex-start" }}
        sx={{ mt: 4, width: "100%" }}
        px={2}
      >
        <Grid2 size={{ xs: 12, md: 6 }}>
          <SubmissionList />
        </Grid2>

        <Grid2 size={{ xs: 12, md: 6 }} mb={{ xs: 20, md: 0 }}>
          <MovieSubmission />
        </Grid2>
      </Grid2>
    </Box>
  );
};

export default MovieClub;
