import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Grid2,
  Card,
  CardMedia,
  CardContent,
  Select,
  MenuItem,
  Fade,
  CircularProgress,
} from "@mui/material";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { db } from "../../../config/firebase";
import { getCurrentMonth } from "../../utils";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

const SelectedMoviesDisplay = ({ selections = {} }) => {
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const [monthSelections, setMonthSelections] = useState(selections);
  const [availableMonths, setAvailableMonths] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const genres = ["action", "drama", "comedy", "thriller"];

  // Fetch available months from Firestore
  useEffect(() => {
    const fetchAvailableMonths = async () => {
      const selectionsRef = collection(db, "MonthlySelections");
      const snapshot = await getDocs(selectionsRef);
      const months = snapshot.docs.map((doc) => {
        const [year, month] = doc.id.split("-");
        // Create date with month-1 because JavaScript months are 0-based
        const date = new Date(parseInt(year), parseInt(month) - 1, 1);
        return {
          value: doc.id,
          label: date.toLocaleString("default", {
            month: "long",
            year: "numeric",
          }),
        };
      });
      // Sort months in descending order (newest first)
      months.sort((a, b) => b.value.localeCompare(a.value));
      setAvailableMonths(months);

      // If current month isn't in the list, select the most recent month
      if (months.length > 0 && !months.find((m) => m.value === selectedMonth)) {
        setSelectedMonth(months[0].value);
      }
    };

    fetchAvailableMonths();
  }, [selectedMonth]);

  // Fetch selections when month changes
  useEffect(() => {
    const fetchSelections = async () => {
      setIsLoading(true);
      try {
        const selectionsRef = doc(db, "MonthlySelections", selectedMonth);
        const selectionsSnap = await getDoc(selectionsRef);
        if (selectionsSnap.exists()) {
          setMonthSelections(selectionsSnap.data());
        } else {
          setMonthSelections({});
        }
      } finally {
        // Add a small delay to make the loading state visible
        setTimeout(() => {
          setIsLoading(false);
        }, 300);
      }
    };

    fetchSelections();
  }, [selectedMonth]);

  return (
    <Box sx={{ width: "90%", mb: 5, mt: 5, mx: "auto" }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mb: 4,
          gap: 1,
        }}
      >
        <Select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          IconComponent={KeyboardArrowDownIcon}
          sx={{
            "& .MuiSelect-select": {
              typography: "h4",
              color: "#2c2c2c",
              fontWeight: 500,
              pr: 6,
              display: "flex",
              alignItems: "center",
            },
            "& .MuiOutlinedInput-notchedOutline": {
              border: "none",
            },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              border: "none",
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              border: "none",
            },
            "& .MuiSvgIcon-root": {
              color: "#bc252d",
              fontSize: "2rem",
              position: "absolute",
              right: 0,
              top: "50%",
              transform: "translateY(-50%)",
            },
          }}
        >
          {availableMonths.map((option) => (
            <MenuItem
              key={option.value}
              value={option.value}
              sx={{
                typography: "h4",
                "&:hover": {
                  backgroundColor: "rgba(188, 37, 45, 0.1)",
                },
                "&.Mui-selected": {
                  backgroundColor: "rgba(188, 37, 45, 0.2)",
                  "&:hover": {
                    backgroundColor: "rgba(188, 37, 45, 0.3)",
                  },
                },
              }}
            >
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </Box>
      <Fade in={!isLoading} timeout={300}>
        <Box>
          {isLoading ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: "400px",
              }}
            >
              <CircularProgress
                sx={{
                  color: "#bc252d",
                  width: "60px !important",
                  height: "60px !important",
                }}
              />
            </Box>
          ) : (
            <Grid2 container spacing={4}>
              {genres.map((genre) => {
                const movie = monthSelections[genre];
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
                            return (
                              genre.charAt(0).toUpperCase() + genre.slice(1)
                            );
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
          )}
        </Box>
      </Fade>
    </Box>
  );
};

export default SelectedMoviesDisplay;
