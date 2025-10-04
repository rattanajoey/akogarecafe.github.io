import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Divider,
} from "@mui/material";
import { collection, getDocs, setDoc, doc, getDoc } from "firebase/firestore";
import { db } from "../../../config/firebase";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import PersonIcon from "@mui/icons-material/Person";
import LockIcon from "@mui/icons-material/Lock";

const OSCAR_PASSWORD = "oscar2025"; // You can change this

const OscarVotingModal = ({ open, onClose }) => {
  const [step, setStep] = useState(1); // 1: Password, 2: Name, 3: Voting, 4: Success
  const [password, setPassword] = useState("");
  const [voterName, setVoterName] = useState("");
  const [categories, setCategories] = useState([]);
  const [votes, setVotes] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Fetch categories and movies when modal opens
  useEffect(() => {
    if (open && step >= 3) {
      fetchCategories();
    }
  }, [open, step]);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const categoriesRef = collection(db, "OscarCategories");
      const snapshot = await getDocs(categoriesRef);
      const categoriesData = [];

      snapshot.forEach((doc) => {
        categoriesData.push({
          id: doc.id,
          name: doc.data().name,
          movies: doc.data().movies || [],
        });
      });

      setCategories(categoriesData);
    } catch (error) {
      console.error("Error fetching categories:", error);
      setError("Failed to load voting categories");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = () => {
    if (password === OSCAR_PASSWORD) {
      setStep(2);
      setError("");
    } else {
      setError("Incorrect password");
    }
  };

  const handleNameSubmit = () => {
    if (voterName.trim()) {
      setStep(3);
      setError("");
    } else {
      setError("Please enter your name");
    }
  };

  const handleVoteChange = (categoryId, movie) => {
    setVotes((prev) => ({
      ...prev,
      [categoryId]: movie,
    }));
  };

  const handleSubmitVotes = async () => {
    setSubmitting(true);
    setError("");

    try {
      // Check if user has already voted for any category
      const votePromises = Object.keys(votes).map(async (categoryId) => {
        const voteRef = doc(db, "OscarVotes", `${voterName}_${categoryId}`);
        const voteSnap = await getDoc(voteRef);

        if (voteSnap.exists()) {
          // Update existing vote
          await setDoc(voteRef, {
            voterName,
            categoryId,
            movie: votes[categoryId],
            timestamp: new Date(),
            updated: true,
          });
        } else {
          // Create new vote
          await setDoc(voteRef, {
            voterName,
            categoryId,
            movie: votes[categoryId],
            timestamp: new Date(),
            updated: false,
          });
        }
      });

      await Promise.all(votePromises);

      setStep(4);
    } catch (error) {
      console.error("Error submitting votes:", error);
      setError("Failed to submit votes. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setPassword("");
    setVoterName("");
    setVotes({});
    setError("");
    onClose();
  };

  const renderPasswordStep = () => (
    <Box>
      <Box textAlign="center" mb={3}>
        <EmojiEventsIcon sx={{ fontSize: 60, color: "#FFD700", mb: 2 }} />
        <Typography variant="h4" fontWeight="bold" color="#bc252d">
          🏆 Oscar Voting
        </Typography>
        <Typography variant="body1" color="text.secondary" mt={1}>
          Enter the voting password to participate
        </Typography>
      </Box>

      <TextField
        fullWidth
        type="password"
        label="Voting Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        onKeyPress={(e) => e.key === "Enter" && handlePasswordSubmit()}
        sx={{ mb: 2 }}
        InputProps={{
          startAdornment: <LockIcon sx={{ mr: 1, color: "text.secondary" }} />,
        }}
      />

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
    </Box>
  );

  const renderNameStep = () => (
    <Box>
      <Box textAlign="center" mb={3}>
        <PersonIcon sx={{ fontSize: 60, color: "#4ecdc4", mb: 2 }} />
        <Typography variant="h5" fontWeight="bold" color="#bc252d">
          Enter Your Name
        </Typography>
        <Typography variant="body2" color="text.secondary" mt={1}>
          Your votes will be tracked by this name
        </Typography>
        <Typography
          variant="body2"
          color="warning.main"
          mt={1}
          sx={{ fontWeight: "bold" }}
        >
          ⚠️ Use the same name if you want to update your votes later!
        </Typography>
      </Box>

      <TextField
        fullWidth
        label="Your Name"
        value={voterName}
        onChange={(e) => setVoterName(e.target.value)}
        onKeyPress={(e) => e.key === "Enter" && handleNameSubmit()}
        sx={{ mb: 2 }}
        placeholder="Enter your full name"
      />

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
    </Box>
  );

  const renderVotingStep = () => (
    <Box>
      <Box textAlign="center" mb={3}>
        <EmojiEventsIcon sx={{ fontSize: 50, color: "#FFD700", mb: 1 }} />
        <Typography variant="h5" fontWeight="bold" color="#bc252d">
          Cast Your Votes
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Vote for your favorites in each category
        </Typography>
      </Box>

      {loading ? (
        <Box textAlign="center" py={4}>
          <CircularProgress />
          <Typography mt={2}>Loading categories...</Typography>
        </Box>
      ) : (
        <Box>
          {categories.map((category) => (
            <Card
              key={category.id}
              sx={{
                mb: 3,
                backgroundColor: "rgba(255, 255, 255, 0.9)",
                border: "2px solid #4ecdc4",
                boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
              }}
            >
              <CardContent>
                <Typography
                  variant="h6"
                  fontWeight="bold"
                  gutterBottom
                  sx={{ color: "#bc252d" }}
                >
                  {category.name}
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <FormControl fullWidth>
                  <InputLabel>Select your choice</InputLabel>
                  <Select
                    value={votes[category.id] || ""}
                    onChange={(e) =>
                      handleVoteChange(category.id, e.target.value)
                    }
                    label="Select your choice"
                  >
                    {category.movies.map((movie) => (
                      <MenuItem key={movie} value={movie}>
                        {movie}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </CardContent>
            </Card>
          ))}

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
        </Box>
      )}
    </Box>
  );

  const renderSuccessStep = () => (
    <Box textAlign="center">
      <EmojiEventsIcon sx={{ fontSize: 80, color: "#4CAF50", mb: 2 }} />
      <Typography variant="h5" fontWeight="bold" color="#4CAF50" gutterBottom>
        🎉 Votes Submitted!
      </Typography>
      <Typography variant="body1" color="text.secondary" mb={3}>
        Thank you for participating in the Oscar voting!
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Results will be announced later. You can update your votes anytime by
        voting again.
      </Typography>
    </Box>
  );

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            background: "linear-gradient(to bottom, #d2d2cb, #4d695d)",
            border: "3px solid #bc252d",
            borderRadius: 3,
            boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
          },
        },
      }}
    >
      <DialogTitle
        sx={{
          textAlign: "center",
          color: "#bc252d",
          fontSize: "1.8rem",
          fontWeight: "bold",
          borderBottom: "2px solid #bc252d",
          pb: 2,
          backgroundColor: "rgba(255, 255, 255, 0.9)",
        }}
      >
        {step === 1 && "🔐 Access Required"}
        {step === 2 && "👤 Voter Registration"}
        {step === 3 && "🗳️ Cast Your Votes"}
        {step === 4 && "✅ Success"}
      </DialogTitle>

      <DialogContent
        sx={{
          p: 4,
          backgroundColor: "rgba(255, 255, 255, 0.95)",
          color: "#333",
        }}
      >
        {step === 1 && renderPasswordStep()}
        {step === 2 && renderNameStep()}
        {step === 3 && renderVotingStep()}
        {step === 4 && renderSuccessStep()}
      </DialogContent>

      <DialogActions
        sx={{
          p: 3,
          justifyContent: "center",
          backgroundColor: "rgba(255, 255, 255, 0.9)",
        }}
      >
        {step === 1 && (
          <Button
            variant="contained"
            onClick={handlePasswordSubmit}
            sx={{ backgroundColor: "#bc252d", color: "#fff" }}
          >
            Continue
          </Button>
        )}

        {step === 2 && (
          <Button
            variant="contained"
            onClick={handleNameSubmit}
            sx={{ backgroundColor: "#4ecdc4", color: "#fff" }}
          >
            Continue
          </Button>
        )}

        {step === 3 && (
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              variant="outlined"
              onClick={handleClose}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleSubmitVotes}
              disabled={submitting || Object.keys(votes).length === 0}
              sx={{ backgroundColor: "#bc252d", color: "#fff" }}
            >
              {submitting ? <CircularProgress size={20} /> : "Submit Votes"}
            </Button>
          </Box>
        )}

        {step === 4 && (
          <Button
            variant="contained"
            onClick={handleClose}
            sx={{ backgroundColor: "#4ecdc4", color: "#fff" }}
          >
            Close
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default OscarVotingModal;
