import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Typography,
  Card,
  CardMedia,
  CardContent,
  Grid2,
  Chip,
  Button,
  IconButton,
  Dialog,
  DialogContent,
  DialogTitle,
  CircularProgress,
  InputAdornment,
  Tabs,
  Tab,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import InfoIcon from "@mui/icons-material/Info";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import MovieIcon from "@mui/icons-material/Movie";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";
import {
  getMoviePosterUrl,
  getMovieDetails,
  getTrailerUrl,
} from "../../../utils/tmdb";

const TMDB_API_KEY =
  process.env.REACT_APP_TMDB_API_KEY || "576be59b6712fa18658df8a825ba434e";
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

const MovieDiscovery = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [movieDetails, setMovieDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [tabValue, setTabValue] = useState(0);

  // Load trending movies on mount
  useEffect(() => {
    loadTrendingMovies();
  }, []);

  const loadTrendingMovies = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${TMDB_BASE_URL}/trending/movie/week?api_key=${TMDB_API_KEY}`
      );
      const data = await response.json();
      if (data.results) {
        setMovies(data.results);
      }
    } catch (error) {
      console.error("Error loading trending movies:", error);
    }
    setLoading(false);
  };

  const loadPopularMovies = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&page=1`
      );
      const data = await response.json();
      if (data.results) {
        setMovies(data.results);
      }
    } catch (error) {
      console.error("Error loading popular movies:", error);
    }
    setLoading(false);
  };

  const searchMovies = async () => {
    if (searchQuery.length < 2) return;

    setLoading(true);
    try {
      const response = await fetch(
        `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(
          searchQuery
        )}&page=1`
      );
      const data = await response.json();
      if (data.results) {
        setMovies(data.results);
      }
    } catch (error) {
      console.error("Error searching movies:", error);
    }
    setLoading(false);
  };

  const handleMovieClick = async (movie) => {
    setSelectedMovie(movie);
    setDetailsLoading(true);
    const details = await getMovieDetails(movie.id);
    setMovieDetails(details);
    setDetailsLoading(false);
  };

  const handleCloseModal = () => {
    setSelectedMovie(null);
    setMovieDetails(null);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setSearchQuery("");
    if (newValue === 0) {
      loadTrendingMovies();
    } else if (newValue === 1) {
      loadPopularMovies();
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    searchMovies();
  };

  const trailerUrl = movieDetails?.videos
    ? getTrailerUrl(movieDetails.videos)
    : null;

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100%",
        background: "linear-gradient(to bottom, #d2d2cb, #4d695d)",
        py: 4,
        px: { xs: 2, md: 4 },
      }}
    >
      <Box sx={{ maxWidth: "1400px", mx: "auto" }}>
        {/* Back Button */}
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/MovieClub")}
          sx={{
            mb: 2,
            color: "#bc252d",
            fontWeight: "bold",
            "&:hover": {
              backgroundColor: "rgba(188, 37, 45, 0.1)",
            },
          }}
        >
          Back to Movie Club
        </Button>

        <Typography
          variant="h2"
          sx={{
            fontWeight: "bold",
            fontFamily: "'Merriweather', serif",
            textShadow: "2px 2px 6px rgba(0,0,0,0.5)",
            color: "#bc252d",
            textAlign: "center",
            mb: 4,
          }}
        >
          🎬 Movie Discovery
        </Typography>

        {/* Tabs */}
        <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            sx={{
              backgroundColor: "rgba(131, 167, 157, 0.8)",
              borderRadius: "10px",
              "& .MuiTab-root": {
                color: "#4d695d",
                fontWeight: "bold",
              },
              "& .Mui-selected": {
                color: "#bc252d !important",
              },
            }}
          >
            <Tab icon={<TrendingUpIcon />} label="Trending" />
            <Tab icon={<MovieIcon />} label="Popular" />
            <Tab icon={<SearchIcon />} label="Search" />
          </Tabs>
        </Box>

        {/* Search Bar */}
        {tabValue === 2 && (
          <Box
            component="form"
            onSubmit={handleSearchSubmit}
            sx={{
              mb: 4,
              display: "flex",
              justifyContent: "center",
              gap: 2,
            }}
          >
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search for movies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{
                maxWidth: "600px",
                backgroundColor: "rgba(255, 255, 255, 0.9)",
                borderRadius: "8px",
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
            <Button
              type="submit"
              variant="contained"
              size="large"
              sx={{
                backgroundColor: "#bc252d",
                "&:hover": { backgroundColor: "#9a1f25" },
              }}
            >
              Search
            </Button>
          </Box>
        )}

        {/* Loading State */}
        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress sx={{ color: "#bc252d" }} />
          </Box>
        )}

        {/* Movies Grid */}
        {!loading && (
          <Grid2 container spacing={3}>
            {movies.map((movie) => (
              <Grid2 size={{ xs: 6, sm: 4, md: 3, lg: 2.4 }} key={movie.id}>
                <Card
                  sx={{
                    height: "100%",
                    cursor: "pointer",
                    transition: "transform 0.3s, box-shadow 0.3s",
                    "&:hover": {
                      transform: "scale(1.05)",
                      boxShadow: "0 8px 16px rgba(0,0,0,0.3)",
                    },
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                  }}
                  onClick={() => handleMovieClick(movie)}
                >
                  <CardMedia
                    component="img"
                    image={
                      movie.poster_path
                        ? getMoviePosterUrl(movie.poster_path)
                        : "/movie/maomao.png"
                    }
                    alt={movie.title}
                    sx={{
                      height: { xs: "250px", sm: "300px" },
                      objectFit: "cover",
                    }}
                  />
                  <CardContent>
                    <Typography
                      variant="subtitle1"
                      fontWeight="bold"
                      sx={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        minHeight: "3em",
                      }}
                    >
                      {movie.title}
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mt: 1,
                      }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        {movie.release_date
                          ? new Date(movie.release_date).getFullYear()
                          : "N/A"}
                      </Typography>
                      <Chip
                        label={`⭐ ${movie.vote_average.toFixed(1)}`}
                        size="small"
                        sx={{
                          backgroundColor: "#FFD700",
                          color: "#000",
                          fontWeight: "bold",
                        }}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid2>
            ))}
          </Grid2>
        )}

        {/* No Results */}
        {!loading && movies.length === 0 && (
          <Box sx={{ textAlign: "center", py: 8 }}>
            <Typography variant="h5" color="text.secondary">
              No movies found. Try a different search!
            </Typography>
          </Box>
        )}
      </Box>

      {/* Movie Details Modal */}
      <Dialog
        open={Boolean(selectedMovie)}
        onClose={handleCloseModal}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: "rgba(210, 210, 203, 0.98)",
            backgroundImage: movieDetails?.backdrop_path
              ? `linear-gradient(rgba(0,0,0,0.8), rgba(0,0,0,0.8)), url(https://image.tmdb.org/t/p/original${movieDetails.backdrop_path})`
              : "none",
            backgroundSize: "cover",
            backgroundPosition: "center",
          },
        }}
      >
        <DialogTitle>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="h4" fontWeight="bold" color="#fff">
              {selectedMovie?.title}
            </Typography>
            <IconButton onClick={handleCloseModal} sx={{ color: "#fff" }}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {detailsLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress sx={{ color: "#bc252d" }} />
            </Box>
          ) : (
            movieDetails && (
              <Box>
                <Box sx={{ display: "flex", gap: 3, mb: 3 }}>
                  <Box sx={{ flexShrink: 0 }}>
                    <img
                      src={
                        movieDetails.poster_path
                          ? getMoviePosterUrl(movieDetails.poster_path)
                          : "/movie/maomao.png"
                      }
                      alt={movieDetails.title}
                      style={{
                        width: "200px",
                        borderRadius: "8px",
                        boxShadow: "0 4px 8px rgba(0,0,0,0.3)",
                      }}
                    />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ mb: 2 }}>
                      <Chip
                        label={`⭐ ${movieDetails.vote_average.toFixed(1)}/10`}
                        sx={{
                          backgroundColor: "#FFD700",
                          color: "#000",
                          fontWeight: "bold",
                          mr: 1,
                        }}
                      />
                      <Chip
                        label={movieDetails.release_date?.substring(0, 4)}
                        sx={{ backgroundColor: "#bc252d", color: "#fff", mr: 1 }}
                      />
                      <Chip
                        label={`${movieDetails.runtime} min`}
                        sx={{ backgroundColor: "#4d695d", color: "#fff" }}
                      />
                    </Box>

                    <Typography variant="body1" color="#fff" paragraph>
                      {movieDetails.overview}
                    </Typography>

                    {movieDetails.genres && (
                      <Box sx={{ mb: 2 }}>
                        <Typography
                          variant="subtitle2"
                          color="#fff"
                          fontWeight="bold"
                          mb={1}
                        >
                          Genres:
                        </Typography>
                        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                          {movieDetails.genres.map((genre) => (
                            <Chip
                              key={genre.id}
                              label={genre.name}
                              size="small"
                              sx={{
                                backgroundColor: "rgba(131, 167, 157, 0.9)",
                                color: "#fff",
                              }}
                            />
                          ))}
                        </Box>
                      </Box>
                    )}

                    {trailerUrl && (
                      <Button
                        variant="contained"
                        startIcon={<PlayArrowIcon />}
                        href={trailerUrl}
                        target="_blank"
                        sx={{
                          backgroundColor: "#bc252d",
                          "&:hover": { backgroundColor: "#9a1f25" },
                          mt: 2,
                        }}
                      >
                        Watch Trailer
                      </Button>
                    )}
                  </Box>
                </Box>

                {/* Additional Info */}
                <Box
                  sx={{
                    backgroundColor: "rgba(255, 255, 255, 0.9)",
                    borderRadius: "8px",
                    p: 2,
                  }}
                >
                  <Typography variant="subtitle1" fontWeight="bold" mb={1}>
                    <InfoIcon
                      sx={{ verticalAlign: "middle", mr: 1, fontSize: "1.2rem" }}
                    />
                    Additional Information
                  </Typography>
                  <Grid2 container spacing={2}>
                    <Grid2 size={{ xs: 6, sm: 4 }}>
                      <Typography variant="body2" color="text.secondary">
                        Status
                      </Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {movieDetails.status}
                      </Typography>
                    </Grid2>
                    <Grid2 size={{ xs: 6, sm: 4 }}>
                      <Typography variant="body2" color="text.secondary">
                        Budget
                      </Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {movieDetails.budget
                          ? `$${(movieDetails.budget / 1000000).toFixed(1)}M`
                          : "N/A"}
                      </Typography>
                    </Grid2>
                    <Grid2 size={{ xs: 6, sm: 4 }}>
                      <Typography variant="body2" color="text.secondary">
                        Revenue
                      </Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {movieDetails.revenue
                          ? `$${(movieDetails.revenue / 1000000).toFixed(1)}M`
                          : "N/A"}
                      </Typography>
                    </Grid2>
                  </Grid2>
                </Box>
              </Box>
            )
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default MovieDiscovery;

