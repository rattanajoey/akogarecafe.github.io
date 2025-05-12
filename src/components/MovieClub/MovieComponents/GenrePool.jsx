import React from "react";
import { Box, Typography, Grid2, Card, CardContent } from "@mui/material";

const genres = ["action", "drama", "comedy", "thriller"];

const GenrePool = ({ pools }) => {
  return (
    <Box sx={{ width: "90%", mb: 20, mt: 5 }}>
      <Typography variant="h4" sx={{ mb: 2 }}>
        🎬 Genre Pools
      </Typography>
      <Grid2 container spacing={4}>
        {genres.map((genre) => {
          const list = pools[genre] || [];
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

export default GenrePool;
