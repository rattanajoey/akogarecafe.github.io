//
//  GenrePoolView.swift
//  Movie Club Cafe
//
//  Created by Kavy Rattana on 10/4/25.
//

import SwiftUI

struct GenrePoolView: View {
    let pools: GenrePools
    @State private var expandedGenres: Set<Genre> = []
    @State private var selectedMovie: Movie?
    @State private var selectedGenre: Genre?
    @State private var showingMovieDetail = false
    
    var body: some View {
        ScrollView {
            VStack(spacing: 0) {
                // Header
                HStack {
                    VStack(alignment: .leading, spacing: 4) {
                        Text("Genre Pools")
                            .font(.system(size: 32, weight: .bold, design: .rounded))
                            .foregroundColor(AppTheme.textPrimary)
                        
                        Text("\(totalMovieCount) movies in pools")
                            .font(.system(size: 15, design: .rounded))
                            .foregroundColor(.secondary)
                    }
                    Spacer()
                }
                .padding(.horizontal, 20)
                .padding(.top, 12)
                .padding(.bottom, 24)
                
                // Genre Sections
                VStack(spacing: 12) {
                    ForEach(Genre.allCases, id: \.self) { genre in
                        GenrePoolSection(
                            genre: genre,
                            movies: getMovies(for: genre),
                            isExpanded: expandedGenres.contains(genre),
                            onToggle: { toggleGenre(genre) },
                            onMovieTap: { movie in
                                selectedMovie = movie
                                selectedGenre = genre
                                showingMovieDetail = true
                                
                                // Analytics: Track movie viewed in genre pool
                                AnalyticsService.shared.logMovieViewed(
                                    movieId: movie.tmdbId,
                                    movieTitle: movie.title,
                                    genre: genre.rawValue,
                                    source: "genre_pool"
                                )
                            }
                        )
                    }
                }
                .padding(.horizontal, 16)
                .padding(.bottom, 20)
            }
        }
        .sheet(isPresented: $showingMovieDetail) {
            if let movie = selectedMovie {
                MovieDetailSheet(
                    movie: movie,
                    monthId: nil, // Genre pool movies aren't associated with a specific month
                    genre: selectedGenre?.rawValue
                )
            }
        }
        .onAppear {
            // Analytics: Track screen view
            AnalyticsService.shared.logScreenView(screenName: "Genre Pools", screenClass: "GenrePoolView")
            
            // Analytics: Log pool sizes for each genre
            for genre in Genre.allCases {
                let movieCount = getMovies(for: genre).count
                AnalyticsService.shared.logGenrePoolViewed(genre: genre.rawValue, poolSize: movieCount)
            }
        }
    }
    
    private func getMovies(for genre: Genre) -> [Movie] {
        switch genre {
        case .action: return pools.action
        case .drama: return pools.drama
        case .comedy: return pools.comedy
        case .thriller: return pools.thriller
        }
    }
    
    private var totalMovieCount: Int {
        pools.action.count + pools.drama.count + pools.comedy.count + pools.thriller.count
    }
    
    private func toggleGenre(_ genre: Genre) {
        withAnimation(.spring(response: 0.4, dampingFraction: 0.8)) {
            if expandedGenres.contains(genre) {
                expandedGenres.remove(genre)
            } else {
                expandedGenres.insert(genre)
            }
        }
    }
}

struct GenrePoolSection: View {
    let genre: Genre
    let movies: [Movie]
    let isExpanded: Bool
    let onToggle: () -> Void
    let onMovieTap: (Movie) -> Void
    
    var body: some View {
        VStack(spacing: 0) {
            // Header Button
            Button(action: onToggle) {
                HStack(spacing: 12) {
                    // Genre Emoji
                    Text(genreEmoji)
                        .font(.system(size: 28))
                    
                    // Genre Info
                    VStack(alignment: .leading, spacing: 2) {
                        Text(genre.title)
                            .font(.system(size: 18, weight: .semibold, design: .rounded))
                            .foregroundColor(AppTheme.textPrimary)
                        
                        Text("\(movies.count) movie\(movies.count == 1 ? "" : "s")")
                            .font(.system(size: 14, design: .rounded))
                            .foregroundColor(.secondary)
                    }
                    
                    Spacer()
                    
                    // Chevron
                    Image(systemName: isExpanded ? "chevron.up" : "chevron.down")
                        .font(.system(size: 14, weight: .semibold))
                        .foregroundColor(.secondary)
                        .rotationEffect(.degrees(isExpanded ? 0 : 0))
                }
                .padding(16)
                .background(
                    RoundedRectangle(cornerRadius: 16)
                        .fill(.ultraThinMaterial)
                )
                .overlay(
                    RoundedRectangle(cornerRadius: 16)
                        .stroke(Color.gray.opacity(0.2), lineWidth: 1.5)
                )
            }
            .buttonStyle(PlainButtonStyle())
            
            // Expanded Content
            if isExpanded {
                VStack(spacing: 8) {
                    if movies.isEmpty {
                        // Empty State
                        VStack(spacing: 8) {
                            Image(systemName: "film.stack")
                                .font(.system(size: 32))
                                .foregroundColor(.secondary.opacity(0.5))
                            
                            Text("No movies yet")
                                .font(.system(size: 15, design: .rounded))
                                .foregroundColor(.secondary)
                            
                            Text("Submit movies to add them to this pool")
                                .font(.system(size: 13, design: .rounded))
                                .foregroundColor(.secondary.opacity(0.8))
                                .multilineTextAlignment(.center)
                        }
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 32)
                        .padding(.horizontal, 20)
                    } else {
                        // Movies List
                        ForEach(movies) { movie in
                            MovieRowView(movie: movie)
                                .onTapGesture {
                                    onMovieTap(movie)
                                }
                        }
                    }
                }
                .padding(.top, 8)
                .transition(.opacity.combined(with: .scale(scale: 0.95, anchor: .top)))
            }
        }
    }
    
    private var genreEmoji: String {
        switch genre {
        case .action: return "🎬"
        case .drama: return "🎭"
        case .comedy: return "😂"
        case .thriller: return "😱"
        }
    }
}

struct MovieRowView: View {
    let movie: Movie
    @State private var posterUrl: String?
    @State private var isLoadingPoster = false
    
    var body: some View {
        HStack(spacing: 12) {
            // Movie Poster or Placeholder
            Group {
                if let posterUrl = posterUrl, let url = URL(string: "https://image.tmdb.org/t/p/w200\(posterUrl)") {
                    AsyncImage(url: url) { phase in
                        switch phase {
                        case .success(let image):
                            image
                                .resizable()
                                .aspectRatio(contentMode: .fill)
                        case .failure(_):
                            placeholderPoster
                        case .empty:
                            if isLoadingPoster {
                                loadingPoster
                            } else {
                                placeholderPoster
                            }
                        @unknown default:
                            placeholderPoster
                        }
                    }
                } else if let existingPoster = movie.posterUrl, let url = URL(string: "https://image.tmdb.org/t/p/w200\(existingPoster)") {
                    AsyncImage(url: url) { phase in
                        switch phase {
                        case .success(let image):
                            image
                                .resizable()
                                .aspectRatio(contentMode: .fill)
                        case .failure(_), .empty:
                            placeholderPoster
                        @unknown default:
                            placeholderPoster
                        }
                    }
                } else {
                    if isLoadingPoster {
                        loadingPoster
                    } else {
                        placeholderPoster
                    }
                }
            }
            .frame(width: 50, height: 75)
            .clipShape(RoundedRectangle(cornerRadius: 8))
            .overlay(
                RoundedRectangle(cornerRadius: 8)
                    .stroke(Color.gray.opacity(0.2), lineWidth: 1)
            )
            
            // Movie Info
            VStack(alignment: .leading, spacing: 4) {
                Text(movie.title)
                    .font(.system(size: 15, weight: .semibold, design: .rounded))
                    .foregroundColor(.primary)
                    .lineLimit(2)
                
                if let year = movie.year {
                    Text(year)
                        .font(.system(size: 13, design: .rounded))
                        .foregroundColor(.secondary)
                }
                
                HStack(spacing: 4) {
                    Image(systemName: "person.circle.fill")
                        .font(.system(size: 10))
                        .foregroundColor(.secondary.opacity(0.7))
                    
                    Text(movie.submittedBy)
                        .font(.system(size: 12, design: .rounded))
                        .foregroundColor(.secondary)
                }
            }
            
            Spacer()
        }
        .padding(12)
        .background(
            RoundedRectangle(cornerRadius: 12)
                .fill(Color.gray.opacity(0.05))
        )
        .task {
            if posterUrl == nil && movie.posterUrl == nil {
                await fetchPoster()
            }
        }
    }
    
    private var placeholderPoster: some View {
        ZStack {
            RoundedRectangle(cornerRadius: 8)
                .fill(Color.gray.opacity(0.2))
            
            Image(systemName: "film")
                .font(.system(size: 20))
                .foregroundColor(.secondary.opacity(0.5))
        }
    }
    
    private var loadingPoster: some View {
        ZStack {
            RoundedRectangle(cornerRadius: 8)
                .fill(Color.gray.opacity(0.15))
            
            ProgressView()
                .scaleEffect(0.7)
        }
    }
    
    private func fetchPoster() async {
        isLoadingPoster = true
        
        do {
            if let tmdbMovie = try await TMDBService.shared.searchMovie(title: movie.title) {
                await MainActor.run {
                    self.posterUrl = tmdbMovie.posterPath
                    self.isLoadingPoster = false
                }
            } else {
                await MainActor.run {
                    self.isLoadingPoster = false
                }
            }
        } catch {
            await MainActor.run {
                self.isLoadingPoster = false
            }
        }
    }
}

// MARK: - Movie Detail Sheet

struct MovieDetailSheet: View {
    let movie: Movie
    let monthId: String?
    let genre: String?
    
    @Environment(\.dismiss) private var dismiss
    @State private var tmdbMovie: TMDBMovie?
    @State private var isLoading = true
    @State private var error: Error?
    @State private var showShareSheet = false
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: 0) {
                    if isLoading {
                        loadingView
                    } else if let error = error {
                        errorView(error)
                    } else if let tmdbMovie = tmdbMovie {
                        movieDetailContent(tmdbMovie)
                    }
                }
            }
            .background(Color(UIColor.systemBackground))
            .navigationTitle(movie.title)
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button(action: {
                        showShareSheet = true
                    }) {
                        Image(systemName: "square.and.arrow.up")
                            .foregroundColor(AppTheme.accentColor)
                    }
                }
                
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Done") {
                        dismiss()
                    }
                    .foregroundColor(AppTheme.accentColor)
                }
            }
            .sheet(isPresented: $showShareSheet) {
                if let monthId = monthId,
                   let genre = genre,
                   let activityVC = DeepLinkService.shared.createShareSheet(
                    movieTitle: movie.title,
                    monthId: monthId,
                    genre: genre,
                    tmdbId: tmdbMovie?.id,
                    message: "Check out \"\(movie.title)\" on Movie Club Cafe! 🎬"
                   ) {
                    ActivityViewController(activityViewController: activityVC)
                }
            }
        }
        .task {
            await loadMovieDetails()
        }
    }
    
    private var loadingView: some View {
        VStack(spacing: 16) {
            Spacer()
            ProgressView()
                .scaleEffect(1.5)
            Text("Loading movie details...")
                .font(.system(size: 15, design: .rounded))
                .foregroundColor(.secondary)
            Spacer()
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .padding()
    }
    
    private func errorView(_ error: Error) -> some View {
        VStack(spacing: 16) {
            Spacer()
            Image(systemName: "exclamationmark.triangle.fill")
                .font(.system(size: 50))
                .foregroundColor(.orange)
            
            Text("Unable to load movie details")
                .font(.system(size: 18, weight: .semibold, design: .rounded))
            
            Text(error.localizedDescription)
                .font(.system(size: 14, design: .rounded))
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal)
            
            Button(action: { Task { await loadMovieDetails() } }) {
                Text("Retry")
                    .font(.system(size: 16, weight: .semibold, design: .rounded))
                    .foregroundColor(.white)
                    .padding(.horizontal, 24)
                    .padding(.vertical, 12)
                    .background(
                        RoundedRectangle(cornerRadius: 12)
                            .fill(AppTheme.accentColor)
                    )
            }
            
            Spacer()
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .padding()
    }
    
    @ViewBuilder
    private func movieDetailContent(_ tmdbMovie: TMDBMovie) -> some View {
        VStack(spacing: 0) {
            // Backdrop Image
            if let backdropPath = tmdbMovie.backdropPath {
                AsyncImage(url: URL(string: "https://image.tmdb.org/t/p/w780\(backdropPath)")) { phase in
                    switch phase {
                    case .success(let image):
                        image
                            .resizable()
                            .aspectRatio(contentMode: .fill)
                            .frame(height: 220)
                            .clipped()
                    case .failure(_), .empty:
                        backdropPlaceholder
                    @unknown default:
                        backdropPlaceholder
                    }
                }
            } else {
                backdropPlaceholder
            }
            
            VStack(spacing: 20) {
                // Poster and Basic Info
                HStack(alignment: .top, spacing: 16) {
                    // Poster
                    if let posterPath = tmdbMovie.posterPath {
                        AsyncImage(url: URL(string: "https://image.tmdb.org/t/p/w342\(posterPath)")) { phase in
                            switch phase {
                            case .success(let image):
                                image
                                    .resizable()
                                    .aspectRatio(contentMode: .fill)
                            case .failure(_), .empty:
                                posterPlaceholder
                            @unknown default:
                                posterPlaceholder
                            }
                        }
                        .frame(width: 100, height: 150)
                        .clipShape(RoundedRectangle(cornerRadius: 12))
                        .shadow(color: .black.opacity(0.3), radius: 8, x: 0, y: 4)
                    }
                    
                    VStack(alignment: .leading, spacing: 8) {
                        // Title
                        Text(tmdbMovie.title)
                            .font(.system(size: 22, weight: .bold, design: .rounded))
                            .foregroundColor(.primary)
                        
                        // Year
                        if !tmdbMovie.releaseDate.isEmpty {
                            Text(String(tmdbMovie.releaseDate.prefix(4)))
                                .font(.system(size: 16, design: .rounded))
                                .foregroundColor(.secondary)
                        }
                        
                        // Rating
                        HStack(spacing: 4) {
                            Image(systemName: "star.fill")
                                .foregroundColor(.yellow)
                                .font(.system(size: 14))
                            Text(String(format: "%.1f", tmdbMovie.voteAverage))
                                .font(.system(size: 16, weight: .semibold, design: .rounded))
                            Text("(\(tmdbMovie.voteCount))")
                                .font(.system(size: 14, design: .rounded))
                                .foregroundColor(.secondary)
                        }
                        
                        // Runtime
                        if let runtime = tmdbMovie.runtime, runtime > 0 {
                            HStack(spacing: 4) {
                                Image(systemName: "clock")
                                    .font(.system(size: 12))
                                    .foregroundColor(.secondary)
                                Text("\(runtime) min")
                                    .font(.system(size: 14, design: .rounded))
                                    .foregroundColor(.secondary)
                            }
                        }
                        
                        // Submitter
                        HStack(spacing: 4) {
                            Image(systemName: "person.circle.fill")
                                .font(.system(size: 12))
                                .foregroundColor(.secondary)
                            Text("Submitted by \(movie.submittedBy)")
                                .font(.system(size: 13, design: .rounded))
                                .foregroundColor(.secondary)
                        }
                    }
                    
                    Spacer()
                }
                .padding(.horizontal, 20)
                .padding(.top, -40)
                
                // Genres
                if let genres = tmdbMovie.genres, !genres.isEmpty {
                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack(spacing: 8) {
                            ForEach(genres, id: \.id) { genre in
                                Text(genre.name)
                                    .font(.system(size: 13, weight: .medium, design: .rounded))
                                    .foregroundColor(.primary)
                                    .padding(.horizontal, 12)
                                    .padding(.vertical, 6)
                                    .background(
                                        Capsule()
                                            .fill(.ultraThinMaterial)
                                    )
                                    .overlay(
                                        Capsule()
                                            .stroke(Color.gray.opacity(0.2), lineWidth: 1)
                                    )
                            }
                        }
                        .padding(.horizontal, 20)
                    }
                }
                
                // Overview
                if !tmdbMovie.overview.isEmpty {
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Overview")
                            .font(.system(size: 18, weight: .bold, design: .rounded))
                            .foregroundColor(.primary)
                        
                        Text(tmdbMovie.overview)
                            .font(.system(size: 15, design: .rounded))
                            .foregroundColor(.secondary)
                            .lineSpacing(4)
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding(.horizontal, 20)
                }
                
                // Watch Providers
                streamingProvidersView(for: tmdbMovie)
                
                // Trailer Button
                if let videos = tmdbMovie.videos,
                   let trailerUrl = TMDBService.shared.getTrailerURL(videos: videos) {
                    Button(action: {
                        UIApplication.shared.open(trailerUrl)
                    }) {
                        HStack(spacing: 12) {
                            Image(systemName: "play.circle.fill")
                                .font(.system(size: 20))
                            
                            Text("Watch Trailer")
                                .font(.system(size: 17, weight: .semibold, design: .rounded))
                        }
                        .foregroundColor(.white)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 14)
                        .background(
                            RoundedRectangle(cornerRadius: 14)
                                .fill(AppTheme.accentColor)
                        )
                    }
                    .padding(.horizontal, 20)
                }
                
                Spacer(minLength: 20)
            }
            .padding(.top, 20)
            .padding(.bottom, 40)
        }
    }
    
    private var backdropPlaceholder: some View {
        ZStack {
            LinearGradient(
                gradient: Gradient(colors: [
                    Color.gray.opacity(0.3),
                    Color.gray.opacity(0.1)
                ]),
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            .frame(height: 220)
            
            Image(systemName: "film")
                .font(.system(size: 50))
                .foregroundColor(.secondary.opacity(0.5))
        }
    }
    
    private var posterPlaceholder: some View {
        ZStack {
            RoundedRectangle(cornerRadius: 12)
                .fill(Color.gray.opacity(0.2))
            
            Image(systemName: "film")
                .font(.system(size: 30))
                .foregroundColor(.secondary.opacity(0.5))
        }
    }
    
    @ViewBuilder
    private func streamingProvidersView(for tmdbMovie: TMDBMovie) -> some View {
        let providers = TMDBService.shared.getStreamingProviders(watchProviders: tmdbMovie.watchProviders)
        
        if !providers.isEmpty {
            VStack(alignment: .leading, spacing: 12) {
                Text("Available on")
                    .font(.system(size: 18, weight: .bold, design: .rounded))
                    .foregroundColor(.primary)
                
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 12) {
                        ForEach(providers) { provider in
                            if let logoUrl = TMDBService.shared.getProviderLogoURL(logoPath: provider.logoPath) {
                                AsyncImage(url: logoUrl) { image in
                                    image
                                        .resizable()
                                        .aspectRatio(contentMode: .fit)
                                } placeholder: {
                                    RoundedRectangle(cornerRadius: 8)
                                        .fill(Color.gray.opacity(0.2))
                                }
                                .frame(width: 50, height: 50)
                                .clipShape(RoundedRectangle(cornerRadius: 8))
                            }
                        }
                    }
                }
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(.horizontal, 20)
        }
    }
    
    private func loadMovieDetails() async {
        isLoading = true
        error = nil
        
        do {
            // Search for movie by title
            if let foundMovie = try await TMDBService.shared.searchMovie(title: movie.title) {
                // Fetch full details
                let details = try await TMDBService.shared.getMovieDetails(movieId: foundMovie.id)
                
                await MainActor.run {
                    self.tmdbMovie = details
                    self.isLoading = false
                }
            } else {
                await MainActor.run {
                    self.error = NSError(domain: "", code: -1, userInfo: [NSLocalizedDescriptionKey: "Movie not found"])
                    self.isLoading = false
                }
            }
        } catch {
            await MainActor.run {
                self.error = error
                self.isLoading = false
            }
        }
    }
}

#Preview {
    GenrePoolView(pools: GenrePools(
        action: [
            Movie(title: "The Matrix", submittedBy: "Alice", director: "Wachowskis", year: "1999", posterUrl: nil),
            Movie(title: "Inception", submittedBy: "Bob", director: "Christopher Nolan", year: "2010", posterUrl: nil),
            Movie(title: "Mad Max: Fury Road", submittedBy: "Charlie", director: "George Miller", year: "2015", posterUrl: nil)
        ],
        drama: [
            Movie(title: "The Shawshank Redemption", submittedBy: "Diana", director: nil, year: "1994", posterUrl: nil)
        ],
        comedy: [],
        thriller: [
            Movie(title: "Se7en", submittedBy: "Eve", director: nil, year: "1995", posterUrl: nil)
        ]
    ))
}

