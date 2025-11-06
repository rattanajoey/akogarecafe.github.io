import React, { useEffect, useState } from "react";
import { Box, Typography, Grid2, Card, CardContent } from "@mui/material";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../../../config/firebase";

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

  // Transform holding pool data into genre-based structure
  const genrePools = {
    action: [],
    drama: [],
    comedy: [],
    thriller: [],
  };

  holdingPool.forEach((submission) => {
    genres.forEach((genre) => {
      const movie = submission[genre]?.trim();
      if (movie) {
        genrePools[genre].push({
          title: movie,
          submittedBy: submission.id,
        });
      }
    });
  });

  return (
    <Box sx={{ width: "90%", mb: 20, mt: 5, mx: "auto" }}>
      <Typography variant="h4" sx={{ mb: 2 }}>
        📋 Holding Submissions
      </Typography>
      <Grid2 container spacing={4}>
        {genres.map((genre) => {
          const list = genrePools[genre] || [];
          return (
            <Grid2 size={{ xs: 12, sm: 6, md: 3 }} key={genre}>
              <Card sx={{ backgroundColor: "rgba(255,255,255,0.9)" }}>
                <CardContent>
                  <Typography
                    variant="h6"
                    gutterBottom
                    textTransform="capitalize"
                  >
                    {genre}
                  </Typography>
                  {list.length > 0 ? (
                    list.map((m, i) => (
                      <Typography key={i} variant="body2">
                        • {m.title} — {m.submittedBy}
                      </Typography>
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No movies in this genre.
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid2>
          );
        })}
      </Grid2>
    </Box>
  );
};

export default HoldingPool;
