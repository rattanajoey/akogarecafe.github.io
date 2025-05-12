import React, { useEffect, useState } from "react";
import MovieSubmission from "./MovieComponents/MovieSubmission";
import SubmissionList from "./MovieComponents/SubmissionList";
import { Box, Typography, Grid2 } from "@mui/material";
import MovieClubInfoModal from "./MovieComponents/MovieClubInfoModal";
import SelectedMoviesDisplay from "./MovieComponents/SelectedMoviesDisplay";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../config/firebase";
import { getCurrentMonth, getNextMonth } from "../utils";
import GenrePool from "./MovieComponents/GenrePool";

const MovieClub = () => {
  const [submissionsOpen] = useState(false);
  const [selections, setSelections] = useState({});
  const [pools, setPools] = useState({
    action: [],
    drama: [],
    comedy: [],
    thriller: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      const currentMonth = getCurrentMonth();
      const nextMonth = getNextMonth();

      // Fetch selected movies
      const selectionsRef = doc(db, "MonthlySelections", currentMonth);
      const selectionsSnap = await getDoc(selectionsRef);
      if (selectionsSnap.exists()) {
        setSelections(selectionsSnap.data());
      }

      // Fetch remaining pool
      const genrePoolsRef = doc(db, "GenrePools", nextMonth);
      const genrePoolsSnap = await getDoc(genrePoolsRef);
      if (genrePoolsSnap.exists()) {
        setPools(genrePoolsSnap.data());
      }
    };

    fetchData();
  }, []);

  return (
    <Box
      sx={{
        height: "100%",
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

      {submissionsOpen ? (
        <Grid2
          container
          spacing={4}
          justifyContent={{ xs: "center", lg: "flex-start" }}
          sx={{ mt: 4, width: "100%", overflow: "hidden" }}
          px={2}
        >
          <Grid2 size={{ xs: 12, md: 6 }} zIndex={2}>
            <SubmissionList />
          </Grid2>

          <Grid2 size={{ xs: 12, md: 6 }}>
            <MovieClubInfoModal />
          </Grid2>

          <Grid2 size={{ xs: 12, md: 6 }} mb={{ xs: "50vh" }} zIndex={2}>
            <MovieSubmission />
          </Grid2>
        </Grid2>
      ) : (
        <Box justifyItems={"center"}>
          <SelectedMoviesDisplay selections={selections} />
          <GenrePool pools={pools} />
        </Box>
      )}
    </Box>
  );
};

export default MovieClub;
