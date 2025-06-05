const TMDB_API_KEY =
  process.env.REACT_APP_TMDB_API_KEY || "576be59b6712fa18658df8a825ba434e";
console.log("TMDB API Key:", TMDB_API_KEY); // Debug line
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

const cleanMovieTitle = (title) => {
  // Remove year in parentheses and trim any extra spaces
  return title.replace(/\s*\(\d{4}\)\s*$/, "").trim();
};

export const searchMovie = async (title) => {
  try {
    const cleanTitle = cleanMovieTitle(title);
    const response = await fetch(
      `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(
        cleanTitle
      )}`
    );
    const data = await response.json();
    return data.results[0]; // Return the first matching movie
  } catch (error) {
    console.error("Error searching movie:", error);
    return null;
  }
};

export const getMovieDetails = async (movieId) => {
  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}&append_to_response=videos`
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching movie details:", error);
    return null;
  }
};

export const getMoviePosterUrl = (posterPath) => {
  if (!posterPath) return null;
  return `https://image.tmdb.org/t/p/w500${posterPath}`;
};

export const getTrailerUrl = (videos) => {
  if (!videos?.results) return null;
  const trailer = videos.results.find(
    (video) => video.type === "Trailer" && video.site === "YouTube"
  );
  return trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : null;
};
