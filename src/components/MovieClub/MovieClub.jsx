import React, { useEffect, useState } from "react";
import MovieSubmission from "./MovieComponents/MovieSubmission";
import SubmissionList from "./MovieComponents/SubmissionList";
import { Box, Typography, Grid2, Link, Button } from "@mui/material";
import MovieClubInfoModal from "./MovieComponents/MovieClubInfoModal";
import SelectedMoviesDisplay from "./MovieComponents/SelectedMoviesDisplay";
import OscarVotingModal from "./MovieComponents/OscarVotingModal";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../config/firebase";
import { getCurrentMonth } from "../utils";
import GenrePool from "./MovieComponents/GenrePool";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";

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
  const [oscarModalOpen, setOscarModalOpen] = useState(false);

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
      <Box
        sx={{
          display: "flex",
          alignItems: "baseline",
          gap: 2,
          flexDirection: { xs: "column", sm: "row" },
          mb: { xs: 2, sm: 0 },
        }}
      >
        <Typography
          variant="h2"
          sx={{
            fontWeight: "bold",
            fontFamily: "'Merriweather', serif",
            textShadow: "2px 2px 6px rgba(0,0,0,0.5)",
          }}
        >
          Movie Club
        </Typography>
        <Link
          href="https://www.themoviedb.org/"
          target="_blank"
          rel="noopener noreferrer"
          sx={{
            display: "flex",
            alignItems: "center",
            textDecoration: "none",
            "&:hover": {
              opacity: 0.8,
            },
          }}
        >
          <img
            src="/logos/tmdb.svg"
            alt="TMDB"
            style={{
              height: "22px",
              width: "auto",
            }}
          />
        </Link>
      </Box>

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

          {/* Oscar Voting Button */}
          <Box sx={{ textAlign: "center", mt: 4, mb: 4 }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<EmojiEventsIcon />}
              onClick={() => setOscarModalOpen(true)}
              sx={{
                backgroundColor: "#FFD700",
                color: "#000",
                fontWeight: "bold",
                fontSize: "1.2rem",
                px: 4,
                py: 2,
                borderRadius: 3,
                boxShadow: "0 4px 8px rgba(0,0,0,0.3)",
                "&:hover": {
                  backgroundColor: "#FFC107",
                  transform: "translateY(-2px)",
                  boxShadow: "0 6px 12px rgba(0,0,0,0.4)",
                },
                transition: "all 0.3s ease",
              }}
            >
              🏆 Oscar Voting
            </Button>
            <Typography variant="body2" color="text.secondary" mt={1}>
              Vote for your favorite movies in various categories
            </Typography>
          </Box>
        </Box>
      )}

      {/* Oscar Voting Modal */}
      <OscarVotingModal
        open={oscarModalOpen}
        onClose={() => setOscarModalOpen(false)}
      />
    </Box>
  );
};

export default MovieClub;
