//
//  UserModel.swift
//  Movie Club Cafe
//
//  Created by Kavy Rattana on 10/5/25.
//

import Foundation
import FirebaseAuth

struct WatchedMovie: Codable, Identifiable, Equatable {
    let id = UUID()
    let movieTitle: String
    let monthId: String
    let genre: String
    let watchedAt: Date
    
    enum CodingKeys: String, CodingKey {
        case movieTitle, monthId, genre, watchedAt
    }
    
    init(movieTitle: String, monthId: String, genre: String, watchedAt: Date = Date()) {
        self.movieTitle = movieTitle
        self.monthId = monthId
        self.genre = genre
        self.watchedAt = watchedAt
    }
    
    static func == (lhs: WatchedMovie, rhs: WatchedMovie) -> Bool {
        lhs.movieTitle == rhs.movieTitle &&
        lhs.monthId == rhs.monthId &&
        lhs.genre == rhs.genre
    }
}

struct AppUser: Identifiable, Codable {
    let id: String
    var email: String?
    var displayName: String?
    var photoURL: String?
    var phoneNumber: String?
    var createdAt: Date
    var lastLoginAt: Date
    var role: String? // "admin" or "user"
    var fcmToken: String?
    
    // User preferences
    var favoriteGenres: [String]
    var watchedMovies: [WatchedMovie]
    var submittedMovies: [String]
    
    init(id: String, email: String? = nil, displayName: String? = nil, photoURL: String? = nil, phoneNumber: String? = nil, role: String? = nil, fcmToken: String? = nil) {
        self.id = id
        self.email = email
        self.displayName = displayName
        self.photoURL = photoURL
        self.phoneNumber = phoneNumber
        self.role = role
        self.fcmToken = fcmToken
        self.createdAt = Date()
        self.lastLoginAt = Date()
        self.favoriteGenres = []
        self.watchedMovies = []
        self.submittedMovies = []
    }
    
    init(from firebaseUser: User) {
        self.id = firebaseUser.uid
        self.email = firebaseUser.email
        self.displayName = firebaseUser.displayName
        self.photoURL = firebaseUser.photoURL?.absoluteString
        self.phoneNumber = firebaseUser.phoneNumber
        self.role = nil
        self.fcmToken = nil
        self.createdAt = firebaseUser.metadata.creationDate ?? Date()
        self.lastLoginAt = firebaseUser.metadata.lastSignInDate ?? Date()
        self.favoriteGenres = []
        self.watchedMovies = []
        self.submittedMovies = []
    }
    
    // Helper methods for watched movies
    func hasWatched(movieTitle: String, monthId: String, genre: String) -> Bool {
        watchedMovies.contains { $0.movieTitle == movieTitle && $0.monthId == monthId && $0.genre == genre }
    }
    
    mutating func addWatchedMovie(_ movie: WatchedMovie) {
        if !watchedMovies.contains(movie) {
            watchedMovies.append(movie)
        }
    }
    
    mutating func removeWatchedMovie(movieTitle: String, monthId: String, genre: String) {
        watchedMovies.removeAll { $0.movieTitle == movieTitle && $0.monthId == monthId && $0.genre == genre }
    }
}

enum AuthenticationError: LocalizedError {
    case invalidEmail
    case weakPassword
    case emailAlreadyInUse
    case userNotFound
    case wrongPassword
    case networkError
    case cancelled
    case unknown(String)
    
    var errorDescription: String? {
        switch self {
        case .invalidEmail:
            return "The email address is invalid."
        case .weakPassword:
            return "The password is too weak. Please use at least 6 characters."
        case .emailAlreadyInUse:
            return "This email is already registered."
        case .userNotFound:
            return "No account found with this email."
        case .wrongPassword:
            return "Incorrect password. Please try again."
        case .networkError:
            return "Network error. Please check your connection."
        case .cancelled:
            return "Sign in was cancelled."
        case .unknown(let message):
            return message
        }
    }
}
