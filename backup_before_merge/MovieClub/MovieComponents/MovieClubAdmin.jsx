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
import {
  collection,
  getDocs,
  setDoc,
  doc,
  getDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../../../config/firebase";
import { getCurrentMonth } from "../../utils";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import LocalMoviesIcon from "@mui/icons-material/LocalMovies";
import PersonIcon from "@mui/icons-material/Person";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import ClearIcon from "@mui/icons-material/Clear";
import EditIcon from "@mui/icons-material/Edit";
import DoneIcon from "@mui/icons-material/Done";

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

  // Oscar voting states
  const [oscarCategories, setOscarCategories] = useState([]);
  const [oscarVotes, setOscarVotes] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [selectedMovies, setSelectedMovies] = useState({});
  const [allMovies, setAllMovies] = useState([]);

  // Holding pool states
  const [holdingPool, setHoldingPool] = useState([]);
  const [editingSubmission, setEditingSubmission] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editedNickname, setEditedNickname] = useState("");
  const [editedMovies, setEditedMovies] = useState({
    action: "",
    drama: "",
    comedy: "",
    thriller: "",
  });

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
        // Use Crypto API for cryptographically secure random selection
        const randomArray = new Uint32Array(1);
        crypto.getRandomValues(randomArray);
        const randomValue = randomArray[0] / (0xffffffff + 1);
        const pick = options[Math.floor(randomValue * options.length)];
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
    if (access) {
      fetchPools();
      fetchOscarData();
    }
  }, [access, fetchPools]);

  // Oscar voting functions
  const fetchOscarData = async () => {
    try {
      // Fetch categories
      const categoriesRef = collection(db, "OscarCategories");
      const categoriesSnapshot = await getDocs(categoriesRef);
      const categoriesData = [];

      categoriesSnapshot.forEach((doc) => {
        categoriesData.push({
          id: doc.id,
          name: doc.data().name,
          movies: doc.data().movies || [],
        });
      });

      setOscarCategories(categoriesData);

      // Fetch votes
      const votesRef = collection(db, "OscarVotes");
      const votesSnapshot = await getDocs(votesRef);
      const votesData = [];

      votesSnapshot.forEach((doc) => {
        votesData.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      setOscarVotes(votesData);

      // Fetch all movies from monthly selections for the movie pool
      const allMoviesSet = new Set();
      const selectionsRef = collection(db, "MonthlySelections");
      const selectionsSnapshot = await getDocs(selectionsRef);

      selectionsSnapshot.forEach((doc) => {
        const data = doc.data();
        Object.values(data).forEach((movie) => {
          if (movie && movie.title) {
            allMoviesSet.add(movie.title);
          }
        });
      });

      setAllMovies(Array.from(allMoviesSet).sort());
    } catch (error) {
      console.error("Error fetching Oscar data:", error);
    }
  };

  const addOscarCategory = async () => {
    if (!newCategoryName.trim()) {
      alert("Please enter a category name");
      return;
    }

    try {
      console.log("Adding category:", newCategoryName.trim());
      const categoryRef = doc(collection(db, "OscarCategories"));
      await setDoc(categoryRef, {
        name: newCategoryName.trim(),
        movies: [],
      });

      console.log("Category added successfully");
      setNewCategoryName("");
      fetchOscarData();
      alert("Category added successfully!");
    } catch (error) {
      console.error("Error adding category:", error);
      alert("Failed to add category: " + error.message);
    }
  };

  const deleteOscarCategory = async (categoryId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this category? This will also delete all votes for this category."
      )
    ) {
      return;
    }

    try {
      await deleteDoc(doc(db, "OscarCategories", categoryId));

      // Also delete all votes for this category
      const votesToDelete = oscarVotes.filter(
        (vote) => vote.categoryId === categoryId
      );
      for (const vote of votesToDelete) {
        await deleteDoc(doc(db, "OscarVotes", vote.id));
      }

      fetchOscarData();
    } catch (error) {
      console.error("Error deleting category:", error);
    }
  };

  const updateCategoryMovies = async (categoryId, movies) => {
    try {
      await setDoc(
        doc(db, "OscarCategories", categoryId),
        {
          name:
            oscarCategories.find((cat) => cat.id === categoryId)?.name || "",
          movies: movies,
        },
        { merge: true }
      );

      fetchOscarData();
    } catch (error) {
      console.error("Error updating category movies:", error);
    }
  };

  const handleSelectAllMovies = (categoryId) => {
    setSelectedMovies((prev) => ({
      ...prev,
      [categoryId]: [...allMovies],
    }));
  };

  const handleDeselectAllMovies = (categoryId) => {
    setSelectedMovies((prev) => ({
      ...prev,
      [categoryId]: [],
    }));
  };

  const handleMovieToggle = (categoryId, movie) => {
    setSelectedMovies((prev) => {
      const current = prev[categoryId] || [];
      const updated = current.includes(movie)
        ? current.filter((m) => m !== movie)
        : [...current, movie];

      return {
        ...prev,
        [categoryId]: updated,
      };
    });
  };

  const saveCategoryMovies = async (categoryId) => {
    const movies = selectedMovies[categoryId] || [];
    await updateCategoryMovies(categoryId, movies);
    setSelectedMovies((prev) => ({
      ...prev,
      [categoryId]: [],
    }));
  };

  const deleteOscarVote = async (voteId) => {
    if (!window.confirm("Are you sure you want to delete this vote?")) {
      return;
    }

    try {
      await deleteDoc(doc(db, "OscarVotes", voteId));
      console.log("Vote deleted successfully");
      fetchOscarData();
      alert("Vote deleted successfully!");
    } catch (error) {
      console.error("Error deleting vote:", error);
      alert("Failed to delete vote: " + error.message);
    }
  };

  // Holding pool functions
  const fetchHoldingPool = useCallback(async () => {
    try {
      const holdingRef = collection(db, "HoldingPool");
      const snapshot = await getDocs(holdingRef);
      const submissions = [];
      snapshot.forEach((doc) => {
        submissions.push({
          id: doc.id,
          ...doc.data(),
        });
      });
      setHoldingPool(submissions);
    } catch (error) {
      console.error("Error fetching holding pool:", error);
    }
  }, []);

  useEffect(() => {
    if (access) {
      fetchHoldingPool();
    }
  }, [access, fetchHoldingPool]);

  const moveSubmissionToCurrent = async (submission) => {
    try {
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

      // Add submission movies to current pool
      const updatedPool = { ...currentPool };
      genres.forEach((genre) => {
        const title = submission[genre]?.trim();
        if (title) {
          updatedPool[genre].push({
            title,
            submittedBy: submission.id,
          });
        }
      });

      // Save updated pool
      await setDoc(doc(db, "GenrePools", "current"), updatedPool);

      // Delete from holding pool
      await deleteDoc(doc(db, "HoldingPool", submission.id));

      // Refresh
      fetchPools();
      fetchHoldingPool();
      alert("Submission moved to current pool successfully!");
    } catch (error) {
      console.error("Error moving submission:", error);
      alert("Failed to move submission: " + error.message);
    }
  };

  const handleEditSubmission = (submission) => {
    setEditingSubmission(submission);
    setEditedNickname(submission.id);
    setEditedMovies({
      action: submission.action || "",
      drama: submission.drama || "",
      comedy: submission.comedy || "",
      thriller: submission.thriller || "",
    });
    setEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editedNickname.trim()) {
      alert("Nickname is required!");
      return;
    }

    try {
      const submissionRef = doc(db, "HoldingPool", editedNickname);
      await setDoc(submissionRef, {
        ...editingSubmission,
        action: editedMovies.action,
        drama: editedMovies.drama,
        comedy: editedMovies.comedy,
        thriller: editedMovies.thriller,
        updatedAt: new Date(),
      });

      fetchHoldingPool();
      setEditDialogOpen(false);
      setEditingSubmission(null);
      alert("Submission updated successfully!");
    } catch (error) {
      console.error("Error updating submission:", error);
      alert("Failed to update submission: " + error.message);
    }
  };

  const handleDeleteSubmission = async (submissionId) => {
    if (!window.confirm("Are you sure you want to delete this submission?")) {
      return;
    }

    try {
      await deleteDoc(doc(db, "HoldingPool", submissionId));
      fetchHoldingPool();
      alert("Submission deleted successfully!");
    } catch (error) {
      console.error("Error deleting submission:", error);
      alert("Failed to delete submission: " + error.message);
    }
  };

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
        {/* Oscar Voting Admin Section */}
        <Grid2 size={12}>
          <Paper sx={{ p: 3, mb: 4 }}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
              <EmojiEventsIcon sx={{ fontSize: 40, color: "#FFD700", mr: 2 }} />
              <Typography variant="h5" fontWeight="bold">
                🏆 Oscar Voting Admin
              </Typography>
            </Box>

            {/* Add New Category */}
            <Box sx={{ display: "flex", gap: 2, mb: 4 }}>
              <TextField
                label="New Category Name"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addOscarCategory()}
                sx={{ flexGrow: 1 }}
                placeholder="e.g., Best Picture, Best Director"
              />
              <Button
                variant="contained"
                onClick={addOscarCategory}
                startIcon={<AddIcon />}
                sx={{ backgroundColor: "#FFD700", color: "#000" }}
              >
                Add Category
              </Button>
            </Box>

            {/* Categories Management */}
            <Grid2 container spacing={3}>
              {oscarCategories.map((category) => (
                <Grid2 size={{ xs: 12, md: 6 }} key={category.id}>
                  <Paper sx={{ p: 2, border: "1px solid #FFD700" }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 2,
                      }}
                    >
                      <Typography
                        variant="h6"
                        fontWeight="bold"
                        color="#FFD700"
                      >
                        {category.name}
                      </Typography>
                      <Button
                        size="small"
                        color="error"
                        onClick={() => deleteOscarCategory(category.id)}
                        startIcon={<DeleteIcon />}
                      >
                        Delete
                      </Button>
                    </Box>

                    {/* Movie Selection */}
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Select Movies ({category.movies.length} selected):
                      </Typography>

                      <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleSelectAllMovies(category.id)}
                        >
                          Select All
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleDeselectAllMovies(category.id)}
                        >
                          Deselect All
                        </Button>
                        <Button
                          size="small"
                          variant="contained"
                          onClick={() => saveCategoryMovies(category.id)}
                          disabled={
                            !selectedMovies[category.id] ||
                            selectedMovies[category.id].length === 0
                          }
                        >
                          Save Movies
                        </Button>
                      </Box>

                      <Box
                        sx={{
                          maxHeight: 200,
                          overflowY: "auto",
                          border: "1px solid #ccc",
                          p: 1,
                          borderRadius: 1,
                        }}
                      >
                        {allMovies.map((movie) => {
                          const isSelected = (
                            selectedMovies[category.id] || []
                          ).includes(movie);
                          const isCurrentlyInCategory =
                            category.movies.includes(movie);

                          return (
                            <Box
                              key={movie}
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                p: 0.5,
                                cursor: "pointer",
                                backgroundColor: isSelected
                                  ? "#FFD700"
                                  : isCurrentlyInCategory
                                  ? "#4CAF50"
                                  : "transparent",
                                color:
                                  isSelected || isCurrentlyInCategory
                                    ? "#000"
                                    : "inherit",
                                borderRadius: 0.5,
                                mb: 0.5,
                              }}
                              onClick={() =>
                                handleMovieToggle(category.id, movie)
                              }
                            >
                              <Typography variant="body2">
                                {movie}
                                {isCurrentlyInCategory && !isSelected && " ✓"}
                              </Typography>
                            </Box>
                          );
                        })}
                      </Box>
                    </Box>

                    {/* Current Movies */}
                    {category.movies.length > 0 && (
                      <Box>
                        <Typography variant="subtitle2" gutterBottom>
                          Current Movies in Category:
                        </Typography>
                        <Box
                          sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}
                        >
                          {category.movies.map((movie) => (
                            <Chip
                              key={movie}
                              label={movie}
                              size="small"
                              sx={{ backgroundColor: "#4CAF50", color: "#000" }}
                            />
                          ))}
                        </Box>
                      </Box>
                    )}
                  </Paper>
                </Grid2>
              ))}
            </Grid2>

            {/* Vote Results */}
            {oscarVotes.length > 0 && (
              <Box sx={{ mt: 4 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  📊 Vote Results
                </Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Category</TableCell>
                        <TableCell>Movie</TableCell>
                        <TableCell>Voter</TableCell>
                        <TableCell>Vote Date</TableCell>
                        <TableCell>Updated</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {oscarVotes.map((vote) => {
                        const category = oscarCategories.find(
                          (cat) => cat.id === vote.categoryId
                        );
                        return (
                          <TableRow key={vote.id}>
                            <TableCell>
                              <Chip
                                label={category?.name || "Unknown Category"}
                                color="primary"
                                variant="outlined"
                              />
                            </TableCell>
                            <TableCell>
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                }}
                              >
                                <LocalMoviesIcon fontSize="small" />
                                <Typography variant="body2" fontWeight="bold">
                                  {vote.movie}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                }}
                              >
                                <PersonIcon fontSize="small" />
                                <Typography variant="body2">
                                  {vote.voterName}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {vote.timestamp
                                  ?.toDate?.()
                                  ?.toLocaleDateString() || "Unknown"}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              {vote.updated ? (
                                <Chip
                                  label="Updated"
                                  color="warning"
                                  size="small"
                                />
                              ) : (
                                <Chip
                                  label="Original"
                                  color="success"
                                  size="small"
                                />
                              )}
                            </TableCell>
                            <TableCell>
                              <Button
                                size="small"
                                color="error"
                                onClick={() => deleteOscarVote(vote.id)}
                                startIcon={<ClearIcon />}
                                variant="outlined"
                              >
                                Delete
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}
          </Paper>
        </Grid2>

        {/* Holding Pool Section */}
        <Grid2 size={12}>
          <Paper sx={{ p: 3, mb: 4 }}>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              📋 Holding Pool Submissions
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>
              Review and manage submissions before adding them to the current
              pool
            </Typography>
            {holdingPool.length > 0 ? (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Nickname</TableCell>
                      <TableCell>Action</TableCell>
                      <TableCell>Drama</TableCell>
                      <TableCell>Comedy</TableCell>
                      <TableCell>Thriller</TableCell>
                      <TableCell>Submitted</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {holdingPool.map((submission) => (
                      <TableRow key={submission.id}>
                        <TableCell>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <PersonIcon fontSize="small" />
                            <Typography variant="body2" fontWeight="bold">
                              {submission.id}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>{submission.action || "-"}</TableCell>
                        <TableCell>{submission.drama || "-"}</TableCell>
                        <TableCell>{submission.comedy || "-"}</TableCell>
                        <TableCell>{submission.thriller || "-"}</TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {submission.submittedAt
                              ?.toDate?.()
                              ?.toLocaleDateString() || "Unknown"}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: "flex", gap: 1 }}>
                            <Button
                              size="small"
                              variant="contained"
                              color="success"
                              onClick={() =>
                                moveSubmissionToCurrent(submission)
                              }
                              startIcon={<DoneIcon />}
                            >
                              Approve
                            </Button>
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => handleEditSubmission(submission)}
                              startIcon={<EditIcon />}
                            >
                              Edit
                            </Button>
                            <Button
                              size="small"
                              variant="outlined"
                              color="error"
                              onClick={() =>
                                handleDeleteSubmission(submission.id)
                              }
                              startIcon={<DeleteIcon />}
                            >
                              Delete
                            </Button>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography variant="body2" color="text.secondary" p={2}>
                No submissions in holding pool
              </Typography>
            )}
          </Paper>
        </Grid2>

        <Grid2 size={{ xs: 12, md: 6 }}>
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
                    <Grid2 size={{ xs: 12, md: 6 }} key={genre}>
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

        <Grid2 size={{ xs: 12, md: 6 }}>
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

      {/* Edit Submission Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Edit Submission</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Editing submission for: <strong>{editingSubmission?.id}</strong>
          </Typography>
          <TextField
            label="Nickname"
            fullWidth
            margin="normal"
            value={editedNickname}
            onChange={(e) => setEditedNickname(e.target.value)}
            disabled
          />
          <TextField
            label="Action/Sci-Fi/Fantasy"
            fullWidth
            margin="normal"
            value={editedMovies.action}
            onChange={(e) =>
              setEditedMovies({ ...editedMovies, action: e.target.value })
            }
          />
          <TextField
            label="Drama/Documentary"
            fullWidth
            margin="normal"
            value={editedMovies.drama}
            onChange={(e) =>
              setEditedMovies({ ...editedMovies, drama: e.target.value })
            }
          />
          <TextField
            label="Comedy/Musical"
            fullWidth
            margin="normal"
            value={editedMovies.comedy}
            onChange={(e) =>
              setEditedMovies({ ...editedMovies, comedy: e.target.value })
            }
          />
          <TextField
            label="Thriller/Horror"
            fullWidth
            margin="normal"
            value={editedMovies.thriller}
            onChange={(e) =>
              setEditedMovies({ ...editedMovies, thriller: e.target.value })
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveEdit} variant="contained" color="primary">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MovieClubAdmin;
