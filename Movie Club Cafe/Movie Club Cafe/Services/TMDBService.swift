//
//  TMDBService.swift
//  Movie Club Cafe
//
//  Created by Kavy Rattana on 10/4/25.
//

import Foundation

struct TMDBMovie: Codable {
    let id: Int
    let title: String
    let originalTitle: String
    let overview: String
    let posterPath: String?
    let backdropPath: String?
    let releaseDate: String
    let voteAverage: Double
    let voteCount: Int
    let popularity: Double
    let runtime: Int?
    let budget: Int?
    let revenue: Int?
    let originalLanguage: String
    let genres: [TMDBGenre]?
    let productionCompanies: [TMDBProductionCompany]?
    let videos: TMDBVideos?
    let watchProviders: TMDBWatchProvidersResponse?
    
    enum CodingKeys: String, CodingKey {
        case id, title, overview, popularity, runtime, budget, revenue, genres, videos
        case originalTitle = "original_title"
        case posterPath = "poster_path"
        case backdropPath = "backdrop_path"
        case releaseDate = "release_date"
        case voteAverage = "vote_average"
        case voteCount = "vote_count"
        case originalLanguage = "original_language"
        case productionCompanies = "production_companies"
        case watchProviders = "watch/providers"
    }
}

// MARK: - Cache Entry
struct TMDBCacheEntry<T: Codable>: Codable {
    let data: T
    let timestamp: Date
    
    var isExpired: Bool {
        return Date().timeIntervalSince(timestamp) > expirationInterval
    }
    
    var expirationInterval: TimeInterval {
        // 7 days for movie details, 1 day for search results
        if T.self == TMDBMovie.self {
            return 7 * 24 * 60 * 60 // 7 days
        } else {
            return 24 * 60 * 60 // 1 day
        }
    }
}

struct TMDBGenre: Codable {
    let id: Int
    let name: String
}

struct TMDBProductionCompany: Codable {
    let id: Int
    let name: String
    let logoPath: String?
    
    enum CodingKeys: String, CodingKey {
        case id, name
        case logoPath = "logo_path"
    }
}

struct TMDBVideos: Codable {
    let results: [TMDBVideo]
}

struct TMDBVideo: Codable {
    let key: String
    let site: String
    let type: String
}

struct TMDBWatchProvidersResponse: Codable {
    let results: [String: TMDBCountryProviders]
}

struct TMDBCountryProviders: Codable {
    let link: String?
    let flatrate: [TMDBProvider]?  // Streaming services
    let rent: [TMDBProvider]?      // Rental options
    let buy: [TMDBProvider]?       // Purchase options
}

struct TMDBProvider: Codable, Identifiable {
    let providerId: Int
    let providerName: String
    let logoPath: String?
    let displayPriority: Int
    
    var id: Int { providerId }
    
    enum CodingKeys: String, CodingKey {
        case providerId = "provider_id"
        case providerName = "provider_name"
        case logoPath = "logo_path"
        case displayPriority = "display_priority"
    }
}

struct TMDBSearchResponse: Codable {
    let results: [TMDBMovie]
}

class TMDBService {
    static let shared = TMDBService()
    private let apiKey = ProcessInfo.processInfo.environment["TMDB_API_KEY"] ?? "576be59b6712fa18658df8a825ba434e"
    private let baseURL = "https://api.themoviedb.org/3"
    
    // MARK: - Cache
    private let memoryCache = NSCache<NSString, NSData>()
    private let cacheDirectory: URL
    private let cacheQueue = DispatchQueue(label: "com.akogarecafe.tmdb.cache", attributes: .concurrent)
    
    private init() {
        // Set up cache directory
        let cachePath = FileManager.default.urls(for: .cachesDirectory, in: .userDomainMask)[0]
        cacheDirectory = cachePath.appendingPathComponent("TMDBCache", isDirectory: true)
        
        // Create cache directory if it doesn't exist
        try? FileManager.default.createDirectory(at: cacheDirectory, withIntermediateDirectories: true)
        
        // Configure memory cache (50 items max)
        memoryCache.countLimit = 50
        
        // Clean up expired cache entries on init
        cleanExpiredCache()
    }
    
    // MARK: - Cache Management
    
    private func cacheKey(for query: String, type: String) -> String {
        return "\(type)_\(query)"
    }
    
    private func getCachedData<T: Codable>(for key: String) -> T? {
        let cacheKey = key as NSString
        
        // Check memory cache first
        if let data = memoryCache.object(forKey: cacheKey) as Data? {
            do {
                let entry = try JSONDecoder().decode(TMDBCacheEntry<T>.self, from: data)
                if !entry.isExpired {
                    return entry.data
                } else {
                    // Remove expired entry from memory
                    memoryCache.removeObject(forKey: cacheKey)
                }
            } catch {
                // Invalid cache entry, remove it
                memoryCache.removeObject(forKey: cacheKey)
            }
        }
        
        // Check disk cache
        let fileURL = cacheDirectory.appendingPathComponent("\(key).json")
        if let data = try? Data(contentsOf: fileURL) {
            do {
                let entry = try JSONDecoder().decode(TMDBCacheEntry<T>.self, from: data)
                if !entry.isExpired {
                    // Store in memory cache for faster access next time
                    memoryCache.setObject(data as NSData, forKey: cacheKey)
                    return entry.data
                } else {
                    // Remove expired file
                    try? FileManager.default.removeItem(at: fileURL)
                }
            } catch {
                // Invalid cache file, remove it
                try? FileManager.default.removeItem(at: fileURL)
            }
        }
        
        return nil
    }
    
    private func cacheData<T: Codable>(_ data: T, for key: String) {
        let entry = TMDBCacheEntry(data: data, timestamp: Date())
        
        do {
            let encodedData = try JSONEncoder().encode(entry)
            let cacheKey = key as NSString
            
            // Store in memory cache
            memoryCache.setObject(encodedData as NSData, forKey: cacheKey)
            
            // Store in disk cache asynchronously
            cacheQueue.async(flags: .barrier) { [weak self] in
                guard let self = self else { return }
                let fileURL = self.cacheDirectory.appendingPathComponent("\(key).json")
                try? encodedData.write(to: fileURL)
            }
        } catch {
            print("Failed to cache data: \(error)")
        }
    }
    
    private func cleanExpiredCache() {
        cacheQueue.async(flags: .barrier) { [weak self] in
            guard let self = self else { return }
            
            guard let files = try? FileManager.default.contentsOfDirectory(
                at: self.cacheDirectory,
                includingPropertiesForKeys: [.creationDateKey],
                options: .skipsHiddenFiles
            ) else { return }
            
            for fileURL in files {
                if let data = try? Data(contentsOf: fileURL),
                   let entry = try? JSONDecoder().decode(TMDBCacheEntry<TMDBMovie>.self, from: data),
                   entry.isExpired {
                    try? FileManager.default.removeItem(at: fileURL)
                }
            }
        }
    }
    
    /// Clears all cached data (useful for debugging or user preference)
    func clearCache() {
        memoryCache.removeAllObjects()
        cacheQueue.async(flags: .barrier) { [weak self] in
            guard let self = self else { return }
            try? FileManager.default.removeItem(at: self.cacheDirectory)
            try? FileManager.default.createDirectory(at: self.cacheDirectory, withIntermediateDirectories: true)
        }
    }
    
    func searchMovie(title: String) async throws -> TMDBMovie? {
        let (cleanTitle, year) = cleanMovieTitle(title)
        
        // Generate cache key
        let cacheKey = self.cacheKey(for: cleanTitle.lowercased(), type: "search")
        
        // Check cache first
        if let cachedMovie: TMDBMovie = getCachedData(for: cacheKey) {
            print("📦 Cache hit for search: \(cleanTitle)")
            return cachedMovie
        }
        
        print("🌐 API call for search: \(cleanTitle)")
        
        // Make API call
        let encodedTitle = cleanTitle.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? cleanTitle
        let urlString = "\(baseURL)/search/movie?api_key=\(apiKey)&query=\(encodedTitle)"
        
        guard let url = URL(string: urlString) else {
            throw URLError(.badURL)
        }
        
        let (data, _) = try await URLSession.shared.data(from: url)
        let response = try JSONDecoder().decode(TMDBSearchResponse.self, from: data)
        
        guard !response.results.isEmpty else {
            return nil
        }
        
        // If year is provided, try to find exact match
        if let year = year {
            if let yearMatch = response.results.first(where: { $0.releaseDate.hasPrefix(year) }) {
                // Cache the result
                cacheData(yearMatch, for: cacheKey)
                return yearMatch
            }
        }
        
        // Filter by vote count and popularity
        let validResults = response.results.filter { $0.voteCount > 10 && $0.popularity > 0.5 }
        
        let result: TMDBMovie?
        
        if !validResults.isEmpty {
            // Sort by weighted score
            let sorted = validResults.sorted { a, b in
                let voteScoreA = (a.voteAverage * Double(min(a.voteCount, 1000))) / 1000.0
                let voteScoreB = (b.voteAverage * Double(min(b.voteCount, 1000))) / 1000.0
                
                let popularityScoreA = a.popularity * 0.1
                let popularityScoreB = b.popularity * 0.1
                
                let titleBonusA = a.title.lowercased() == cleanTitle.lowercased() ? 1.0 : 0.0
                let titleBonusB = b.title.lowercased() == cleanTitle.lowercased() ? 1.0 : 0.0
                
                let scoreA = voteScoreA + popularityScoreA + titleBonusA
                let scoreB = voteScoreB + popularityScoreB + titleBonusB
                
                return scoreB > scoreA
            }
            result = sorted.first
        } else {
            result = response.results.first
        }
        
        // Cache the result
        if let result = result {
            cacheData(result, for: cacheKey)
        }
        
        return result
    }
    
    func getMovieDetails(movieId: Int) async throws -> TMDBMovie {
        // Generate cache key
        let cacheKey = self.cacheKey(for: "\(movieId)", type: "details")
        
        // Check cache first
        if let cachedMovie: TMDBMovie = getCachedData(for: cacheKey) {
            print("📦 Cache hit for movie details: \(movieId)")
            return cachedMovie
        }
        
        print("🌐 API call for movie details: \(movieId)")
        
        // Make API call
        let urlString = "\(baseURL)/movie/\(movieId)?api_key=\(apiKey)&append_to_response=videos,watch/providers"
        
        guard let url = URL(string: urlString) else {
            throw URLError(.badURL)
        }
        
        let (data, _) = try await URLSession.shared.data(from: url)
        let movie = try JSONDecoder().decode(TMDBMovie.self, from: data)
        
        // Cache the result
        cacheData(movie, for: cacheKey)
        
        return movie
    }
    
    func getPosterURL(posterPath: String?) -> URL? {
        guard let posterPath = posterPath else { return nil }
        return URL(string: "https://image.tmdb.org/t/p/w500\(posterPath)")
    }
    
    func getTrailerURL(videos: TMDBVideos?) -> URL? {
        guard let results = videos?.results else { return nil }
        let trailer = results.first { $0.type == "Trailer" && $0.site == "YouTube" }
        guard let key = trailer?.key else { return nil }
        return URL(string: "https://www.youtube.com/watch?v=\(key)")
    }
    
    func getWatchProviders(watchProviders: TMDBWatchProvidersResponse?, countryCode: String = "US") -> TMDBCountryProviders? {
        return watchProviders?.results[countryCode]
    }
    
    func getProviderLogoURL(logoPath: String?) -> URL? {
        guard let logoPath = logoPath else { return nil }
        return URL(string: "https://image.tmdb.org/t/p/original\(logoPath)")
    }
    
    func getStreamingProviders(watchProviders: TMDBWatchProvidersResponse?, countryCode: String = "US") -> [TMDBProvider] {
        guard let providers = getWatchProviders(watchProviders: watchProviders, countryCode: countryCode) else {
            return []
        }
        return providers.flatrate ?? []
    }
    
    private func cleanMovieTitle(_ title: String) -> (String, String?) {
        // Extract year if present
        let yearPattern = "\\((\\d{4})\\)"
        let regex = try? NSRegularExpression(pattern: yearPattern)
        let range = NSRange(title.startIndex..., in: title)
        
        var year: String?
        if let match = regex?.firstMatch(in: title, range: range) {
            if let yearRange = Range(match.range(at: 1), in: title) {
                year = String(title[yearRange])
            }
        }
        
        // Remove year and trim
        let cleanTitle = title.replacingOccurrences(of: yearPattern, with: "", options: .regularExpression).trimmingCharacters(in: .whitespaces)
        
        return (cleanTitle, year)
    }
    
    func getLanguageName(_ code: String) -> String {
        let locale = Locale(identifier: "en")
        return locale.localizedString(forLanguageCode: code)?.capitalized ?? code.uppercased()
    }
}

