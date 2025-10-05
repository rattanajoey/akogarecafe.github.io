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
    
    enum CodingKeys: String, CodingKey {
        case title, submittedBy, director, year, posterUrl
    }
    
    static func == (lhs: Movie, rhs: Movie) -> Bool {
        lhs.title == rhs.title &&
        lhs.submittedBy == rhs.submittedBy &&
        lhs.director == rhs.director &&
        lhs.year == rhs.year
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

