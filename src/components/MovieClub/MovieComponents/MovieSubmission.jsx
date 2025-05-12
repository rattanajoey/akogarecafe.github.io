import { useState } from "react";
import { db } from "../../../config/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { Box, TextField, Button, Typography } from "@mui/material";
import { getCurrentMonth } from "../../utils";

const VALID_ACCESS_CODE = "thunderbolts";

const MovieSubmission = () => {
  const [nickname, setNickname] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [movies, setMovies] = useState({
    action: "",
    drama: "",
    comedy: "",
    thriller: "",
  });
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async () => {
    setErrorMessage("");

    if (!nickname || !accessCode) {
      setErrorMessage("Nickname & Password are required!");
      return;
    }

    if (accessCode !== VALID_ACCESS_CODE) {
      setErrorMessage("Incorrect Password!");
      return;
    }

    try {
      const currentMonth = getCurrentMonth();
      const userRef = doc(db, "Submissions", currentMonth, "users", nickname);
      const userSnap = await getDoc(userRef);

      const message = userSnap.exists()
        ? "Submission updated!"
        : "Submission added!";

      await setDoc(
        userRef,
        {
          accesscode: accessCode,
          action: movies.action,
          drama: movies.drama,
          comedy: movies.comedy,
          thriller: movies.thriller,
          submittedAt: new Date(),
        },
        { merge: true }
      );

      alert(message);
    } catch (error) {
      setErrorMessage(
        "🔥 Firestore Error: Failed to submit. Please try again."
      );
      console.error("🔥 Firestore Error:", error);
    }
  };
  return (
    <Box
      sx={{
        p: 4,
        backgroundColor: "rgba(131, 167, 157, 0.8)",
        borderRadius: "10px",
        maxWidth: "600px",
        mx: "auto",
      }}
    >
      <Typography variant="h4" fontWeight="bold" mb={2}>
        Submit Your Movie Picks
      </Typography>
      {errorMessage && <Typography color="error">{errorMessage}</Typography>}

      <TextField
        label="Nickname (Case Sensitive)"
        fullWidth
        variant="outlined"
        sx={{ mb: 2 }}
        value={nickname}
        onChange={(e) => setNickname(e.target.value)}
      />
      <TextField
        label="Password (Check your partiful invite)"
        fullWidth
        type="password"
        variant="outlined"
        sx={{ mb: 2 }}
        value={accessCode}
        onChange={(e) => setAccessCode(e.target.value)}
      />
      <TextField
        label="Action/Sci-Fi/Fantasy"
        fullWidth
        sx={{ mb: 2 }}
        value={movies.action}
        onChange={(e) => setMovies({ ...movies, action: e.target.value })}
      />
      <TextField
        label="Drama/Documentary"
        fullWidth
        sx={{ mb: 2 }}
        value={movies.drama}
        onChange={(e) => setMovies({ ...movies, drama: e.target.value })}
      />
      <TextField
        label="Comedy/Musical"
        fullWidth
        sx={{ mb: 2 }}
        value={movies.comedy}
        onChange={(e) => setMovies({ ...movies, comedy: e.target.value })}
      />
      <TextField
        label="Thriller/Horror"
        fullWidth
        sx={{ mb: 2 }}
        value={movies.thriller}
        onChange={(e) => setMovies({ ...movies, thriller: e.target.value })}
      />

      <Button
        fullWidth
        variant="contained"
        sx={{ backgroundColor: "#4d695d", mt: 2 }}
        onClick={handleSubmit}
      >
        Submit
      </Button>
    </Box>
  );
};

export default MovieSubmission;
