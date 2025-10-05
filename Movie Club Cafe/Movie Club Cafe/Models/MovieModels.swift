//
//  MovieModels.swift
//  Movie Club Cafe
//
//  Created by Kavy Rattana on 10/4/25.
//

import Foundation

struct Movie: Codable, Identifiable, Equatable {
    var id = UUID()
    let title: String
    let submittedBy: String
    let director: String?
    let year: String?
    let posterUrl: String?
    let eventDate: Date?
    let eventDescription: String?
    let eventLocation: String?
    let streamingProviders: [StreamingProvider]?
    let watchProvidersLink: String?
    
    enum CodingKeys: String, CodingKey {
        case title, submittedBy, director, year, posterUrl, eventDate, eventDescription, eventLocation, streamingProviders, watchProvidersLink
    }
    
    init(title: String, submittedBy: String, director: String? = nil, year: String? = nil, posterUrl: String? = nil, eventDate: Date? = nil, eventDescription: String? = nil, eventLocation: String? = nil, streamingProviders: [StreamingProvider]? = nil, watchProvidersLink: String? = nil) {
        self.title = title
        self.submittedBy = submittedBy
        self.director = director
        self.year = year
        self.posterUrl = posterUrl
        self.eventDate = eventDate
        self.eventDescription = eventDescription
        self.eventLocation = eventLocation
        self.streamingProviders = streamingProviders
        self.watchProvidersLink = watchProvidersLink
    }
    
    static func == (lhs: Movie, rhs: Movie) -> Bool {
        lhs.title == rhs.title &&
        lhs.submittedBy == rhs.submittedBy &&
        lhs.director == rhs.director &&
        lhs.year == rhs.year
    }
}

struct StreamingProvider: Codable, Identifiable, Equatable {
    let id: Int
    let name: String
    let logoUrl: String?
    
    static func == (lhs: StreamingProvider, rhs: StreamingProvider) -> Bool {
        lhs.id == rhs.id
    }
}

struct MonthlySelections: Codable, Equatable {
    let action: Movie?
    let drama: Movie?
    let comedy: Movie?
    let thriller: Movie?
}

struct GenrePools: Codable {
    let action: [Movie]
    let drama: [Movie]
    let comedy: [Movie]
    let thriller: [Movie]
}

struct MovieSubmissionData: Codable {
    let accesscode: String
    let action: String
    let drama: String
    let comedy: String
    let thriller: String
    let submittedAt: Date
}

enum Genre: String, CaseIterable {
    case action = "action"
    case drama = "drama"
    case comedy = "comedy"
    case thriller = "thriller"
    
    var title: String {
        switch self {
        case .action: return "Action"
        case .drama: return "Drama"
        case .comedy: return "Comedy"
        case .thriller: return "Thriller"
        }
    }
    
    var subtitle: String {
        switch self {
        case .action: return "Adventure • Sci-Fi • Fantasy"
        case .drama: return "Documentary • Biopic • Historical"
        case .comedy: return "Romance • Musical"
        case .thriller: return "Horror • Mystery • Crime"
        }
    }
    
    var label: String {
        switch self {
        case .action: return "Action/Sci-Fi/Fantasy"
        case .drama: return "Drama/Documentary"
        case .comedy: return "Comedy/Musical"
        case .thriller: return "Thriller/Horror"
        }
    }
}

struct MonthOption: Identifiable {
    let id: String
    let label: String
}

