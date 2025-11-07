import React, { useState, useEffect } from "react";
import {
  Autocomplete,
  TextField,
  Box,
  Typography,
  CircularProgress,
  Paper,
} from "@mui/material";
import { searchMovie, getMoviePosterUrl } from "../../../utils/tmdb";

const TMDB_API_KEY =
  process.env.REACT_APP_TMDB_API_KEY || "576be59b6712fa18658df8a825ba434e";
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

const MovieSearchAutocomplete = ({ label, value, onChange, genre }) => {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    if (inputValue.length < 2) {
      setOptions([]);
      return;
    }

    const searchMovies = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(
            inputValue
          )}&page=1`
        );
        const data = await response.json();

        if (data.results) {
          // Filter out movies without release dates and format them
          const formattedResults = data.results
            .filter((movie) => movie.release_date)
            .slice(0, 8) // Limit to 8 results
            .map((movie) => ({
              id: movie.id,
              title: movie.title,
              year: movie.release_date
                ? new Date(movie.release_date).getFullYear()
                : "N/A",
              posterPath: movie.poster_path,
              overview: movie.overview,
              voteAverage: movie.vote_average,
              displayTitle: `${movie.title} (${
                movie.release_date
                  ? new Date(movie.release_date).getFullYear()
                  : "N/A"
              })`,
            }));
          setOptions(formattedResults);
        }
      } catch (error) {
        console.error("Error searching movies:", error);
        setOptions([]);
      }
      setLoading(false);
    };

    const debounceTimer = setTimeout(() => {
      searchMovies();
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [inputValue]);

  return (
    <Autocomplete
      freeSolo
      options={options}
      loading={loading}
      value={value}
      onChange={(event, newValue) => {
        if (typeof newValue === "string") {
          onChange(newValue);
        } else if (newValue && newValue.displayTitle) {
          onChange(newValue.displayTitle);
        } else {
          onChange("");
        }
      }}
      onInputChange={(event, newInputValue) => {
        setInputValue(newInputValue);
        // Allow manual typing
        if (event?.type === "change") {
          onChange(newInputValue);
        }
      }}
      getOptionLabel={(option) => {
        if (typeof option === "string") return option;
        return option.displayTitle || "";
      }}
      isOptionEqualToValue={(option, value) => {
        if (typeof value === "string") return option.displayTitle === value;
        return option.id === value.id;
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          variant="outlined"
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
      renderOption={(props, option) => (
        <Box
          component="li"
          {...props}
          sx={{
            display: "flex",
            gap: 2,
            p: 1,
            "&:hover": {
              backgroundColor: "rgba(188, 37, 45, 0.1)",
            },
          }}
        >
          {option.posterPath ? (
            <img
              src={getMoviePosterUrl(option.posterPath)}
              alt={option.title}
              style={{
                width: "50px",
                height: "75px",
                objectFit: "cover",
                borderRadius: "4px",
              }}
            />
          ) : (
            <Box
              sx={{
                width: "50px",
                height: "75px",
                backgroundColor: "#ddd",
                borderRadius: "4px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Typography variant="caption" color="text.secondary">
                No Image
              </Typography>
            </Box>
          )}
          <Box sx={{ flex: 1 }}>
            <Typography variant="body1" fontWeight="bold">
              {option.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {option.year} • ⭐ {option.voteAverage.toFixed(1)}
            </Typography>
          </Box>
        </Box>
      )}
      PaperComponent={({ children }) => (
        <Paper
          sx={{
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(10px)",
          }}
        >
          {children}
        </Paper>
      )}
      noOptionsText={
        inputValue.length < 2
          ? "Type at least 2 characters to search..."
          : "No movies found"
      }
      sx={{ mb: 2 }}
    />
  );
};

export default MovieSearchAutocomplete;

