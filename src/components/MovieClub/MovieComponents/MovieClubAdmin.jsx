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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { collection, getDocs, setDoc, doc, getDoc } from "firebase/firestore";
import { db } from "../../../config/firebase";
import { getCurrentMonth } from "../../utils";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import LocalMoviesIcon from "@mui/icons-material/LocalMovies";
import PersonIcon from "@mui/icons-material/Person";

const genres = ["action", "drama", "comedy", "thriller"];
const SAVE_PASSWORD = "thunderbolts"; // Same as submission password

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
  const [monthlyHistory, setMonthlyHistory] = useState([]);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [savePassword, setSavePassword] = useState("");

  const currentMonth = getCurrentMonth();

  // Generate array of months from May 2025 onwards
  const getMonthOptions = () => {
    const options = [];
    const startDate = new Date(2025, 4, 1); // May 2025
    const now = new Date();

    // Add current month and next 3 months
    for (let i = 0; i <= 3; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() + i, 1);
      // Only add if the date is after or equal to May 2025
      if (date >= startDate) {
        const monthStr = `${date.getFullYear()}-${String(
          date.getMonth() + 1
        ).padStart(2, "0")}`;
        const displayStr = date.toLocaleString("default", {
          month: "long",
          year: "numeric",
        });
        options.push({ value: monthStr, label: displayStr });
      }
    }
    return options;
  };

  const handleLogin = () => {
    if (password === "adminpass") setAccess(true);
    else alert("Wrong password.");
  };

  const fetchPools = useCallback(async () => {
    setLoading(true);

    try {
      // Get current pool
      const currentPoolRef = doc(db, "GenrePools", "current");
      const currentPoolSnap = await getDoc(currentPoolRef);

      if (currentPoolSnap.exists()) {
        const genreData = currentPoolSnap.data();
        setPools({
          action: genreData.action || [],
          drama: genreData.drama || [],
          comedy: genreData.comedy || [],
          thriller: genreData.thriller || [],
        });
      } else {
        // If no current pool exists, create one from current submissions
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

        // Save the new pool
        await setDoc(doc(db, "GenrePools", "current"), newPools);
        setPools(newPools);
      }
    } catch (error) {
      console.error("Error fetching pools:", error);
    } finally {
      setLoading(false);
    }
  }, [currentMonth]);

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

  const handleSaveClick = () => {
    if (!Object.keys(selections).length) {
      alert("No selections to save!");
      return;
    }
    setSaveDialogOpen(true);
  };

  const handleSaveConfirm = async () => {
    if (savePassword !== SAVE_PASSWORD) {
      alert("Incorrect password!");
      setSavePassword("");
      return;
    }

    try {
      // Save monthly winners to selected month
      await setDoc(doc(db, "MonthlySelections", selectedMonth), selections);

      // Get current pool
      const currentPoolRef = doc(db, "GenrePools", "current");
      const currentPoolSnap = await getDoc(currentPoolRef);
      const currentPool = currentPoolSnap.exists()
        ? currentPoolSnap.data()
        : {
            action: [],
            drama: [],
            comedy: [],
            thriller: [],
          };

      // Remove selected movies from the pool
      const updatedPool = {};
      genres.forEach((genre) => {
        updatedPool[genre] = currentPool[genre].filter(
          (m) =>
            m.title !== selections[genre]?.title ||
            m.submittedBy !== selections[genre]?.submittedBy
        );
      });

      // Save updated pool
      await setDoc(doc(db, "GenrePools", "current"), updatedPool);

      // Update existing selections after save
      setExistingSelections(selections);
      alert("Selections saved successfully!");

      // Reset and close dialog
      setSavePassword("");
      setSaveDialogOpen(false);

      // Refresh history
      fetchMonthlyHistory();
    } catch (err) {
      console.error("Error saving:", err);
      alert("Failed to save selections.");
    }
  };

  // Fetch all monthly selections for the history table
  const fetchMonthlyHistory = useCallback(async () => {
    try {
      const selectionsRef = collection(db, "MonthlySelections");
      const snapshot = await getDocs(selectionsRef);
      const history = await Promise.all(
        snapshot.docs.map(async (doc) => {
          const data = doc.data();
          const [year, month] = doc.id.split("-");
          const date = new Date(parseInt(year), parseInt(month) - 1, 1);
          return {
            month: doc.id,
            displayMonth: date.toLocaleString("default", {
              month: "long",
              year: "numeric",
            }),
            selections: data,
          };
        })
      );
      // Sort by month in descending order (newest first)
      history.sort((a, b) => b.month.localeCompare(a.month));
      setMonthlyHistory(history);
    } catch (error) {
      console.error("Error fetching history:", error);
    }
  }, []);

  useEffect(() => {
    if (access) {
      fetchMonthlyHistory();
    }
  }, [access, fetchMonthlyHistory]);

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
    <Box p={4} mb={20}>
      <Typography variant="h4" fontWeight="bold" mb={3}>
        🎬 Movie Club Admin
      </Typography>

      <Grid2 container spacing={4}>
        <Grid2 item xs={12} md={6}>
          <Paper sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Next Month Selection
            </Typography>
            <FormControl sx={{ mb: 3, minWidth: 200 }}>
              <InputLabel>Select Month for Next Selection</InputLabel>
              <Select
                value={selectedMonth}
                label="Select Month for Next Selection"
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
                        <CheckCircleIcon
                          sx={{ color: "success.main", ml: 1 }}
                        />
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
              <>
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
              </>
            )}

            <Box mt={4} textAlign="center">
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
                onClick={handleSaveClick}
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
          </Paper>
        </Grid2>

        <Grid2 item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Movie Club History
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Month</TableCell>
                    <TableCell>Action</TableCell>
                    <TableCell>Drama</TableCell>
                    <TableCell>Comedy</TableCell>
                    <TableCell>Thriller</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {monthlyHistory.map((month) => (
                    <TableRow key={month.month}>
                      <TableCell>
                        <Chip
                          label={month.displayMonth}
                          color="primary"
                          variant="outlined"
                        />
                      </TableCell>
                      {genres.map((genre) => {
                        const movie = month.selections[genre];
                        return (
                          <TableCell key={genre}>
                            {movie ? (
                              <Box>
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                  }}
                                >
                                  <LocalMoviesIcon fontSize="small" />
                                  <Typography variant="body2" fontWeight="bold">
                                    {movie.title}
                                  </Typography>
                                </Box>
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                    mt: 0.5,
                                  }}
                                >
                                  <PersonIcon fontSize="small" />
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                  >
                                    {movie.submittedBy}
                                  </Typography>
                                </Box>
                              </Box>
                            ) : (
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                -
                              </Typography>
                            )}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid2>
      </Grid2>

      <Dialog open={saveDialogOpen} onClose={() => setSaveDialogOpen(false)}>
        <DialogTitle>Confirm Save</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Please enter the save password to confirm:
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            type="password"
            fullWidth
            value={savePassword}
            onChange={(e) => setSavePassword(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                handleSaveConfirm();
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSaveDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleSaveConfirm}
            variant="contained"
            color="primary"
          >
            Confirm Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MovieClubAdmin;
