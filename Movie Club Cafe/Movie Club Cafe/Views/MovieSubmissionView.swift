//
//  MovieSubmissionView.swift
//  Movie Club Cafe
//
//  Created by Kavy Rattana on 10/4/25.
//

import SwiftUI
import FirebaseFirestore

struct MovieSubmissionView: View {
    @State private var nickname = ""
    @State private var accessCode = ""
    @State private var actionMovie = ""
    @State private var dramaMovie = ""
    @State private var comedyMovie = ""
    @State private var thrillerMovie = ""
    @State private var errorMessage = ""
    @State private var showingAlert = false
    @State private var alertTitle = ""
    @State private var alertMessage = ""
    @State private var showingMovieSearch = false
    @State private var selectedGenreForSearch: Genre?
    
    private let validAccessCode = "thunderbolts"
    
    var body: some View {
        ScrollView {
            VStack(spacing: 0) {
                VStack(spacing: 24) {
                    // Title
                    HStack {
                        Text("Submit Your Picks")
                            .font(.system(size: 26, weight: .bold, design: .rounded))
                            .foregroundColor(AppTheme.textPrimary)
                        Spacer()
                    }
                    .padding(.horizontal, 20)
                    .padding(.top, 16)
                
                // Error Message
                if !errorMessage.isEmpty {
                    HStack(spacing: 8) {
                        Image(systemName: "exclamationmark.circle.fill")
                            .font(.caption)
                        Text(errorMessage)
                            .font(.system(size: 14))
                    }
                    .foregroundColor(.red)
                    .padding(.horizontal, 16)
                    .padding(.vertical, 10)
                    .background(
                        RoundedRectangle(cornerRadius: 12)
                            .fill(Color.red.opacity(0.15))
                    )
                    .padding(.horizontal, 20)
                }
                
                VStack(spacing: 20) {
                    // User Info Section
                    VStack(spacing: 16) {
                        // Nickname field
                        VStack(alignment: .leading, spacing: 8) {
                            Text("Nickname")
                                .font(.system(size: 15, weight: .semibold))
                                .foregroundColor(AppTheme.textPrimary.opacity(0.8))
                            TextField("Enter your nickname", text: $nickname)
                                .textFieldStyle(.plain)
                                .padding(14)
                                .background(
                                    RoundedRectangle(cornerRadius: 12)
                                        .fill(Color.white.opacity(0.9))
                                )
                                .overlay(
                                    RoundedRectangle(cornerRadius: 12)
                                        .stroke(Color.gray.opacity(0.2), lineWidth: 1)
                                )
                        }
                        
                        // Password field
                        VStack(alignment: .leading, spacing: 8) {
                            Text("Password")
                                .font(.system(size: 15, weight: .semibold))
                                .foregroundColor(AppTheme.textPrimary.opacity(0.8))
                            SecureField("Check your partiful invite", text: $accessCode)
                                .textFieldStyle(.plain)
                                .padding(14)
                                .background(
                                    RoundedRectangle(cornerRadius: 12)
                                        .fill(Color.white.opacity(0.9))
                                )
                                .overlay(
                                    RoundedRectangle(cornerRadius: 12)
                                        .stroke(Color.gray.opacity(0.2), lineWidth: 1)
                                )
                        }
                    }
                    .padding(.horizontal, 20)
                    
                    // Movies Section
                    VStack(spacing: 16) {
                        // Section Header
                        HStack {
                            Text("Movie Selections")
                                .font(.system(size: 18, weight: .semibold))
                                .foregroundColor(AppTheme.textPrimary)
                            Spacer()
                        }
                        .padding(.horizontal, 20)
                        
                        VStack(spacing: 12) {
                            MoviePickButton(
                                emoji: "🎬",
                                title: "Action / Sci-Fi / Fantasy",
                                movieTitle: actionMovie,
                                action: {
                                    selectedGenreForSearch = .action
                                    showingMovieSearch = true
                                }
                            )
                            
                            MoviePickButton(
                                emoji: "🎭",
                                title: "Drama / Documentary",
                                movieTitle: dramaMovie,
                                action: {
                                    selectedGenreForSearch = .drama
                                    showingMovieSearch = true
                                }
                            )
                            
                            MoviePickButton(
                                emoji: "😂",
                                title: "Comedy / Musical",
                                movieTitle: comedyMovie,
                                action: {
                                    selectedGenreForSearch = .comedy
                                    showingMovieSearch = true
                                }
                            )
                            
                            MoviePickButton(
                                emoji: "😱",
                                title: "Thriller / Horror",
                                movieTitle: thrillerMovie,
                                action: {
                                    selectedGenreForSearch = .thriller
                                    showingMovieSearch = true
                                }
                            )
                        }
                        .padding(.horizontal, 20)
                    }
                    
                    // Submit button
                    Button(action: handleSubmit) {
                        Text("Submit Picks")
                            .font(.system(size: 17, weight: .semibold))
                            .foregroundColor(.white)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 16)
                            .background(
                                RoundedRectangle(cornerRadius: 14)
                                    .fill(AppTheme.accentColor)
                            )
                            .shadow(color: AppTheme.accentColor.opacity(0.3), radius: 8, y: 4)
                    }
                    .padding(.horizontal, 20)
                    .padding(.top, 8)
                }
                .padding(.vertical, 24)
                .background(
                    RoundedRectangle(cornerRadius: 20)
                        .fill(.ultraThinMaterial)
                )
                .padding(.horizontal, 16)
            }
        }
        }
        .sheet(isPresented: $showingMovieSearch) {
            if let genre = selectedGenreForSearch {
                MovieSearchView(
                    genre: genre,
                    selectedMovie: getBindingForGenre(genre)
                )
            }
        }
        .alert(alertTitle, isPresented: $showingAlert) {
            Button("OK", role: .cancel) { }
        } message: {
            Text(alertMessage)
        }
        .onAppear {
            // Analytics: Track screen view
            AnalyticsService.shared.logScreenView(screenName: "Movie Submission", screenClass: "MovieSubmissionView")
        }
    }
    
    private func getBindingForGenre(_ genre: Genre) -> Binding<String> {
        switch genre {
        case .action: return $actionMovie
        case .drama: return $dramaMovie
        case .comedy: return $comedyMovie
        case .thriller: return $thrillerMovie
        }
    }
    
    private func handleSubmit() {
        errorMessage = ""
        
        guard !nickname.isEmpty, !accessCode.isEmpty else {
            errorMessage = "Nickname & Password are required!"
            return
        }
        
        guard accessCode == validAccessCode else {
            errorMessage = "Incorrect Password!"
            return
        }
        
        Task {
            do {
                let db = FirebaseConfig.shared.db
                let currentMonth = getCurrentMonth()
                let userRef = db.collection("Submissions")
                    .document(currentMonth)
                    .collection("users")
                    .document(nickname)
                
                let userSnap = try await userRef.getDocument()
                
                let data: [String: Any] = [
                    "accesscode": accessCode,
                    "action": actionMovie,
                    "drama": dramaMovie,
                    "comedy": comedyMovie,
                    "thriller": thrillerMovie,
                    "submittedAt": Date()
                ]
                
                try await userRef.setData(data, merge: true)
                
                alertTitle = "Success"
                alertMessage = userSnap.exists ? "Submission updated!" : "Submission added!"
                showingAlert = true
                
                // Analytics: Track successful submission
                let genres = [("Action", actionMovie), ("Drama", dramaMovie), ("Comedy", comedyMovie), ("Thriller", thrillerMovie)]
                for (genre, movieTitle) in genres where !movieTitle.isEmpty {
                    // Note: We don't have TMDB IDs here, using 0 as placeholder
                    AnalyticsService.shared.logMovieSubmitted(
                        movieId: 0,
                        movieTitle: movieTitle,
                        genre: genre,
                        nickname: nickname
                    )
                }
                
                // Clear form
                nickname = ""
                accessCode = ""
                actionMovie = ""
                dramaMovie = ""
                comedyMovie = ""
                thrillerMovie = ""
            } catch {
                errorMessage = "🔥 Firestore Error: Failed to submit. Please try again."
                print("Firestore Error:", error)
                
                // Analytics: Track submission error
                AnalyticsService.shared.logError(
                    errorName: "submission_failed",
                    errorMessage: error.localizedDescription,
                    context: "MovieSubmissionView"
                )
            }
        }
    }
}

// MARK: - Movie Pick Button Component

struct MoviePickButton: View {
    let emoji: String
    let title: String
    let movieTitle: String
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            HStack(spacing: 12) {
                Text(emoji)
                    .font(.system(size: 28))
                
                VStack(alignment: .leading, spacing: 4) {
                    Text(title)
                        .font(.system(size: 13, weight: .medium))
                        .foregroundColor(.secondary)
                    
                    if movieTitle.isEmpty {
                        Text("Tap to search")
                            .font(.system(size: 16, weight: .regular))
                            .foregroundColor(.gray)
                    } else {
                        Text(movieTitle)
                            .font(.system(size: 16, weight: .semibold))
                            .foregroundColor(.primary)
                            .lineLimit(1)
                    }
                }
                
                Spacer()
                
                Image(systemName: movieTitle.isEmpty ? "magnifyingglass" : "checkmark.circle.fill")
                    .font(.system(size: 20, weight: .medium))
                    .foregroundColor(movieTitle.isEmpty ? AppTheme.accentColor : .green)
            }
            .padding(16)
            .background(
                RoundedRectangle(cornerRadius: 14)
                    .fill(Color.white.opacity(0.9))
            )
            .overlay(
                RoundedRectangle(cornerRadius: 14)
                    .stroke(movieTitle.isEmpty ? Color.gray.opacity(0.2) : AppTheme.accentColor.opacity(0.3), lineWidth: 1.5)
            )
        }
        .buttonStyle(.plain)
    }
}

// MARK: - Movie Search View

struct MovieSearchView: View {
    let genre: Genre
    @Binding var selectedMovie: String
    @Environment(\.dismiss) private var dismiss
    
    @State private var searchText = ""
    @State private var searchResults: [TMDBMovie] = []
    @State private var isSearching = false
    @State private var hasSearched = false
    
    var body: some View {
        NavigationView {
            VStack(spacing: 0) {
                // Search Bar
                HStack(spacing: 12) {
                    HStack(spacing: 8) {
                        Image(systemName: "magnifyingglass")
                            .foregroundColor(.gray)
                        
                        TextField("Search movies...", text: $searchText)
                            .textFieldStyle(.plain)
                            .onSubmit {
                                searchMovies()
                            }
                        
                        if !searchText.isEmpty {
                            Button(action: {
                                searchText = ""
                                searchResults = []
                                hasSearched = false
                            }) {
                                Image(systemName: "xmark.circle.fill")
                                    .foregroundColor(.gray)
                            }
                        }
                    }
                    .padding(12)
                    .background(
                        RoundedRectangle(cornerRadius: 12)
                            .fill(Color(.systemGray6))
                    )
                    
                    Button("Search") {
                        searchMovies()
                    }
                    .font(.system(size: 16, weight: .semibold))
                    .foregroundColor(.white)
                    .padding(.horizontal, 20)
                    .padding(.vertical, 12)
                    .background(
                        RoundedRectangle(cornerRadius: 12)
                            .fill(AppTheme.accentColor)
                    )
                    .disabled(searchText.isEmpty)
                }
                .padding(.horizontal, 20)
                .padding(.vertical, 16)
                
                Divider()
                
                // Results
                if isSearching {
                    VStack {
                        Spacer()
                        ProgressView()
                            .scaleEffect(1.2)
                            .tint(AppTheme.accentColor)
                        Text("Searching...")
                            .font(.caption)
                            .foregroundColor(.secondary)
                            .padding(.top, 8)
                        Spacer()
                    }
                } else if hasSearched && searchResults.isEmpty {
                    VStack(spacing: 16) {
                        Spacer()
                        Image(systemName: "film.stack")
                            .font(.system(size: 48))
                            .foregroundColor(.gray.opacity(0.5))
                        Text("No movies found")
                            .font(.headline)
                            .foregroundColor(.secondary)
                        Text("Try a different search term")
                            .font(.caption)
                            .foregroundColor(.secondary)
                        Spacer()
                    }
                } else if !searchResults.isEmpty {
                    ScrollView {
                        LazyVStack(spacing: 12) {
                            ForEach(searchResults, id: \.id) { movie in
                                MovieSearchResultRow(movie: movie) {
                                    selectedMovie = movie.title
                                    dismiss()
                                }
                            }
                        }
                        .padding(20)
                    }
                } else {
                    VStack(spacing: 16) {
                        Spacer()
                        Image(systemName: "magnifyingglass")
                            .font(.system(size: 48))
                            .foregroundColor(.gray.opacity(0.5))
                        Text("Search for a movie")
                            .font(.headline)
                            .foregroundColor(.secondary)
                        Text("Enter a movie title and tap Search")
                            .font(.caption)
                            .foregroundColor(.secondary)
                        Spacer()
                    }
                }
            }
            .navigationTitle(genreTitle)
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Cancel") {
                        dismiss()
                    }
                    .foregroundColor(AppTheme.accentColor)
                }
            }
        }
    }
    
    private var genreTitle: String {
        switch genre {
        case .action: return "🎬 Action / Sci-Fi / Fantasy"
        case .drama: return "🎭 Drama / Documentary"
        case .comedy: return "😂 Comedy / Musical"
        case .thriller: return "😱 Thriller / Horror"
        }
    }
    
    private func searchMovies() {
        guard !searchText.isEmpty else { return }
        
        isSearching = true
        hasSearched = false
        
        Task {
            do {
                let urlString = "https://api.themoviedb.org/3/search/movie?api_key=576be59b6712fa18658df8a825ba434e&query=\(searchText.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? searchText)"
                
                guard let url = URL(string: urlString) else {
                    throw URLError(.badURL)
                }
                
                let (data, _) = try await URLSession.shared.data(from: url)
                let response = try JSONDecoder().decode(TMDBSearchResponse.self, from: data)
                
                await MainActor.run {
                    searchResults = response.results.filter { $0.voteCount > 10 }
                    isSearching = false
                    hasSearched = true
                }
            } catch {
                print("Search error: \(error)")
                await MainActor.run {
                    searchResults = []
                    isSearching = false
                    hasSearched = true
                }
            }
        }
    }
}

// MARK: - Movie Search Result Row

struct MovieSearchResultRow: View {
    let movie: TMDBMovie
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            HStack(spacing: 12) {
                // Poster
                if let posterPath = movie.posterPath,
                   let url = URL(string: "https://image.tmdb.org/t/p/w200\(posterPath)") {
                    AsyncImage(url: url) { phase in
                        switch phase {
                        case .success(let image):
                            image
                                .resizable()
                                .aspectRatio(contentMode: .fill)
                                .frame(width: 60, height: 90)
                                .clipShape(RoundedRectangle(cornerRadius: 8))
                        default:
                            RoundedRectangle(cornerRadius: 8)
                                .fill(Color.gray.opacity(0.3))
                                .frame(width: 60, height: 90)
                                .overlay(
                                    Image(systemName: "film")
                                        .foregroundColor(.gray)
                                )
                        }
                    }
                } else {
                    RoundedRectangle(cornerRadius: 8)
                        .fill(Color.gray.opacity(0.3))
                        .frame(width: 60, height: 90)
                        .overlay(
                            Image(systemName: "film")
                                .foregroundColor(.gray)
                        )
                }
                
                // Movie Info
                VStack(alignment: .leading, spacing: 6) {
                    Text(movie.title)
                        .font(.system(size: 16, weight: .semibold))
                        .foregroundColor(.primary)
                        .lineLimit(2)
                    
                    HStack(spacing: 4) {
                        if !movie.releaseDate.isEmpty {
                            Text(String(movie.releaseDate.prefix(4)))
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }
                        
                        if movie.voteAverage > 0 {
                            Text("•")
                                .foregroundColor(.secondary)
                            Image(systemName: "star.fill")
                                .font(.caption2)
                                .foregroundColor(.yellow)
                            Text(String(format: "%.1f", movie.voteAverage))
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }
                    }
                    
                    if !movie.overview.isEmpty {
                        Text(movie.overview)
                            .font(.caption)
                            .foregroundColor(.secondary)
                            .lineLimit(2)
                    }
                }
                
                Spacer()
                
                Image(systemName: "chevron.right")
                    .font(.caption)
                    .foregroundColor(.gray)
            }
            .padding(12)
            .background(
                RoundedRectangle(cornerRadius: 14)
                    .fill(Color.white)
            )
            .overlay(
                RoundedRectangle(cornerRadius: 14)
                    .stroke(Color.gray.opacity(0.2), lineWidth: 1)
            )
        }
        .buttonStyle(.plain)
    }
}

#Preview {
    MovieSubmissionView()
}

