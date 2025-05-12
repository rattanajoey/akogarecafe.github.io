import React from "react";
import {
  Box,
  Typography,
  Grid2,
  Card,
  CardMedia,
  CardContent,
} from "@mui/material";

const SelectedMoviesDisplay = ({ selections = {} }) => {
  const genres = ["action", "drama", "comedy", "thriller"];

  return (
    <Box sx={{ width: "90%", mb: 5, mt: 5 }}>
      <Typography variant="h4" sx={{ mb: 2 }}>
        {(() => {
          const now = new Date();
          const month = now.toLocaleString("default", { month: "long" });
          const year = now.getFullYear();
          return `${month} ${year}`;
        })()}
      </Typography>
      <Grid2 container spacing={4}>
        {genres.map((genre) => {
          const movie = selections[genre];
          if (!movie) return null;

          return (
            <Grid2
              size={{ xs: 12, sm: 6, md: 3 }}
              key={genre}
              display={"flex"}
              flexDirection={"column"}
              justifyContent={"space-between"}
            >
              <Typography variant="h4" sx={{ mb: 1 }}>
                {(() => {
                  switch (genre) {
                    case "action":
                      return "Action / Sci-Fi / Fantasy";
                    case "drama":
                      return "Drama / Documentary";
                    case "comedy":
                      return "Comedy / Musical";
                    case "thriller":
                      return "Thriller / Horror";
                    default:
                      return genre.charAt(0).toUpperCase() + genre.slice(1);
                  }
                })()}
              </Typography>
              <Card sx={{ backgroundColor: "rgba(255, 255, 255, 0.9)" }}>
                <CardMedia
                  component="img"
                  width="100%"
                  image={movie.posterUrl || "/placeholder.jpg"}
                  alt={movie.title}
                />
                <CardContent>
                  <Typography
                    variant="h6"
                    component="div"
                    whiteSpace={"nowrap"}
                  >
                    {movie.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Submitted by: {movie.submittedBy}
                  </Typography>
                  {movie.director && (
                    <Typography variant="body2" color="text.secondary">
                      Director: {movie.director}
                    </Typography>
                  )}
                  {movie.year && (
                    <Typography variant="body2" color="text.secondary">
                      Year: {movie.year}
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

export default SelectedMoviesDisplay;
