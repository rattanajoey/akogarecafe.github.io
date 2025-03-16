import { useState } from "react";
import { db } from "../../../config/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { Box, TextField, Button, Typography } from "@mui/material";

const getCurrentMonth = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
};

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
      setErrorMessage("Nickname & Access Code are required!");
      return;
    }

    try {
      console.log(`🔍 Checking Firestore for ApprovedUsers/${nickname}`);

      // 🔹 Step 1: Try to read from ApprovedUsers
      const approvedUserRef = doc(db, "ApprovedUsers", nickname);
      const approvedUserSnap = await getDoc(approvedUserRef);

      if (!approvedUserSnap.exists()) {
        setErrorMessage("🚫 Access Denied: You are not an approved user.");
        console.log("❌ User not found in ApprovedUsers collection");
        return;
      }

      const approvedUserData = approvedUserSnap.data();
      console.log("✅ User found:", approvedUserData);

      // 🔹 Step 2: Check if the access code matches
      if (approvedUserData.accesscode !== accessCode) {
        setErrorMessage("Incorrect Access Code!");
        console.log(
          `❌ Access code mismatch: Expected '${approvedUserData.accesscode}', got '${accessCode}'`
        );
        return;
      }

      console.log("✅ Access code verified. Proceeding with submission...");

      // 🔹 Step 3: Try writing to Submissions
      const currentMonth = getCurrentMonth();
      const userRef = doc(db, "Submissions", currentMonth, "users", nickname);

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

      console.log("✅ Submission saved successfully!");
      alert("Submission saved!");
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
        backgroundColor: "rgba(255,255,255,0.1)",
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
        label="Nickname"
        fullWidth
        variant="outlined"
        sx={{ mb: 2 }}
        value={nickname}
        onChange={(e) => setNickname(e.target.value)}
      />
      <TextField
        label="Access Code"
        fullWidth
        type="password"
        variant="outlined"
        sx={{ mb: 2 }}
        value={accessCode}
        onChange={(e) => setAccessCode(e.target.value)}
      />
      <TextField
        label="Action/Sci-Fi"
        fullWidth
        sx={{ mb: 2 }}
        value={movies.action}
        onChange={(e) => setMovies({ ...movies, action: e.target.value })}
      />
      <TextField
        label="Drama"
        fullWidth
        sx={{ mb: 2 }}
        value={movies.drama}
        onChange={(e) => setMovies({ ...movies, drama: e.target.value })}
      />
      <TextField
        label="Comedy"
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
