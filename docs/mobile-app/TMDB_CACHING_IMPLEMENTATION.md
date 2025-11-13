# TMDB API Caching Implementation

## Overview
Local caching has been implemented for all TMDB API calls to significantly reduce API usage and improve app performance.

## Features

### Two-Tier Cache System
1. **Memory Cache (NSCache)**
   - Fast in-memory storage
   - Automatically manages memory pressure
   - Limited to 50 items
   - First line of defense for repeated requests

2. **Disk Cache (FileManager)**
   - Persistent storage survives app restarts
   - Stored in app's Cache directory
   - Automatically cleaned up by iOS when storage is low

### Cache Expiration
- **Movie Details**: 7 days
  - Movie metadata rarely changes
  - Includes posters, trailers, ratings, genres
  
- **Search Results**: 1 day
  - Search results may change slightly over time
  - Balances freshness with API savings

### Automatic Cleanup
- Expired cache entries are removed on app launch
- Invalid/corrupted cache files are automatically deleted
- Memory cache automatically manages itself

## Cached API Calls

### 1. Movie Search (`searchMovie`)
```swift
let movie = try await TMDBService.shared.searchMovie(title: "Inception")
```
- Caches the best match for each search query
- Cache key based on normalized title (lowercase)
- Significantly speeds up repeated searches

### 2. Movie Details (`getMovieDetails`)
```swift
let details = try await TMDBService.shared.getMovieDetails(movieId: 27205)
```
- Caches full movie details including videos and watch providers
- Cache key based on movie ID
- Most beneficial for viewing the same movies repeatedly

## Performance Impact

### Before Caching
- Every movie search: 1 API call
- Every details view: 1 API call
- Viewing 10 movies multiple times: 20+ API calls
- Network latency on every request

### After Caching
- First search: 1 API call (cached for 1 day)
- Subsequent searches: 0 API calls (instant)
- First details view: 1 API call (cached for 7 days)
- Subsequent details: 0 API calls (instant)
- Viewing 10 movies multiple times: ~10 API calls total

### Expected API Savings
- **80-95% reduction** in API calls for typical usage
- **Instant loading** for cached data
- **Offline capability** for recently viewed content

## Console Output

The implementation includes helpful console logs:

```
📦 Cache hit for search: inception
📦 Cache hit for movie details: 27205
🌐 API call for search: interstellar
🌐 API call for movie details: 157336
```

## Cache Management

### Manual Cache Clearing
```swift
// Clear all cached data (useful for debugging or user settings)
TMDBService.shared.clearCache()
```

### Automatic Cache Management
- Expired entries removed on app launch
- iOS automatically clears cache directory when storage is low
- Memory cache releases data under memory pressure

## File Structure

### Cache Directory
```
~/Library/Caches/MovieClubCafe/TMDBCache/
├── search_inception.json
├── search_the matrix.json
├── details_27205.json
├── details_603.json
└── ...
```

### Cache File Format
```json
{
  "data": {
    "id": 27205,
    "title": "Inception",
    "posterPath": "/...",
    ...
  },
  "timestamp": "2025-11-07T10:30:00Z"
}
```

## Benefits

### For Users
- ⚡️ Faster loading times (instant for cached content)
- 📱 Works partially offline (cached movies still load)
- 🔋 Reduced battery usage (fewer network requests)
- 📊 Lower data usage

### For Developers
- 💰 Reduced API costs (80-95% fewer calls)
- 🚀 Better app performance
- 🛡️ Resilient to rate limiting
- 🧪 Easier testing (less API dependency)

## Technical Details

### Thread Safety
- All cache operations use a dedicated serial queue
- Memory cache is thread-safe (NSCache)
- Disk writes are asynchronous and non-blocking

### Error Handling
- Corrupted cache files are automatically removed
- Failed cache reads fall back to API calls
- Cache writes never block the UI

### Codable Support
- Generic caching system supports any `Codable` type
- Automatic encoding/decoding
- Type-safe cache retrieval

## Best Practices

### When to Clear Cache
- User logs out
- App updates (if data structure changes)
- User requests via settings option
- Debugging data issues

### Cache Monitoring
Watch console logs to monitor cache effectiveness:
- High 📦 (cache hits) = Good performance
- High 🌐 (API calls) = Cache misses or new data

## Future Enhancements

Possible improvements:
- Add cache size limits (MB)
- Implement LRU (Least Recently Used) eviction
- Add user preference for cache duration
- Cache statistics/analytics
- Background cache refresh for popular movies

## Testing

To verify caching works:
1. Search for a movie (should see 🌐 API call log)
2. Search same movie again (should see 📦 cache hit log)
3. Force quit app and restart
4. Search same movie (should still be 📦 cached)

## Implementation Date
November 7, 2025

---

This caching implementation provides significant performance improvements and API cost savings while maintaining data freshness and user experience.

