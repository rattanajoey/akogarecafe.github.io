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

struct TMDBSearchResponse: Codable {
    let results: [TMDBMovie]
}

class TMDBService {
    static let shared = TMDBService()
    private let apiKey = ProcessInfo.processInfo.environment["TMDB_API_KEY"] ?? "576be59b6712fa18658df8a825ba434e"
    private let baseURL = "https://api.themoviedb.org/3"
    
    private init() {}
    
    func searchMovie(title: String) async throws -> TMDBMovie? {
        let (cleanTitle, year) = cleanMovieTitle(title)
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
                return yearMatch
            }
        }
        
        // Filter by vote count and popularity
        let validResults = response.results.filter { $0.voteCount > 10 && $0.popularity > 0.5 }
        
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
            return sorted.first
        }
        
        return response.results.first
    }
    
    func getMovieDetails(movieId: Int) async throws -> TMDBMovie {
        let urlString = "\(baseURL)/movie/\(movieId)?api_key=\(apiKey)&append_to_response=videos"
        
        guard let url = URL(string: urlString) else {
            throw URLError(.badURL)
        }
        
        let (data, _) = try await URLSession.shared.data(from: url)
        let movie = try JSONDecoder().decode(TMDBMovie.self, from: data)
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

