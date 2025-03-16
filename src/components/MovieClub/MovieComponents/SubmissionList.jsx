import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../../../config/firebase";
import { Box, Typography, Card, CardContent } from "@mui/material";

const getCurrentMonth = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
};

const SubmissionList = () => {
  const [submissions, setSubmissions] = useState([]);

  useEffect(() => {
    const currentMonth = getCurrentMonth();
    const submissionsRef = collection(db, "Submissions", currentMonth, "users");

    const unsubscribe = onSnapshot(submissionsRef, (snapshot) => {
      setSubmissions(
        snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );
    });

    return () => unsubscribe();
  }, []);

  return (
    <Box
      sx={{
        padding: "2rem",
        backgroundColor: "rgba(255, 255, 255, 0.1)",
        borderRadius: "10px",
        maxWidth: "100%",
        overflow: "hidden",
      }}
    >
      <Typography
        variant="h4"
        fontWeight="bold"
        sx={{ mb: 2, color: "#bc252d" }}
      >
        Submissions for {getCurrentMonth()}
      </Typography>

      {/* Scrollable Box for Cards */}
      <Box
        sx={{
          display: "flex",
          overflowX: "auto",
          flexWrap: "nowrap",
          gap: "1rem",
          paddingBottom: "1rem",
          maxWidth: "100%",
          "&::-webkit-scrollbar": { height: "6px" },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "#bc252d",
            borderRadius: "10px",
          },
        }}
      >
        {submissions.length > 0 ? (
          submissions.map((s) => (
            <Card
              key={s.id}
              sx={{
                minWidth: "250px", // Fixed width for each card
                maxWidth: "280px",
                backgroundColor: "#4d695d",
                color: "white",
                borderRadius: "10px",
                boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
                flexShrink: 0, // Prevents shrinking inside scroll container
                overflow: "hidden",
                whiteSpace: "nowrap",
                textOverflow: "ellipsis",
              }}
            >
              <CardContent>
                <Typography
                  variant="h6"
                  fontWeight="bold"
                  sx={{ overflow: "hidden", textOverflow: "ellipsis" }}
                >
                  {s.id}
                </Typography>
                <Box sx={{ overflow: "hidden", textOverflow: "ellipsis" }}>
                  <Typography>🎬 {s.action || "No Action"}</Typography>
                  <Typography>🎭 {s.drama || "No Drama"}</Typography>
                  <Typography>😂 {s.comedy || "No Comedy"}</Typography>
                  <Typography>😱 {s.thriller || "No Thriller"}</Typography>
                </Box>
              </CardContent>
            </Card>
          ))
        ) : (
          <Typography>No submissions yet.</Typography>
        )}
      </Box>
    </Box>
  );
};

export default SubmissionList;
