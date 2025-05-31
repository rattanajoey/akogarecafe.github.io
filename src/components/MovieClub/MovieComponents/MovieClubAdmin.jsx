import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid2,
  Paper,
  Divider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import { collection, getDocs, setDoc, doc, getDoc } from "firebase/firestore";
import { db } from "../../../config/firebase";
import { getCurrentMonth, getNextMonth } from "../../utils";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

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
  const [selections, setSelections] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const [existingSelections, setExistingSelections] = useState({});

  const currentMonth = getCurrentMonth();
  const nextMonth = getNextMonth();

  // Generate array of last 3 months and next 3 months
  const getMonthOptions = () => {
    const options = [];
    const now = new Date();
    for (let i = -3; i <= 3; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const monthStr = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;
      const displayStr = date.toLocaleString("default", {
        month: "long",
        year: "numeric",
      });
      options.push({ value: monthStr, label: displayStr });
    }
    return options;
  };

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

  // Fetch existing selections for the selected month
  const fetchExistingSelections = useCallback(async (month) => {
    const selectionsRef = doc(db, "MonthlySelections", month);
    const selectionsSnap = await getDoc(selectionsRef);
    if (selectionsSnap.exists()) {
      setExistingSelections(selectionsSnap.data());
    } else {
      setExistingSelections({});
    }
  }, []);

  // Update selections when month changes
  useEffect(() => {
    if (access) {
      fetchExistingSelections(selectedMonth);
    }
  }, [access, selectedMonth, fetchExistingSelections]);

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
      // Save monthly winners to selected month
      await setDoc(doc(db, "MonthlySelections", selectedMonth), selections);

      // Save leftovers for next month
      const leftovers = {};
      genres.forEach((genre) => {
        leftovers[genre] = pools[genre].filter(
          (m) =>
            m.title !== selections[genre]?.title ||
            m.submittedBy !== selections[genre]?.submittedBy
        );
      });

      // Calculate next month based on selected month
      const [year, month] = selectedMonth.split("-");
      const nextMonthDate = new Date(parseInt(year), parseInt(month), 1);
      nextMonthDate.setMonth(nextMonthDate.getMonth() + 1);
      const nextMonthStr = `${nextMonthDate.getFullYear()}-${String(
        nextMonthDate.getMonth() + 1
      ).padStart(2, "0")}`;

      await setDoc(doc(db, "GenrePools", nextMonthStr), leftovers);

      // Update existing selections after save
      setExistingSelections(selections);
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
        🎬 Movie Club Admin
      </Typography>

      <FormControl sx={{ mb: 3, minWidth: 200 }}>
        <InputLabel>Select Month</InputLabel>
        <Select
          value={selectedMonth}
          label="Select Month"
          onChange={(e) => setSelectedMonth(e.target.value)}
        >
          {getMonthOptions().map((option) => (
            <MenuItem key={option.value} value={option.value}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  width: "100%",
                }}
              >
                <span>{option.label}</span>
                {existingSelections[option.value] && (
                  <CheckCircleIcon sx={{ color: "success.main", ml: 1 }} />
                )}
              </Box>
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {Object.keys(existingSelections).length > 0 && (
        <Box mb={3}>
          <Typography
            variant="subtitle1"
            color="success.main"
            sx={{ display: "flex", alignItems: "center", gap: 1 }}
          >
            <CheckCircleIcon /> This month already has selections saved
          </Typography>
        </Box>
      )}

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
    </Box>
  );
};

export default MovieClubAdmin;
