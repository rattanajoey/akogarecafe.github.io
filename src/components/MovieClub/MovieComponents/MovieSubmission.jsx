import { useState } from "react";
import { db } from "../../../config/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { Box, TextField, Button, Typography } from "@mui/material";
import MovieSearchAutocomplete from "./MovieSearchAutocomplete";

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
      // Submissions go to holding pool, not directly to current month
      const userRef = doc(db, "HoldingPool", nickname);
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
      <MovieSearchAutocomplete
        label="Action/Sci-Fi/Fantasy"
        value={movies.action}
        onChange={(value) => setMovies({ ...movies, action: value })}
        genre="action"
      />
      <MovieSearchAutocomplete
        label="Drama/Documentary"
        value={movies.drama}
        onChange={(value) => setMovies({ ...movies, drama: value })}
        genre="drama"
      />
      <MovieSearchAutocomplete
        label="Comedy/Musical"
        value={movies.comedy}
        onChange={(value) => setMovies({ ...movies, comedy: value })}
        genre="comedy"
      />
      <MovieSearchAutocomplete
        label="Thriller/Horror"
        value={movies.thriller}
        onChange={(value) => setMovies({ ...movies, thriller: value })}
        genre="thriller"
      />

      <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
        <Button
          variant="contained"
          sx={{
            backgroundColor: "#4d695d",
            minWidth: { xs: "100%", sm: "auto" },
            px: { xs: 2, sm: 4 },
          }}
          onClick={handleSubmit}
        >
          Submit
        </Button>
      </Box>
    </Box>
  );
};

export default MovieSubmission;
