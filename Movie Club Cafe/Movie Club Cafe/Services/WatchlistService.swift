//
//  WatchlistService.swift
//  Movie Club Cafe
//
//  Created by Kavy Rattana on 11/7/25.
//

import Foundation
import FirebaseFirestore
import FirebaseAuth

class WatchlistService {
    static let shared = WatchlistService()
    private let db = FirebaseConfig.shared.db
    
    private init() {}
    
    // MARK: - Toggle Watch Status
    
    /// Toggle watch status for a movie (mark as watched or unmark)
    func toggleWatchStatus(
        movie: Movie,
        genre: Genre,
        monthId: String,
        completion: @escaping (Result<Bool, Error>) -> Void
    ) {
        guard let user = Auth.auth().currentUser else {
            completion(.failure(NSError(domain: "WatchlistService", code: 401, userInfo: [NSLocalizedDescriptionKey: "User not authenticated"])))
            return
        }
        
        Task {
            do {
                // Check if already watched
                let isWatched = try await checkIfWatched(movieTitle: movie.title, monthId: monthId, genre: genre.rawValue, userId: user.uid)
                
                if isWatched {
                    // Unmark as watched
                    try await unmarkAsWatched(movieTitle: movie.title, monthId: monthId, genre: genre.rawValue, userId: user.uid)
                    completion(.success(false))
                } else {
                    // Mark as watched
                    try await markAsWatched(movie: movie, genre: genre, monthId: monthId, user: user)
                    completion(.success(true))
                }
            } catch {
                completion(.failure(error))
            }
        }
    }
    
    // MARK: - Mark as Watched
    
    private func markAsWatched(movie: Movie, genre: Genre, monthId: String, user: User) async throws {
        let watchedMovie = WatchedMovie(
            movieTitle: movie.title,
            monthId: monthId,
            genre: genre.rawValue,
            watchedAt: Date()
        )
        
        // Add to user's watched movies
        let userRef = db.collection("Users").document(user.uid)
        try await userRef.setData([
            "watchedMovies": FieldValue.arrayUnion([[
                "movieTitle": watchedMovie.movieTitle,
                "monthId": watchedMovie.monthId,
                "genre": watchedMovie.genre,
                "watchedAt": Timestamp(date: watchedMovie.watchedAt)
            ] as [String: Any]])
        ], merge: true)
        
        // Create watcher entry
        let watcher = MovieWatcher(
            id: user.uid,
            userName: user.displayName ?? "Anonymous",
            photoURL: user.photoURL?.absoluteString,
            watchedAt: Date()
        )
        
        // Add to MovieWatchers collection
        let watchersDocId = "\(monthId)__\(genre.rawValue)__\(movie.title)"
        let watchersRef = db.collection("MovieWatchers").document(watchersDocId)
        
        try await watchersRef.setData([
            "watchers": FieldValue.arrayUnion([[
                "id": watcher.id,
                "userName": watcher.userName,
                "photoURL": watcher.photoURL as Any,
                "watchedAt": Timestamp(date: watcher.watchedAt)
            ] as [String: Any]])
        ], merge: true)
        
        // Send notification to all users
        try await sendWatchNotification(userName: watcher.userName, movieTitle: movie.title, genre: genre.rawValue, currentUserId: user.uid)
    }
    
    // MARK: - Unmark as Watched
    
    private func unmarkAsWatched(movieTitle: String, monthId: String, genre: String, userId: String) async throws {
        // Remove from user's watched movies
        let userRef = db.collection("Users").document(userId)
        let userDoc = try await userRef.getDocument()
        
        if let data = userDoc.data(),
           let watchedMoviesData = data["watchedMovies"] as? [[String: Any]] {
            let filteredWatchedMovies = watchedMoviesData.filter { movie in
                guard let title = movie["movieTitle"] as? String,
                      let month = movie["monthId"] as? String,
                      let genreVal = movie["genre"] as? String else {
                    return true
                }
                return !(title == movieTitle && month == monthId && genreVal == genre)
            }
            
            try await userRef.setData([
                "watchedMovies": filteredWatchedMovies
            ], merge: true)
        }
        
        // Remove from MovieWatchers collection
        let watchersDocId = "\(monthId)__\(genre)__\(movieTitle)"
        let watchersRef = db.collection("MovieWatchers").document(watchersDocId)
        let watchersDoc = try await watchersRef.getDocument()
        
        if let data = watchersDoc.data(),
           let watchersData = data["watchers"] as? [[String: Any]] {
            let filteredWatchers = watchersData.filter { watcher in
                guard let id = watcher["id"] as? String else { return true }
                return id != userId
            }
            
            if filteredWatchers.isEmpty {
                try await watchersRef.delete()
            } else {
                try await watchersRef.setData([
                    "watchers": filteredWatchers
                ], merge: true)
            }
        }
    }
    
    // MARK: - Check Watch Status
    
    func checkIfWatched(movieTitle: String, monthId: String, genre: String, userId: String) async throws -> Bool {
        let userRef = db.collection("Users").document(userId)
        let doc = try await userRef.getDocument()
        
        if let data = doc.data(),
           let watchedMovies = data["watchedMovies"] as? [[String: Any]] {
            return watchedMovies.contains { movie in
                guard let title = movie["movieTitle"] as? String,
                      let month = movie["monthId"] as? String,
                      let genreVal = movie["genre"] as? String else {
                    return false
                }
                return title == movieTitle && month == monthId && genreVal == genre
            }
        }
        
        return false
    }
    
    // MARK: - Fetch Movie Watchers
    
    func fetchMovieWatchers(movieTitle: String, monthId: String, genre: String) async throws -> [MovieWatcher] {
        let watchersDocId = "\(monthId)__\(genre)__\(movieTitle)"
        let watchersRef = db.collection("MovieWatchers").document(watchersDocId)
        let doc = try await watchersRef.getDocument()
        
        guard let data = doc.data(),
              let watchersData = data["watchers"] as? [[String: Any]] else {
            return []
        }
        
        return watchersData.compactMap { watcherDict -> MovieWatcher? in
            guard let id = watcherDict["id"] as? String,
                  let userName = watcherDict["userName"] as? String else {
                return nil
            }
            
            let photoURL = watcherDict["photoURL"] as? String
            let watchedAt: Date
            if let timestamp = watcherDict["watchedAt"] as? Timestamp {
                watchedAt = timestamp.dateValue()
            } else {
                watchedAt = Date()
            }
            
            return MovieWatcher(id: id, userName: userName, photoURL: photoURL, watchedAt: watchedAt)
        }
    }
    
    // MARK: - Send Notification
    
    private func sendWatchNotification(userName: String, movieTitle: String, genre: String, currentUserId: String) async throws {
        // Fetch all users' FCM tokens except current user
        let usersRef = db.collection("Users")
        let snapshot = try await usersRef.getDocuments()
        
        var tokens: [String] = []
        for document in snapshot.documents {
            // Skip current user
            if document.documentID == currentUserId {
                continue
            }
            
            if let fcmToken = document.data()["fcmToken"] as? String, !fcmToken.isEmpty {
                tokens.append(fcmToken)
            }
        }
        
        // If no tokens, no need to send notifications
        guard !tokens.isEmpty else {
            print("No FCM tokens found for notification")
            return
        }
        
        // Prepare notification payload
        let notification: [String: Any] = [
            "tokens": tokens,
            "title": "🎬 Movie Club Update",
            "body": "\(userName) just watched \(movieTitle)!",
            "data": [
                "type": "movie_watched",
                "movieTitle": movieTitle,
                "genre": genre,
                "userName": userName
            ]
        ]
        
        // Send to Cloud Function or use Firebase Cloud Messaging directly
        // For now, we'll store in a notifications queue collection
        let notificationsRef = db.collection("NotificationQueue")
        try await notificationsRef.addDocument(data: notification)
        
        print("✅ Notification queued for \(tokens.count) users")
    }
}

