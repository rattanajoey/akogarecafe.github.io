//
//  SelectedMoviesView.swift
//  Movie Club Cafe
//
//  Created by Kavy Rattana on 10/4/25.
//

import SwiftUI
import FirebaseFirestore
import FirebaseAuth

struct SelectedMoviesView: View {
    @Binding var selections: MonthlySelections
    @Binding var selectedMonth: String
    var onMonthChange: (String) -> Void
    
    @Environment(\.openURL) private var openURL
    
    @State private var availableMonths: [MonthOption] = []
    @State private var isLoading = false
    @State private var movieDetails: [Genre: TMDBMovie] = [:]
    @State private var showingRecap = false
    @State private var selectedOverlay: Genre? = nil
    @State private var movieWatchers: [Genre: [MovieWatcher]] = [:]
    @State private var watchedStatus: [Genre: Bool] = [:]
    
    let recapLinks: [String: String] = [
        "2025-06": "zmPYwEZrs_s",
        "2025-05": "_7H2Ny_QxGA"
    ]
    
    var body: some View {
        VStack(spacing: 20) {
            // Month selector and recap button
            HStack(spacing: 12) {
                Menu {
                    ForEach(availableMonths) { option in
                        Button(action: {
                            selectedMonth = option.id
                            onMonthChange(option.id)
                        }) {
                            Text(option.label)
                        }
                    }
                } label: {
                    HStack {
                        Text(getMonthLabel(selectedMonth))
                            .font(.title2)
                            .fontWeight(.medium)
                            .foregroundColor(AppTheme.textPrimary)
                        Image(systemName: "chevron.down")
                            .foregroundColor(AppTheme.accentColor)
                            .font(.title3)
                    }
                }
                
                if recapLinks[selectedMonth] != nil {
                    Button(action: {
                        if let videoId = recapLinks[selectedMonth],
                           let url = URL(string: "https://www.youtube.com/watch?v=\(videoId)") {
                            openURL(url)
                        }
                    }) {
                        HStack {
                            Image(systemName: "play.circle")
                            Text("Watch Recap")
                        }
                        .padding(.horizontal, 12)
                        .padding(.vertical, 6)
                        .background(Color.clear)
                        .foregroundColor(AppTheme.accentColor)
                        .overlay(
                            RoundedRectangle(cornerRadius: 8)
                                .stroke(AppTheme.accentColor, lineWidth: 1)
                        )
                    }
                }
            }
            .padding(.top, 20)
            
            if isLoading {
                ProgressView()
                    .tint(AppTheme.accentColor)
                    .scaleEffect(1.5)
                    .frame(height: 400)
            } else {
                // Swipeable carousel with edge preview
                ZStack(alignment: .bottom) {
                    TabView {
                        ForEach(Genre.allCases, id: \.self) { genre in
                            MovieCarouselCard(
                                genre: genre,
                                movie: getMovie(for: genre),
                                tmdbData: movieDetails[genre],
                                monthId: selectedMonth,
                                watchers: movieWatchers[genre] ?? [],
                                isWatched: watchedStatus[genre] ?? false,
                                onWatchToggle: {
                                    handleWatchToggle(genre: genre)
                                }
                            )
                            .tag(genre)
                        }
                    }
                    .tabViewStyle(.page(indexDisplayMode: .never))
                    .frame(maxWidth: .infinity)
                    .frame(height: 680)
                    
                    // Custom page indicator with genre names
                    HStack(spacing: 8) {
                        ForEach(Genre.allCases, id: \.self) { genre in
                            Circle()
                                .fill(AppTheme.accentColor.opacity(0.8))
                                .frame(width: 8, height: 8)
                        }
                    }
                    .padding(.bottom, 20)
                    .background(
                        Capsule()
                            .fill(.ultraThinMaterial)
                            .frame(height: 32)
                            .padding(.horizontal, -16)
                    )
                }
            }
        }
        .onAppear {
            loadAvailableMonths()
        }
        .onChange(of: selectedMonth) { _, _ in
            loadMovieDetails()
        }
        .onChange(of: selections) { _, _ in
            loadMovieDetails()
        }
    }
    
    private func handleWatchToggle(genre: Genre) {
        guard let movie = getMovie(for: genre) else { return }
        
        Task {
            do {
                WatchlistService.shared.toggleWatchStatus(
                    movie: movie,
                    genre: genre,
                    monthId: selectedMonth
                ) { result in
                    switch result {
                    case .success(let isNowWatched):
                        Task {
                            await MainActor.run {
                                watchedStatus[genre] = isNowWatched
                            }
                            // Reload watchers to update avatar stack
                            await loadWatchersAndStatus()
                        }
                    case .failure(let error):
                        print("Error toggling watch status: \(error)")
                    }
                }
            }
        }
    }
    
    private func getMovie(for genre: Genre) -> Movie? {
        switch genre {
        case .action: return selections.action
        case .drama: return selections.drama
        case .comedy: return selections.comedy
        case .thriller: return selections.thriller
        }
    }
    
    private func getMonthLabel(_ monthId: String) -> String {
        availableMonths.first(where: { $0.id == monthId })?.label ?? monthId
    }
    
    private func loadAvailableMonths() {
        Task {
            let db = FirebaseConfig.shared.db
            do {
                let snapshot = try await db.collection("MonthlySelections").getDocuments()
                var months: [MonthOption] = []
                
                for document in snapshot.documents {
                    let components = document.documentID.split(separator: "-")
                    if components.count == 2,
                       let year = Int(components[0]),
                       let month = Int(components[1]) {
                        let date = Calendar.current.date(from: DateComponents(year: year, month: month)) ?? Date()
                        let formatter = DateFormatter()
                        formatter.dateFormat = "MMMM yyyy"
                        let label = formatter.string(from: date)
                        months.append(MonthOption(id: document.documentID, label: label))
                    }
                }
                
                months.sort { $0.id > $1.id }
                availableMonths = months
                
                if !months.isEmpty && selectedMonth.isEmpty {
                    selectedMonth = months[0].id
                    onMonthChange(months[0].id)
                }
            } catch {
                print("Error fetching months: \(error)")
            }
        }
    }
    
    private func loadMovieDetails() {
        Task {
            isLoading = true
            defer { isLoading = false }
            
            var details: [Genre: TMDBMovie] = [:]
            
            for genre in Genre.allCases {
                if let movie = getMovie(for: genre) {
                    do {
                        if let searchResult = try await TMDBService.shared.searchMovie(title: movie.title) {
                            let movieData = try await TMDBService.shared.getMovieDetails(movieId: searchResult.id)
                            details[genre] = movieData
                        }
                    } catch {
                        print("Error fetching TMDB data for \(genre.rawValue): \(error)")
                    }
                }
            }
            
            movieDetails = details
            
            // Load watchers and watch status
            await loadWatchersAndStatus()
        }
    }
    
    private func loadWatchersAndStatus() async {
        guard let userId = Auth.auth().currentUser?.uid else { return }
        
        for genre in Genre.allCases {
            if let movie = getMovie(for: genre) {
                do {
                    // Fetch watchers
                    let watchers = try await WatchlistService.shared.fetchMovieWatchers(
                        movieTitle: movie.title,
                        monthId: selectedMonth,
                        genre: genre.rawValue
                    )
                    await MainActor.run {
                        movieWatchers[genre] = watchers
                    }
                    
                    // Check watch status
                    let isWatched = try await WatchlistService.shared.checkIfWatched(
                        movieTitle: movie.title,
                        monthId: selectedMonth,
                        genre: genre.rawValue,
                        userId: userId
                    )
                    await MainActor.run {
                        watchedStatus[genre] = isWatched
                    }
                } catch {
                    print("Error loading watchers for \(genre.rawValue): \(error)")
                }
            }
        }
    }
}

struct MovieCarouselCard: View {
    let genre: Genre
    let movie: Movie?
    let tmdbData: TMDBMovie?
    let monthId: String
    let watchers: [MovieWatcher]
    let isWatched: Bool
    let onWatchToggle: () -> Void
    
    @State private var showDetails = false
    @Environment(\.openURL) private var openURL
    
    var body: some View {
        GeometryReader { geometry in
            ZStack(alignment: .bottom) {
                // Background poster with gradient overlay
                if let posterPath = tmdbData?.posterPath,
                   let url = TMDBService.shared.getPosterURL(posterPath: posterPath) {
                    AsyncImage(url: url) { phase in
                        switch phase {
                        case .success(let image):
                            image
                                .resizable()
                                .aspectRatio(contentMode: .fill)
                                .frame(width: geometry.size.width, height: geometry.size.height)
                                .clipped()
                        default:
                            Color.black
                        }
                    }
                    .overlay(
                        LinearGradient(
                            gradient: Gradient(colors: [
                                Color.clear,
                                Color.black.opacity(0.3),
                                Color.black.opacity(0.95)
                            ]),
                            startPoint: .top,
                            endPoint: .bottom
                        )
                    )
                } else {
                    Color.black
                }
                
                // Swipe indicator at top
                HStack(spacing: 8) {
                    Image(systemName: "chevron.left")
                    Text("Swipe")
                    Image(systemName: "chevron.right")
                }
                .font(.caption)
                .foregroundColor(.white.opacity(0.6))
                .padding(.horizontal, 16)
                .padding(.vertical, 8)
                .background(Color.black.opacity(0.3))
                .cornerRadius(20)
                .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .top)
                .padding(.top, 60)
                
                if let movie = movie {
                    // Large poster with checkmark badge
                    ZStack(alignment: .topTrailing) {
                        if let posterPath = tmdbData?.posterPath,
                           let url = TMDBService.shared.getPosterURL(posterPath: posterPath) {
                            AsyncImage(url: url) { phase in
                                switch phase {
                                case .empty:
                                    Color.gray.opacity(0.3)
                                        .aspectRatio(2/3, contentMode: .fit)
                                        .overlay(ProgressView())
                                case .success(let image):
                                    image
                                        .resizable()
                                        .aspectRatio(contentMode: .fit)
                                        .frame(maxWidth: .infinity)
                                        .cornerRadius(12)
                                        .shadow(radius: 10)
                                case .failure:
                                    Color.gray.opacity(0.3)
                                        .aspectRatio(2/3, contentMode: .fit)
                                        .overlay(Image(systemName: "photo"))
                                        .cornerRadius(12)
                                @unknown default:
                                    EmptyView()
                                }
                            }
                            .frame(maxHeight: 400)
                        } else {
                            Color.gray.opacity(0.3)
                                .frame(height: 400)
                                .overlay(Image(systemName: "film").font(.largeTitle))
                                .cornerRadius(12)
                        }
                            
                            // Checkmark badge when watched - minimal
                            if isWatched {
                                Circle()
                                    .fill(Color.green)
                                    .frame(width: 32, height: 32)
                                    .overlay(
                                        Image(systemName: "checkmark")
                                            .font(.system(size: 14, weight: .bold))
                                            .foregroundColor(.white)
                                    )
                                    .shadow(color: .black.opacity(0.3), radius: 4)
                                    .padding(12)
                            }
                        }
                        .frame(width: geometry.size.width - 40)
                        .aspectRatio(2/3, contentMode: .fit)
                        .cornerRadius(16)
                        .shadow(color: .black.opacity(0.15), radius: 12, y: 6)
                        .padding(.horizontal, 20)
                        .padding(.top, 12)
                        
                        // Movie info - Clean and minimal
                        VStack(alignment: .leading, spacing: 12) {
                            // Title and rating
                            VStack(alignment: .leading, spacing: 8) {
                                Text(movie.title)
                                    .font(.system(size: 26, weight: .bold))
                                    .foregroundColor(AppTheme.textPrimary)
                                    .lineLimit(2)
                                
                                // Rating - compact
                                if let tmdbData = tmdbData {
                                    HStack(spacing: 4) {
                                        ForEach(0..<5) { index in
                                            Image(systemName: index < Int((tmdbData.voteAverage / 2).rounded()) ? "star.fill" : "star")
                                                .font(.subheadline)
                                                .foregroundColor(.yellow)
                                        }
                                        Text(String(format: "%.1f", tmdbData.voteAverage))
                                            .font(.subheadline)
                                            .fontWeight(.semibold)
                                            .foregroundColor(AppTheme.textSecondary)
                                    }
                                }
                            }
                            
                            // Event info - compact
                            VStack(alignment: .leading, spacing: 6) {
                                if let eventDate = movie.eventDate {
                                    HStack(spacing: 6) {
                                        Image(systemName: "calendar")
                                            .font(.subheadline)
                                            .foregroundColor(AppTheme.accentColor)
                                        Text(formatEventDate(eventDate))
                                            .font(.subheadline)
                                            .foregroundColor(AppTheme.textPrimary)
                                    }
                                }
                                
                                if let location = movie.eventLocation {
                                    HStack(spacing: 6) {
                                        Image(systemName: "mappin.circle")
                                            .font(.subheadline)
                                            .foregroundColor(AppTheme.accentColor)
                                        Text(location)
                                            .font(.subheadline)
                                            .foregroundColor(AppTheme.textPrimary)
                                    }
                                }
                                
                                // Submitted by - subtle
                                HStack(spacing: 6) {
                                    Image(systemName: "person.fill")
                                        .font(.caption)
                                        .foregroundColor(AppTheme.textSecondary)
                                    Text("by \(movie.submittedBy)")
                                        .font(.caption)
                                        .foregroundColor(AppTheme.textSecondary)
                                }
                            }
                            
                            // Avatar stack - compact
                            if !watchers.isEmpty {
                                WatcherAvatarStack(watchers: watchers)
                            }
                            
                            Divider()
                                .padding(.vertical, 4)
                        
                        // Action buttons
                        VStack(spacing: 12) {
                            // Watch/Unmark button
                            Button(action: onWatchToggle) {
                                HStack {
                                    Image(systemName: isWatched ? "checkmark.circle.fill" : "eye.circle")
                                        .font(.title2)
                                    Text(isWatched ? "Unmark as Watched" : "Mark as Watched")
                                        .font(.headline)
                                }
                                .frame(maxWidth: .infinity)
                                .padding()
                                .background(isWatched ? Color.green : AppTheme.accentColor)
                                .foregroundColor(.white)
                                .cornerRadius(12)
                            }
                            
                            if let trailerUrl = tmdbData.flatMap({ TMDBService.shared.getTrailerURL(videos: $0.videos) }) {
                                Button(action: {
                                    openURL(trailerUrl)
                                }) {
                                    HStack {
                                        Image(systemName: "play.circle.fill")
                                            .font(.title2)
                                        Text("Watch Trailer")
                                            .font(.headline)
                                    }
                                    .frame(maxWidth: .infinity)
                                    .padding()
                                    .background(AppTheme.accentColor.opacity(0.8))
                                    .foregroundColor(.white)
                                    .cornerRadius(12)
                                }
                            }
                            
                            // Streaming providers - compact
                            if let tmdbData = tmdbData,
                               let providers = tmdbData.watchProviders,
                               let countryProviders = TMDBService.shared.getWatchProviders(watchProviders: providers),
                               let streamingProviders = countryProviders.flatrate,
                               !streamingProviders.isEmpty {
                                VStack(alignment: .leading, spacing: 8) {
                                    Text("Available on")
                                        .font(.caption)
                                        .foregroundColor(AppTheme.textSecondary)
                                    
                                    HStack(spacing: 8) {
                                        ForEach(streamingProviders.prefix(4)) { provider in
                                            if let logoUrl = TMDBService.shared.getProviderLogoURL(logoPath: provider.logoPath) {
                                                AsyncImage(url: logoUrl) { phase in
                                                    if case .success(let image) = phase {
                                                        image
                                                            .resizable()
                                                            .aspectRatio(contentMode: .fit)
                                                            .frame(width: 36, height: 36)
                                                            .cornerRadius(6)
                                                    }
                                                }
                                            }
                                        }
                                        if streamingProviders.count > 4 {
                                            Text("+\(streamingProviders.count - 4)")
                                                .font(.caption)
                                                .foregroundColor(AppTheme.textSecondary)
                                        }
                                    }
                                }
                            }
                            
                            // Show Details button
                            if let tmdbData = tmdbData {
                                Button(action: {
                                    withAnimation(.spring(response: 0.3)) {
                                        showDetails.toggle()
                                    }
                                }) {
                                    HStack {
                                        Text(showDetails ? "Hide Details" : "Show Details")
                                            .font(.subheadline)
                                            .fontWeight(.medium)
                                        Image(systemName: showDetails ? "chevron.up" : "chevron.down")
                                            .font(.caption)
                                    }
                                    .foregroundColor(AppTheme.accentColor)
                                }
                                
                                if showDetails {
                                    VStack(alignment: .leading, spacing: 12) {
                                        Text(tmdbData.overview)
                                            .font(.subheadline)
                                            .foregroundColor(AppTheme.textPrimary.opacity(0.8))
                                            .fixedSize(horizontal: false, vertical: true)
                                        
                                        VStack(alignment: .leading, spacing: 6) {
                                            if let runtime = tmdbData.runtime {
                                                InfoRow(label: "Runtime", value: "\(runtime) min")
                                            }
                                            InfoRow(label: "Release", value: tmdbData.releaseDate)
                                            if let director = movie.director {
                                                InfoRow(label: "Director", value: director)
                                            }
                                        }
                                    }
                                    .padding(.top, 8)
                                    .transition(.opacity.combined(with: .move(edge: .top)))
                                }
                            }
                        }
                        .padding(.horizontal, 20)
                        .padding(.bottom, 40)
                    } else {
                        // No movie state
                        VStack(spacing: 16) {
                            Image(systemName: "film")
                                .font(.system(size: 60))
                                .foregroundColor(AppTheme.textSecondary.opacity(0.3))
                            Text("No movie selected")
                                .font(.headline)
                                .foregroundColor(AppTheme.textSecondary)
                        }
                        .frame(maxWidth: .infinity)
                        .frame(height: 500)
                    }
                }
            }
        }
    }
    
    // Helper view for info rows
    struct InfoRow: View {
        let label: String
        let value: String
        
        var body: some View {
            HStack {
                Text(label)
                    .font(.caption)
                    .foregroundColor(AppTheme.textSecondary)
                Spacer()
                Text(value)
                    .font(.caption)
                    .fontWeight(.medium)
                    .foregroundColor(AppTheme.textPrimary)
            }
        }
    }
    
    private func formatCurrency(_ value: Int) -> String {
        let formatter = NumberFormatter()
        formatter.numberStyle = .decimal
        return formatter.string(from: NSNumber(value: value)) ?? "\(value)"
    }
    
    private func formatEventDate(_ date: Date) -> String {
        let formatter = DateFormatter()
        formatter.dateStyle = .medium
        formatter.timeStyle = .short
        return formatter.string(from: date)
    }
}

// MARK: - Watcher Avatar Stack Component

struct WatcherAvatarStack: View {
    let watchers: [MovieWatcher]
    let maxVisible: Int = 5
    
    var body: some View {
        HStack(spacing: -12) {
            ForEach(Array(watchers.prefix(maxVisible).enumerated()), id: \.element.id) { index, watcher in
                WatcherAvatar(watcher: watcher)
                    .zIndex(Double(maxVisible - index))
            }
            
            if watchers.count > maxVisible {
                ZStack {
                    Circle()
                        .fill(AppTheme.accentColor)
                        .frame(width: 40, height: 40)
                        .overlay(
                            Circle()
                                .stroke(Color.white, lineWidth: 2)
                        )
                    
                    Text("+\(watchers.count - maxVisible)")
                        .font(.caption)
                        .fontWeight(.bold)
                        .foregroundColor(.white)
                }
                .zIndex(0)
            }
        }
        .padding(.horizontal, 12)
    }
}

struct WatcherAvatar: View {
    let watcher: MovieWatcher
    
    var body: some View {
        ZStack {
            if let photoURL = watcher.photoURL, let url = URL(string: photoURL) {
                AsyncImage(url: url) { phase in
                    switch phase {
                    case .success(let image):
                        image
                            .resizable()
                            .scaledToFill()
                            .frame(width: 40, height: 40)
                            .clipShape(Circle())
                            .overlay(
                                Circle()
                                    .stroke(Color.white, lineWidth: 2)
                            )
                    case .empty, .failure:
                        defaultAvatar
                    @unknown default:
                        defaultAvatar
                    }
                }
            } else {
                defaultAvatar
            }
        }
        .shadow(radius: 2)
    }
    
    private var defaultAvatar: some View {
        ZStack {
            Circle()
                .fill(LinearGradient(
                    gradient: Gradient(colors: [AppTheme.accentColor, AppTheme.accentColor.opacity(0.7)]),
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                ))
                .frame(width: 40, height: 40)
                .overlay(
                    Circle()
                        .stroke(Color.white, lineWidth: 2)
                )
            
            Text(String(watcher.userName.prefix(1)).uppercased())
                .font(.system(size: 16, weight: .bold))
                .foregroundColor(.white)
        }
    }
}

#Preview {
    SelectedMoviesView(
        selections: .constant(MonthlySelections(action: nil, drama: nil, comedy: nil, thriller: nil)),
        selectedMonth: .constant("2025-01"),
        onMonthChange: { _ in }
    )
}


