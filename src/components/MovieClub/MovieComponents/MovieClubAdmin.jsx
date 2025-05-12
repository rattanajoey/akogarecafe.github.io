import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid2,
  Paper,
  Divider,
} from "@mui/material";
import { collection, getDocs, setDoc, doc, getDoc } from "firebase/firestore";
import { db } from "../../../config/firebase";
import { getCurrentMonth, getNextMonth } from "../../utils";

const genres = ["action", "drama", "comedy", "thriller"];

const MovieClubAdmin = () => {
  const [access, setAccess] = useState(false);
  const [password, setPassword] = useState("");
  const [pools, setPools] = useState({
    action: [],
    drama: [],
    comedy: [],
    thriller: [],
  });
  console.log(pools);
  const [selections, setSelections] = useState({});
  const [loading, setLoading] = useState(false);

  const currentMonth = getCurrentMonth();
  const nextMonth = getNextMonth();

  const handleLogin = () => {
    if (password === "adminpass") setAccess(true);
    else alert("Wrong password.");
  };

  const fetchPools = useCallback(async () => {
    setLoading(true);

    const nextMonthRef = doc(db, "GenrePools", nextMonth);
    const nextMonthSnap = await getDoc(nextMonthRef);

    if (nextMonthSnap.exists()) {
      const genreData = nextMonthSnap.data();
      setPools({
        action: genreData.action || [],
        drama: genreData.drama || [],
        comedy: genreData.comedy || [],
        thriller: genreData.thriller || [],
      });
    } else {
      // fallback to current submissions if nextMonth pool isn't created yet
      const snapshot = await getDocs(
        collection(db, "Submissions", currentMonth, "users")
      );

      const newPools = { action: [], drama: [], comedy: [], thriller: [] };

      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        genres.forEach((genre) => {
          const title = data[genre]?.trim();
          if (title) {
            newPools[genre].push({ title, submittedBy: docSnap.id });
          }
        });
      });

      setPools(newPools);
    }

    setLoading(false);
  }, [currentMonth, nextMonth]);

  const randomize = () => {
    const result = {};
    genres.forEach((genre) => {
      const options = pools[genre];
      if (options.length > 0) {
        const pick = options[Math.floor(Math.random() * options.length)];
        result[genre] = pick;
      }
    });
    setSelections(result);
  };

  const saveSelections = async () => {
    if (!Object.keys(selections).length) {
      alert("No selections to save!");
      return;
    }

    try {
      // Save monthly winners
      await setDoc(doc(db, "MonthlySelections", currentMonth), selections);

      // Save leftovers for next month
      const leftovers = {};
      genres.forEach((genre) => {
        leftovers[genre] = pools[genre].filter(
          (m) =>
            m.title !== selections[genre]?.title ||
            m.submittedBy !== selections[genre]?.submittedBy
        );
      });

      await setDoc(doc(db, "GenrePools", nextMonth), leftovers);

      alert("Selections saved successfully!");
    } catch (err) {
      console.error("Error saving:", err);
      alert("Failed to save selections.");
    }
  };

  useEffect(() => {
    if (access) fetchPools();
  }, [access, fetchPools]);

  if (!access) {
    return (
      <Box textAlign="center" mt={8}>
        <Typography variant="h5" mb={2}>
          🔐 Enter Admin Password
        </Typography>
        <TextField
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          sx={{ mb: 2 }}
        />
        <br />
        <Button variant="contained" onClick={handleLogin}>
          Access Admin Panel
        </Button>
      </Box>
    );
  }

  return (
    <Box p={4}>
      <Typography variant="h4" fontWeight="bold" mb={3}>
        🎬 Movie Club Admin — {currentMonth}
      </Typography>

      {loading ? (
        <Typography>Loading submissions...</Typography>
      ) : (
        <Grid2 container spacing={3}>
          {genres.map((genre) => (
            <Grid2 item xs={12} md={6} key={genre}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  {genre.toUpperCase()} Pool
                </Typography>
                <Divider sx={{ mb: 1 }} />
                {pools[genre].length === 0 ? (
                  <Typography>No submissions</Typography>
                ) : (
                  pools[genre].map((movie, i) => (
                    <Typography key={i}>
                      • {movie.title} — <i>{movie.submittedBy}</i>
                    </Typography>
                  ))
                )}
              </Paper>
            </Grid2>
          ))}
        </Grid2>
      )}

      <Box mt={4} mb={20} textAlign="center">
        <Button
          variant="contained"
          sx={{ backgroundColor: "#4d695d", mr: 2 }}
          onClick={randomize}
        >
          🎲 Randomize Selections
        </Button>
        <Button
          variant="contained"
          sx={{ backgroundColor: "#bc252d" }}
          onClick={saveSelections}
        >
          💾 Save to Firestore
        </Button>
      </Box>

      {Object.keys(selections).length > 0 && (
        <Box mt={4}>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            🎉 Selected Movies
          </Typography>
          {genres.map((g) =>
            selections[g] ? (
              <Typography key={g}>
                {g.toUpperCase()}: {selections[g].title} —{" "}
                <i>{selections[g].submittedBy}</i>
              </Typography>
            ) : null
          )}
        </Box>
      )}
    </Box>
  );
};

export default MovieClubAdmin;
