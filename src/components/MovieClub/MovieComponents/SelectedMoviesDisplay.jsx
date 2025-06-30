import React, { useState, useEffect, useMemo } from "react";
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
  Link,
  Rating,
  useMediaQuery,
} from "@mui/material";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { db } from "../../../config/firebase";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import {
  searchMovie,
  getMovieDetails,
  getMoviePosterUrl,
  getTrailerUrl,
} from "../../../utils/tmdb";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import { getLanguageName } from "../../utils";

const SelectedMoviesDisplay = ({ selections = {}, onMonthChange }) => {
  const [selectedMonth, setSelectedMonth] = useState("");
  const [monthSelections, setMonthSelections] = useState(selections);
  const [availableMonths, setAvailableMonths] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [movieDetails, setMovieDetails] = useState({});
  const isMobile = useMediaQuery("(max-width:600px)");

  const genres = useMemo(() => ["action", "drama", "comedy", "thriller"], []);

  // Fetch available months from Firestore
  useEffect(() => {
    const fetchAvailableMonths = async () => {
      try {
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

        // Set the initial selected month to the most recent one
        if (months.length > 0) {
          setSelectedMonth(months[0].value);
        }
      } catch (error) {
        console.error("Error fetching months:", error);
      }
    };

    fetchAvailableMonths();
  }, []);

  // Fetch selections and TMDB data when month changes
  useEffect(() => {
    const fetchSelections = async () => {
      if (!selectedMonth) return;

      setIsLoading(true);
      try {
        const selectionsRef = doc(db, "MonthlySelections", selectedMonth);
        const selectionsSnap = await getDoc(selectionsRef);
        if (selectionsSnap.exists()) {
          const data = selectionsSnap.data();
          setMonthSelections(data);

          // Fetch TMDB data for each movie
          const details = {};
          for (const genre of genres) {
            const movie = data[genre];
            if (movie) {
              const searchResult = await searchMovie(movie.title);
              if (searchResult) {
                const movieData = await getMovieDetails(searchResult.id);
                details[genre] = movieData;
              }
            }
          }
          setMovieDetails(details);
        } else {
          setMonthSelections({});
          setMovieDetails({});
        }
      } catch (error) {
        console.error("Error fetching selections:", error);
        setMonthSelections({});
        setMovieDetails({});
      } finally {
        setTimeout(() => {
          setIsLoading(false);
        }, 300);
      }
    };

    fetchSelections();
  }, [selectedMonth, genres]);

  const handleMonthChange = (event) => {
    const newMonth = event.target.value;
    setSelectedMonth(newMonth);
    if (onMonthChange) {
      onMonthChange(newMonth);
    }
  };

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
          onChange={handleMonthChange}
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
                const tmdbData = movieDetails[genre];
                if (!movie) return null;

                const posterUrl = tmdbData?.poster_path
                  ? getMoviePosterUrl(tmdbData.poster_path)
                  : movie.posterUrl || "/placeholder.jpg";

                const trailerUrl = tmdbData ? getTrailerUrl(tmdbData) : null;

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
                            return (
                              <Box>
                                <Typography
                                  variant="h4"
                                  component="span"
                                  sx={{ fontWeight: "bold" }}
                                >
                                  Action
                                </Typography>
                                <Typography
                                  variant="subtitle1"
                                  color="text.secondary"
                                  sx={{ mt: 0.5 }}
                                >
                                  Adventure • Sci-Fi • Fantasy
                                </Typography>
                              </Box>
                            );
                          case "drama":
                            return (
                              <Box>
                                <Typography
                                  variant="h4"
                                  component="span"
                                  sx={{ fontWeight: "bold" }}
                                >
                                  Drama
                                </Typography>
                                <Typography
                                  variant="subtitle1"
                                  color="text.secondary"
                                  sx={{ mt: 0.5 }}
                                >
                                  Documentary • Biopic • Historical
                                </Typography>
                              </Box>
                            );
                          case "comedy":
                            return (
                              <Box>
                                <Typography
                                  variant="h4"
                                  component="span"
                                  sx={{ fontWeight: "bold" }}
                                >
                                  Comedy
                                </Typography>
                                <Typography
                                  variant="subtitle1"
                                  color="text.secondary"
                                  sx={{ mt: 0.5 }}
                                >
                                  Romance • Musical
                                </Typography>
                              </Box>
                            );
                          case "thriller":
                            return (
                              <Box>
                                <Typography
                                  variant="h4"
                                  component="span"
                                  sx={{ fontWeight: "bold" }}
                                >
                                  Thriller
                                </Typography>
                                <Typography
                                  variant="subtitle1"
                                  color="text.secondary"
                                  sx={{ mt: 0.5 }}
                                >
                                  Horror • Mystery • Crime
                                </Typography>
                              </Box>
                            );
                          default:
                            return (
                              genre.charAt(0).toUpperCase() + genre.slice(1)
                            );
                        }
                      })()}
                    </Typography>
                    <Card sx={{ backgroundColor: "rgba(255, 255, 255, 0.9)" }}>
                      <Box sx={{ position: "relative" }}>
                        <CardMedia
                          component="img"
                          width="100%"
                          image={posterUrl}
                          alt={movie.title}
                        />
                        {/* Add indicator when overlay is hidden */}
                        {!movieDetails[genre]?.showOverlay && isMobile && (
                          <Box
                            sx={{
                              position: "absolute",
                              bottom: 0,
                              left: 0,
                              right: 0,
                              backgroundColor: "rgba(0, 0, 0, 0.7)",
                              color: "white",
                              p: 1,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: 1,
                              fontSize: "0.875rem",
                            }}
                          >
                            <KeyboardArrowUpIcon fontSize="small" />
                            Tap for details
                          </Box>
                        )}
                        <Box
                          sx={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: "rgba(0, 0, 0, 0.85)",
                            display: "flex",
                            flexDirection: "column",
                            opacity: movieDetails[genre]?.showOverlay ? 1 : 0,
                            transition: "opacity 0.3s ease",
                            cursor: "pointer",
                            p: 2,
                            pt: 4,
                            overflow: "auto",
                          }}
                          onClick={() => {
                            setMovieDetails((prev) => ({
                              ...prev,
                              [genre]: {
                                ...prev[genre],
                                showOverlay: !prev[genre]?.showOverlay,
                              },
                            }));
                          }}
                          onMouseEnter={() => {
                            setMovieDetails((prev) => ({
                              ...prev,
                              [genre]: {
                                ...prev[genre],
                                showOverlay: true,
                              },
                            }));
                          }}
                          onMouseLeave={() => {
                            setMovieDetails((prev) => ({
                              ...prev,
                              [genre]: {
                                ...prev[genre],
                                showOverlay: false,
                              },
                            }));
                          }}
                        >
                          {tmdbData && (
                            <>
                              {tmdbData.original_title !== tmdbData.title && (
                                <Typography
                                  variant="subtitle1"
                                  color="white"
                                  gutterBottom
                                >
                                  Original Title: {tmdbData.original_title}
                                </Typography>
                              )}

                              <Typography
                                variant="body2"
                                color="white"
                                paragraph
                              >
                                {tmdbData.overview}
                              </Typography>

                              <Box sx={{ mt: 1 }}>
                                <Typography variant="body2" color="white">
                                  Language:{" "}
                                  {getLanguageName(tmdbData.original_language)}
                                </Typography>
                                <Typography variant="body2" color="white">
                                  Runtime: {tmdbData.runtime} minutes
                                </Typography>
                                <Typography variant="body2" color="white">
                                  Release Date: {tmdbData.release_date}
                                </Typography>

                                {tmdbData.budget > 0 && (
                                  <Typography variant="body2" color="white">
                                    Budget: ${tmdbData.budget.toLocaleString()}
                                  </Typography>
                                )}

                                {tmdbData.revenue > 0 && (
                                  <Typography variant="body2" color="white">
                                    Revenue: $
                                    {tmdbData.revenue.toLocaleString()}
                                  </Typography>
                                )}

                                {tmdbData.budget > 0 &&
                                  tmdbData.revenue > 0 && (
                                    <Typography
                                      variant="body2"
                                      color={
                                        tmdbData.revenue > tmdbData.budget
                                          ? "#4caf50"
                                          : "#f44336"
                                      }
                                      sx={{ mt: 1 }}
                                    >
                                      {tmdbData.revenue > tmdbData.budget
                                        ? "✓"
                                        : "✗"}
                                      $
                                      {Math.abs(
                                        tmdbData.revenue - tmdbData.budget
                                      ).toLocaleString()}{" "}
                                      (
                                      {(
                                        ((tmdbData.revenue - tmdbData.budget) /
                                          tmdbData.budget) *
                                        100
                                      ).toFixed(1)}
                                      %{" "}
                                      {tmdbData.revenue > tmdbData.budget
                                        ? "return"
                                        : "loss"}
                                      )
                                    </Typography>
                                  )}

                                {tmdbData.production_companies?.length > 0 && (
                                  <Box sx={{ mt: 2 }}>
                                    <Typography
                                      variant="body2"
                                      color="white"
                                      gutterBottom
                                    >
                                      Production Companies:
                                    </Typography>
                                    {tmdbData.production_companies
                                      .slice(0, 3)
                                      .map((company, index) => (
                                        <Typography
                                          key={index}
                                          variant="body2"
                                          color="white"
                                        >
                                          • {company.name}
                                        </Typography>
                                      ))}
                                    {tmdbData.production_companies.length >
                                      3 && (
                                      <Typography variant="body2" color="white">
                                        • & others
                                      </Typography>
                                    )}
                                  </Box>
                                )}
                              </Box>
                            </>
                          )}
                        </Box>
                      </Box>
                      <CardContent>
                        <Typography
                          variant="h6"
                          component="div"
                          whiteSpace={"nowrap"}
                        >
                          {movie.title}
                        </Typography>
                        {tmdbData &&
                        typeof tmdbData.vote_average === "number" ? (
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: 1,
                              my: 1,
                            }}
                          >
                            <Rating
                              value={tmdbData.vote_average / 2}
                              precision={0.5}
                              readOnly
                              size="small"
                            />
                            <Typography variant="body2" color="text.secondary">
                              ({tmdbData.vote_average.toFixed(1)})
                            </Typography>
                          </Box>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            (No rating)
                          </Typography>
                        )}
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
                        {trailerUrl && (
                          <Link
                            href={trailerUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 0.5,
                              mt: 1,
                              color: "#bc252d",
                              "&:hover": {
                                color: "#8c1c22",
                              },
                            }}
                          >
                            <PlayCircleOutlineIcon fontSize="small" />
                            Watch Trailer
                          </Link>
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
