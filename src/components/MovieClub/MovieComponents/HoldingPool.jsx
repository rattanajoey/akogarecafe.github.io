import React, { useEffect, useState } from "react";
import { Box, Typography, Card, CardContent } from "@mui/material";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../../../config/firebase";
import PersonIcon from "@mui/icons-material/Person";

const genres = ["action", "drama", "comedy", "thriller"];

const HoldingPool = () => {
  const [holdingPool, setHoldingPool] = useState([]);

  useEffect(() => {
    const holdingRef = collection(db, "HoldingPool");

    const unsubscribe = onSnapshot(holdingRef, (snapshot) => {
      const submissions = [];
      snapshot.forEach((doc) => {
        submissions.push({
          id: doc.id,
          ...doc.data(),
        });
      });
      setHoldingPool(submissions);
    });

    return () => unsubscribe();
  }, []);

  return (
    <Box sx={{ width: "90%", mb: 10, mt: 5, mx: "auto" }}>
      <Typography variant="h4" sx={{ mb: 2 }}>
        📋 Pending Submissions
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Your submissions are pending approval
      </Typography>

      {holdingPool.length > 0 ? (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {holdingPool.map((submission) => (
            <Card
              key={submission.id}
              sx={{ backgroundColor: "rgba(255,255,255,0.9)" }}
            >
              <CardContent>
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}
                >
                  <PersonIcon />
                  <Typography variant="h6" fontWeight="bold">
                    {submission.id}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  {genres.map((genre) => {
                    const movie = submission[genre]?.trim();
                    if (!movie) return null;
                    return (
                      <Box
                        key={genre}
                        sx={{ display: "flex", alignItems: "center", gap: 2 }}
                      >
                        <Typography
                          variant="subtitle2"
                          sx={{
                            minWidth: "120px",
                            textTransform: "capitalize",
                            fontWeight: "bold",
                          }}
                        >
                          {genre}:
                        </Typography>
                        <Typography variant="body2">{movie}</Typography>
                      </Box>
                    );
                  })}
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      ) : (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ textAlign: "center", py: 4 }}
        >
          No pending submissions
        </Typography>
      )}
    </Box>
  );
};

export default HoldingPool;
