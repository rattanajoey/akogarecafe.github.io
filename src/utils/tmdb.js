const TMDB_API_KEY =
  process.env.REACT_APP_TMDB_API_KEY || "576be59b6712fa18658df8a825ba434e";
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

const cleanMovieTitle = (title) => {
  // Remove year in parentheses and trim any extra spaces
  const yearMatch = title.match(/\((\d{4})\)/);
  const year = yearMatch ? yearMatch[1] : null;
  const cleanTitle = title.replace(/\s*\(\d{4}\)\s*$/, "").trim();
  return { cleanTitle, year };
};

export const searchMovie = async (title) => {
  try {
    const { cleanTitle, year } = cleanMovieTitle(title);
    const response = await fetch(
      `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(
        cleanTitle
      )}`
    );
    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      return null;
    }

    // If year is provided, try to find exact match with year
    if (year) {
      const yearMatch = data.results.find((movie) =>
        movie.release_date.startsWith(year)
      );
      if (yearMatch) return yearMatch;
    }

    // Filter results to only include movies with sufficient votes and popularity
    const validResults = data.results.filter(
      (movie) => movie.vote_count > 10 && movie.popularity > 0.5
    );

    if (validResults.length > 0) {
      // Sort by a weighted score that considers:
      // 1. Vote average weighted by vote count (more votes = more reliable rating)
      // 2. Popularity (but weighted less than votes)
      // 3. Exact title match bonus
      validResults.sort((a, b) => {
        const voteScoreA =
          (a.vote_average * Math.min(a.vote_count, 1000)) / 1000;
        const voteScoreB =
          (b.vote_average * Math.min(b.vote_count, 1000)) / 1000;

        const popularityScoreA = a.popularity * 0.1;
        const popularityScoreB = b.popularity * 0.1;

        // Give bonus for exact title matches
        const titleBonusA =
          a.title.toLowerCase() === cleanTitle.toLowerCase() ? 1 : 0;
        const titleBonusB =
          b.title.toLowerCase() === cleanTitle.toLowerCase() ? 1 : 0;

        const scoreA = voteScoreA + popularityScoreA + titleBonusA;
        const scoreB = voteScoreB + popularityScoreB + titleBonusB;

        return scoreB - scoreA;
      });
      return validResults[0];
    }

    // Fallback to first result if no good matches found
    return data.results[0];
  } catch (error) {
    console.error("Error searching movie:", error);
    return null;
  }
};

export const getMovieDetails = async (movieId) => {
  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}&append_to_response=videos,watch/providers`
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

export const getWatchProviders = (watchProviders, countryCode = "US") => {
  if (!watchProviders?.results) return null;
  return watchProviders.results[countryCode] || null;
};

export const getProviderLogoUrl = (logoPath) => {
  if (!logoPath) return null;
  return `https://image.tmdb.org/t/p/original${logoPath}`;
};

export const getStreamingProviders = (watchProviders, countryCode = "US") => {
  const providers = getWatchProviders(watchProviders, countryCode);
  return providers?.flatrate || [];
};
