import React, { useEffect, useState } from "react";
import MovieSubmission from "./MovieComponents/MovieSubmission";
import SubmissionList from "./MovieComponents/SubmissionList";
import { Box, Typography, Grid2 } from "@mui/material";
import MovieClubInfoModal from "./MovieComponents/MovieClubInfoModal";
import SelectedMoviesDisplay from "./MovieComponents/SelectedMoviesDisplay";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../config/firebase";
import { getCurrentMonth } from "../utils";
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
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());

  useEffect(() => {
    const fetchData = async () => {
      // Fetch selected movies for the selected month
      const selectionsRef = doc(db, "MonthlySelections", selectedMonth);
      const selectionsSnap = await getDoc(selectionsRef);
      if (selectionsSnap.exists()) {
        setSelections(selectionsSnap.data());
      }

      // Fetch the current remaining pool (independent of month)
      const genrePoolsRef = doc(db, "GenrePools", "current");
      const genrePoolsSnap = await getDoc(genrePoolsRef);
      if (genrePoolsSnap.exists()) {
        setPools(genrePoolsSnap.data());
      }
    };

    fetchData();
  }, [selectedMonth]);

  const handleMonthChange = (month) => {
    setSelectedMonth(month);
  };

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
        <Box>
          <SelectedMoviesDisplay
            selections={selections}
            onMonthChange={handleMonthChange}
          />
          <GenrePool pools={pools} />
        </Box>
      )}
    </Box>
  );
};

export default MovieClub;
