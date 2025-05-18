import React, { useState } from "react";
import {
  Box,
  Typography,
  Grid2,
  Card,
  CardMedia,
  CardContent,
  Button,
  Menu,
  MenuItem,
} from "@mui/material";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";

const SelectedMoviesDisplay = ({ selections = {} }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [selectedScreening, setSelectedScreening] = useState(null);

  const genres = ["action", "drama", "comedy", "thriller"];

  const screeningTimes = {
    "The Way He Looks (2014)": [
      { date: "May 18 (Sun)", time: "2 PM", duration: "96 min" },
    ],
    "Scary Movie 4": [
      { date: "May 21 (Wed)", time: "8 PM", duration: "83 min" },
    ],
    "Life is beautiful": [
      { date: "May 24 (Sat)", time: "2 PM", duration: "116 min" },
    ],
    "Ran (1985)": [{ date: "May 25 (Sun)", time: "2 PM", duration: "162 min" }],
  };

  const handleMenuClick = (event, movie, screening) => {
    setAnchorEl(event.currentTarget);
    setSelectedMovie(movie);
    setSelectedScreening(screening);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const createGoogleCalendarLink = (movieTitle, screening) => {
    try {
      // Parse the date string (e.g., "May 18 (Sun)" -> "May 18")
      const dateStr = screening.date.split("(")[0].trim();
      const [month, day] = dateStr.split(" ");
      const year = new Date().getFullYear();

      // Parse the time string (e.g., "6 PM" -> {hour: 6, period: "PM"})
      const [hour, period] = screening.time.split(" ");
      let hour24 = parseInt(hour);
      if (period === "PM" && hour24 !== 12) hour24 += 12;
      if (period === "AM" && hour24 === 12) hour24 = 0;

      // Create a valid date string that works across all browsers
      const dateString = `${year}-${getMonthNumber(month)}-${day.padStart(
        2,
        "0"
      )}T${hour24.toString().padStart(2, "0")}:00:00`;
      const startDate = new Date(dateString);
      const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000);

      // Format dates for Google Calendar
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
    } catch (error) {
      console.error("Error creating calendar link:", error);
      return "#";
    }
  };

  const createIOSCalendarLink = (movieTitle, screening) => {
    try {
      const dateStr = screening.date.split("(")[0].trim();
      const [month, day] = dateStr.split(" ");
      const year = new Date().getFullYear();

      const [hour, period] = screening.time.split(" ");
      let hour24 = parseInt(hour);
      if (period === "PM" && hour24 !== 12) hour24 += 12;
      if (period === "AM" && hour24 === 12) hour24 = 0;

      const dateString = `${year}-${getMonthNumber(month)}-${day.padStart(
        2,
        "0"
      )}T${hour24.toString().padStart(2, "0")}:00:00`;
      const startDate = new Date(dateString);
      const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000);

      // Format dates for ICS file
      const formatDate = (date) => {
        return date.toISOString().replace(/-|:|\.\d+/g, "");
      };

      const icsContent = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "BEGIN:VEVENT",
        `SUMMARY:Movie Screening: ${movieTitle}`,
        `DESCRIPTION:Join us for a screening of ${movieTitle} (${screening.duration})`,
        `LOCATION:Yiqing's Place`,
        `DTSTART:${formatDate(startDate)}`,
        `DTEND:${formatDate(endDate)}`,
        "END:VEVENT",
        "END:VCALENDAR",
      ].join("\n");

      // Create a data URL for the ICS content
      const dataUrl = `data:text/calendar;charset=utf-8,${encodeURIComponent(
        icsContent
      )}`;

      // Check if the user is on iOS
      const isIOS =
        /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

      if (isIOS) {
        // For iOS devices, we'll use the data URL directly
        return dataUrl;
      } else {
        // For non-iOS devices (like Chrome on Android), we'll show a message
        alert(
          "For the best experience, please use Safari on iOS devices to add this event to your calendar. Alternatively, you can use the Google Calendar option."
        );
        return "#";
      }
    } catch (error) {
      console.error("Error creating iOS calendar link:", error);
      return "#";
    }
  };

  // Helper function to convert month name to number
  const getMonthNumber = (monthName) => {
    const months = {
      January: "01",
      February: "02",
      March: "03",
      April: "04",
      May: "05",
      June: "06",
      July: "07",
      August: "08",
      September: "09",
      October: "10",
      November: "11",
      December: "12",
    };
    return months[monthName] || "01";
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
                            endIcon={<ArrowDropDownIcon />}
                            onClick={(e) =>
                              handleMenuClick(e, movie, screening)
                            }
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
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem
          onClick={() => {
            window.open(
              createGoogleCalendarLink(selectedMovie?.title, selectedScreening),
              "_blank"
            );
            handleMenuClose();
          }}
        >
          Google Calendar
        </MenuItem>
        <MenuItem
          onClick={() => {
            const link = createIOSCalendarLink(
              selectedMovie?.title,
              selectedScreening
            );
            if (link !== "#") {
              window.location.href = link;
            }
            handleMenuClose();
          }}
        >
          iOS Calendar
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default SelectedMoviesDisplay;
