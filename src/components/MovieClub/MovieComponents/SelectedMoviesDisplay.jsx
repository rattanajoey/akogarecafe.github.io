import React from "react";
import {
  Box,
  Typography,
  Grid2,
  Card,
  CardMedia,
  CardContent,
  Button,
} from "@mui/material";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";

const SelectedMoviesDisplay = ({ selections = {} }) => {
  const genres = ["action", "drama", "comedy", "thriller"];

  const screeningTimes = {
    "The Way He Looks (2014)": [
      { date: "May 18 (Sun)", time: "6 PM", duration: "96 min" },
    ],
    "Scary Movie 4": [
      { date: "May 21 (Wed)", time: "8 PM", duration: "83 min" },
    ],
    "Life is beautiful": [
      { date: "May 24 (Sat)", time: "2 PM", duration: "116 min" },
    ],
    "Ran (1985)": [{ date: "May 25 (Sun)", time: "2 PM", duration: "162 min" }],
  };

  const createGoogleCalendarLink = (movieTitle, screening) => {
    const [date, time] = [screening.date, screening.time];
    const [month, day] = date.split(" ");
    const [hour, period] = time.split(" ");
    const year = new Date().getFullYear();

    // Convert to 24-hour format
    let hour24 = parseInt(hour);
    if (period === "PM" && hour24 !== 12) hour24 += 12;
    if (period === "AM" && hour24 === 12) hour24 = 0;

    // Create start and end times (assuming 2 hours duration)
    const startDate = new Date(`${year} ${month} ${day} ${hour24}:00`);
    const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000);

    const formatDate = (date) => {
      return date.toISOString().replace(/-|:|\.\d+/g, "");
    };

    const params = new URLSearchParams({
      action: "TEMPLATE",
      text: `Movie Screening: ${movieTitle}`,
      details: `Join us for a screening of ${movieTitle} (${screening.duration})`,
      location: "Yiqing's Place",
      dates: `${formatDate(startDate)}/${formatDate(endDate)}`,
    });

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  };

  return (
    <Box sx={{ width: "90%", mb: 5, mt: 5, mx: "auto" }}>
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
                  {screeningTimes[movie.title] && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" color="primary">
                        Screening Time:
                      </Typography>
                      {screeningTimes[movie.title].map((screening, index) => (
                        <Box
                          key={index}
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            mt: 1,
                          }}
                        >
                          <Typography variant="body2" color="text.secondary">
                            {screening.date} at {screening.time} (
                            {screening.duration})
                          </Typography>
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<CalendarMonthIcon />}
                            href={createGoogleCalendarLink(
                              movie.title,
                              screening
                            )}
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{ ml: 1, p: 1 }}
                          >
                            Add to Calendar
                          </Button>
                        </Box>
                      ))}
                    </Box>
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
