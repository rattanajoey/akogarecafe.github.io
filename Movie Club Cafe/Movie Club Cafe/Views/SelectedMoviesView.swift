//
//  SelectedMoviesView.swift
//  Movie Club Cafe
//
//  Created by Kavy Rattana on 10/4/25.
//

import SwiftUI
import FirebaseFirestore
import FirebaseAuth
import WebKit

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
    @State private var currentPage: Int = 0
    
    let recapLinks: [String: String] = [
        "2025-06": "zmPYwEZrs_s",
        "2025-05": "_7H2Ny_QxGA"
    ]
    
    var body: some View {
        VStack(spacing: 24) {
            // Month selector and recap button - Minimalist Design
            VStack(spacing: 12) {
                HStack(spacing: 12) {
                    // Month Selector
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
                        HStack(spacing: 8) {
                            Text(getMonthLabel(selectedMonth))
                                .font(.system(size: 28, weight: .semibold, design: .rounded))
                                .foregroundColor(AppTheme.textPrimary)
                            Image(systemName: "chevron.down")
                                .font(.system(size: 16, weight: .semibold))
                                .foregroundColor(AppTheme.accentColor)
                        }
                    }
                    
                    Spacer()
                    
                    // Watch Recap Button - Compact
                    if recapLinks[selectedMonth] != nil {
                        Button(action: {
                            if let videoId = recapLinks[selectedMonth],
                               let url = URL(string: "https://www.youtube.com/watch?v=\(videoId)") {
                                openURL(url)
                                
                                // Analytics: Track recap view
                                AnalyticsService.shared.logFeatureUsed(featureName: "monthly_recap")
                            }
                        }) {
                            HStack(spacing: 6) {
                                Image(systemName: "play.circle.fill")
                                    .font(.system(size: 16, weight: .medium))
                                Text("Recap")
                                    .font(.system(size: 15, weight: .semibold))
                            }
                            .foregroundColor(.white)
                            .padding(.horizontal, 14)
                            .padding(.vertical, 8)
                            .background(
                                Capsule()
                                    .fill(AppTheme.accentColor.opacity(0.9))
                            )
                        }
                    }
                }
                .padding(.horizontal, 20)
            }
            .padding(.top, 8)
            
            if isLoading {
                ProgressView()
                    .tint(AppTheme.accentColor)
                    .scaleEffect(1.5)
                    .frame(height: 400)
            } else {
                // Swipeable carousel with edge preview
                ZStack(alignment: .bottom) {
                    TabView(selection: $currentPage) {
                        ForEach(Array(Genre.allCases.enumerated()), id: \.element) { index, genre in
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
                            .tag(index)
                        }
                    }
                    .tabViewStyle(.page(indexDisplayMode: .never))
                    .frame(maxWidth: .infinity)
                    .frame(height: 680)
                    
                    // Custom page indicator - Minimalist Apple Design
                    CarouselPageIndicator(currentPage: $currentPage)
                }
            }
        }
        .onAppear {
            loadAvailableMonths()
            
            // Analytics: Track screen view
            AnalyticsService.shared.logScreenView(screenName: "Monthly Selections", screenClass: "SelectedMoviesView")
        }
        .onChange(of: selectedMonth) { _, newMonth in
            loadMovieDetails()
            
            // Analytics: Track month change
            AnalyticsService.shared.logMonthChanged(monthId: newMonth)
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
    @State private var showVideoPlayer = false
    @State private var showShareSheet = false
    @State private var swipeAnimationOffset: CGFloat = 0
    
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
                
                // Swipe indicator at top - Animated
                HStack(spacing: 8) {
                    Image(systemName: "chevron.left")
                        .opacity(swipeAnimationOffset < 0 ? 1.0 : 0.4)
                    Text("Swipe to explore")
                        .font(.caption)
                        .fontWeight(.medium)
                    Image(systemName: "chevron.right")
                        .opacity(swipeAnimationOffset > 0 ? 1.0 : 0.4)
                }
                .font(.caption)
                .foregroundColor(.white)
                .padding(.horizontal, 16)
                .padding(.vertical, 8)
                .background(
                    Capsule()
                        .fill(.ultraThinMaterial.opacity(0.7))
                        .overlay(
                            Capsule()
                                .stroke(Color.white.opacity(0.3), lineWidth: 1)
                        )
                )
                .shadow(color: .black.opacity(0.2), radius: 8, y: 2)
                .offset(x: swipeAnimationOffset)
                .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .top)
                .padding(.top, 60)
                .onAppear {
                    // Animate the swipe indicator
                    withAnimation(.easeInOut(duration: 1.5).repeatForever(autoreverses: true)) {
                        swipeAnimationOffset = 10
                    }
                }
                
                if let movie = movie {
                    VStack(alignment: .leading, spacing: 16) {
                        // Large poster with checkmark badge and play button
                        ZStack {
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
                            
                            // Play button overlay (center)
                            if let trailerUrl = tmdbData.flatMap({ TMDBService.shared.getTrailerURL(videos: $0.videos) }) {
                                Button(action: {
                                    showVideoPlayer = true
                                }) {
                                    ZStack {
                                        Circle()
                                            .fill(.ultraThinMaterial)
                                            .frame(width: 70, height: 70)
                                        
                                        Circle()
                                            .fill(AppTheme.accentColor)
                                            .frame(width: 60, height: 60)
                                        
                                        Image(systemName: "play.fill")
                                            .font(.system(size: 24, weight: .bold))
                                            .foregroundColor(.white)
                                            .offset(x: 2)
                                    }
                                    .shadow(color: .black.opacity(0.3), radius: 8, y: 4)
                                }
                            }
                            
                            // Checkmark badge when watched - minimal (top right)
                            VStack {
                                HStack {
                                    Spacer()
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
                                Spacer()
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
                            // Title and rating with share button
                            HStack(alignment: .top, spacing: 12) {
                                VStack(alignment: .leading, spacing: 8) {
                                    Text(movie.title)
                                        .font(.system(size: 26, weight: .bold))
                                        .foregroundColor(.white)
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
                                                .foregroundColor(.white.opacity(0.9))
                                        }
                                    }
                                }
                                
                                Spacer()
                                
                                // Share button
                                Button(action: {
                                    showShareSheet = true
                                }) {
                                    ZStack {
                                        Circle()
                                            .fill(.ultraThinMaterial)
                                            .frame(width: 44, height: 44)
                                        
                                        Image(systemName: "square.and.arrow.up")
                                            .font(.system(size: 18, weight: .semibold))
                                            .foregroundColor(.white)
                                    }
                                }
                            }
                            
                            // Event info - compact and prominent
                            VStack(alignment: .leading, spacing: 6) {
                                if let eventDate = movie.eventDate {
                                    VStack(alignment: .leading, spacing: 4) {
                                        HStack(spacing: 6) {
                                            Image(systemName: "calendar")
                                                .font(.subheadline)
                                                .foregroundColor(.white.opacity(0.9))
                                            Text(formatEventDate(eventDate))
                                                .font(.subheadline)
                                                .foregroundColor(.white)
                                        }
                                        HStack(spacing: 6) {
                                            Image(systemName: "clock")
                                                .font(.subheadline)
                                                .foregroundColor(.white.opacity(0.9))
                                            Text(formatEventTime(eventDate))
                                                .font(.system(size: 17, weight: .semibold))
                                                .foregroundColor(.white)
                                        }
                                    }
                                    .padding(10)
                                    .background(
                                        RoundedRectangle(cornerRadius: 10)
                                            .fill(AppTheme.accentColor.opacity(0.3))
                                    )
                                }
                                
                                if let location = movie.eventLocation {
                                    HStack(spacing: 6) {
                                        Image(systemName: "mappin.circle")
                                            .font(.subheadline)
                                            .foregroundColor(.white.opacity(0.9))
                                        Text(location)
                                            .font(.subheadline)
                                            .foregroundColor(.white)
                                    }
                                }
                                
                                // Submitted by - subtle
                                HStack(spacing: 6) {
                                    Image(systemName: "person.fill")
                                        .font(.caption)
                                        .foregroundColor(.white.opacity(0.7))
                                    Text("by \(movie.submittedBy)")
                                        .font(.caption)
                                        .foregroundColor(.white.opacity(0.8))
                                }
                            }
                            
                            // Avatar stack - compact
                            if !watchers.isEmpty {
                                WatcherAvatarStack(watchers: watchers)
                            }
                            
                            Divider()
                                .padding(.vertical, 4)
                        }
                        
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
                            
                            // Streaming providers - compact
                            if let tmdbData = tmdbData,
                               let providers = tmdbData.watchProviders,
                               let countryProviders = TMDBService.shared.getWatchProviders(watchProviders: providers),
                               let streamingProviders = countryProviders.flatrate,
                               !streamingProviders.isEmpty {
                                VStack(alignment: .leading, spacing: 8) {
                                    Text("Available on")
                                        .font(.caption)
                                        .foregroundColor(.white.opacity(0.8))
                                    
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
                                                .foregroundColor(.white.opacity(0.8))
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
                    }
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
            .sheet(isPresented: $showVideoPlayer) {
                if let trailerUrl = tmdbData.flatMap({ TMDBService.shared.getTrailerURL(videos: $0.videos) }),
                   let videoId = extractYouTubeVideoID(from: trailerUrl) {
                    YouTubePlayerView(videoID: videoId, movieTitle: movie?.title ?? "Trailer")
                }
            }
            .sheet(isPresented: $showShareSheet) {
                if let movie = movie,
                   let activityVC = DeepLinkService.shared.createShareSheet(
                    movieTitle: movie.title,
                    monthId: monthId,
                    genre: genre.rawValue,
                    tmdbId: tmdbData?.id,
                    message: "Check out \"\(movie.title)\" from our \(genre.title) selection! 🎬"
                   ) {
                    ActivityViewController(activityViewController: activityVC)
                }
            }
        }
    }
    
    // Helper function to extract YouTube video ID
    private func extractYouTubeVideoID(from url: URL) -> String? {
        let urlString = url.absoluteString
        if let queryItems = URLComponents(string: urlString)?.queryItems,
           let videoId = queryItems.first(where: { $0.name == "v" })?.value {
            return videoId
        }
        return nil
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
        formatter.timeStyle = .none
        return formatter.string(from: date)
    }
    
    private func formatEventTime(_ date: Date) -> String {
        let formatter = DateFormatter()
        formatter.dateStyle = .none
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

// MARK: - YouTube Player View

struct YouTubePlayerView: View {
    let videoID: String
    let movieTitle: String
    @Environment(\.dismiss) private var dismiss
    @State private var showingOptions = true
    
    var body: some View {
        NavigationView {
            VStack(spacing: 0) {
                if showingOptions {
                    // Show options to open video
                    YouTubeOpenOptionsView(videoID: videoID, movieTitle: movieTitle)
                } else {
                    // Fallback web view
                    YouTubeWebView(videoID: videoID)
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                        .background(Color.black)
                }
            }
            .navigationTitle(movieTitle)
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Done") {
                        dismiss()
                    }
                    .foregroundColor(AppTheme.accentColor)
                }
            }
        }
    }
}

struct YouTubeOpenOptionsView: View {
    let videoID: String
    let movieTitle: String
    @Environment(\.dismiss) private var dismiss
    
    var body: some View {
        VStack(spacing: 24) {
            Spacer()
            
            // Icon
            Image(systemName: "play.circle.fill")
                .font(.system(size: 80))
                .foregroundColor(AppTheme.accentColor)
            
            VStack(spacing: 8) {
                Text("Watch Trailer")
                    .font(.system(size: 24, weight: .bold, design: .rounded))
                    .foregroundColor(.primary)
                
                Text(movieTitle)
                    .font(.system(size: 16, design: .rounded))
                    .foregroundColor(.secondary)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, 20)
            }
            
            Spacer()
            
            // Options
            VStack(spacing: 16) {
                // YouTube App Button
                Button(action: openInYouTubeApp) {
                    HStack(spacing: 12) {
                        Image(systemName: "logo.youtube")
                            .font(.system(size: 20))
                        
                        Text("Open in YouTube App")
                            .font(.system(size: 17, weight: .semibold, design: .rounded))
                        
                        Spacer()
                        
                        Image(systemName: "arrow.up.right")
                            .font(.system(size: 14))
                    }
                    .foregroundColor(.white)
                    .padding(16)
                    .background(
                        RoundedRectangle(cornerRadius: 14)
                            .fill(Color.red)
                    )
                }
                
                // Safari Button
                Button(action: openInSafari) {
                    HStack(spacing: 12) {
                        Image(systemName: "safari")
                            .font(.system(size: 20))
                        
                        Text("Open in Safari")
                            .font(.system(size: 17, weight: .semibold, design: .rounded))
                        
                        Spacer()
                        
                        Image(systemName: "arrow.up.right")
                            .font(.system(size: 14))
                    }
                    .foregroundColor(.primary)
                    .padding(16)
                    .background(
                        RoundedRectangle(cornerRadius: 14)
                            .fill(.ultraThinMaterial)
                    )
                    .overlay(
                        RoundedRectangle(cornerRadius: 14)
                            .stroke(Color.gray.opacity(0.2), lineWidth: 1)
                    )
                }
            }
            .padding(.horizontal, 20)
            .padding(.bottom, 40)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Color(UIColor.systemBackground))
    }
    
    private func openInYouTubeApp() {
        // Try YouTube app first
        if let youtubeURL = URL(string: "youtube://\(videoID)"),
           UIApplication.shared.canOpenURL(youtubeURL) {
            UIApplication.shared.open(youtubeURL)
            dismiss()
        } else {
            // Fallback to YouTube website
            openInSafari()
        }
    }
    
    private func openInSafari() {
        if let webURL = URL(string: "https://www.youtube.com/watch?v=\(videoID)") {
            UIApplication.shared.open(webURL)
            dismiss()
        }
    }
}

struct YouTubeWebView: UIViewRepresentable {
    let videoID: String
    
    func makeUIView(context: Context) -> WKWebView {
        let configuration = WKWebViewConfiguration()
        configuration.allowsInlineMediaPlayback = true
        configuration.mediaTypesRequiringUserActionForPlayback = []
        
        let webView = WKWebView(frame: .zero, configuration: configuration)
        webView.scrollView.isScrollEnabled = false
        webView.backgroundColor = .black
        webView.navigationDelegate = context.coordinator
        return webView
    }
    
    func updateUIView(_ webView: WKWebView, context: Context) {
        let embedHTML = """
        <!DOCTYPE html>
        <html>
        <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
            <style>
                * {
                    margin: 0;
                    padding: 0;
                }
                body {
                    background-color: #000;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 100vh;
                    overflow: hidden;
                }
                .video-container {
                    position: relative;
                    width: 100%;
                    padding-bottom: 56.25%;
                }
                iframe {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    border: none;
                }
            </style>
        </head>
        <body>
            <div class="video-container">
                <iframe
                    src="https://www.youtube.com/embed/\(videoID)?playsinline=1&rel=0&modestbranding=1"
                    frameborder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowfullscreen
                    referrerpolicy="strict-origin-when-cross-origin">
                </iframe>
            </div>
        </body>
        </html>
        """
        webView.loadHTMLString(embedHTML, baseURL: URL(string: "https://www.youtube.com"))
    }
    
    func makeCoordinator() -> Coordinator {
        Coordinator()
    }
    
    class Coordinator: NSObject, WKNavigationDelegate {
        func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) {
            print("WebView failed to load: \(error.localizedDescription)")
        }
        
        func webView(_ webView: WKWebView, didFailProvisionalNavigation navigation: WKNavigation!, withError error: Error) {
            print("WebView failed provisional navigation: \(error.localizedDescription)")
        }
    }
}

// MARK: - Carousel Page Indicator - Minimalist Apple Design

struct CarouselPageIndicator: View {
    @Binding var currentPage: Int
    @State private var isPulsing = false
    
    var body: some View {
        HStack(spacing: 16) {
            ForEach(Array(Genre.allCases.enumerated()), id: \.offset) { index, genre in
                VStack(spacing: 8) {
                    // Dot indicator
                    Circle()
                        .fill(
                            index == currentPage
                                ? AppTheme.accentColor
                                : Color.white.opacity(0.5)
                        )
                        .frame(
                            width: index == currentPage ? 10 : 8,
                            height: index == currentPage ? 10 : 8
                        )
                        .overlay(
                            Circle()
                                .stroke(Color.white.opacity(0.3), lineWidth: 1)
                        )
                        .shadow(
                            color: index == currentPage ? AppTheme.accentColor.opacity(0.5) : .clear,
                            radius: 4,
                            y: 0
                        )
                        .scaleEffect(index == currentPage ? (isPulsing ? 1.2 : 1.0) : 1.0)
                        .animation(.easeInOut(duration: 1.5).repeatForever(autoreverses: true), value: isPulsing)
                    
                    // Genre emoji
                    Text(genreEmoji(for: genre))
                        .font(.system(size: index == currentPage ? 20 : 18))
                        .opacity(index == currentPage ? 1.0 : 0.7)
                        .scaleEffect(index == currentPage ? 1.1 : 1.0)
                }
                .animation(.spring(response: 0.3, dampingFraction: 0.7), value: currentPage)
            }
        }
        .padding(.horizontal, 24)
        .padding(.vertical, 12)
        .background(
            Capsule()
                .fill(.ultraThinMaterial.opacity(0.8))
                .overlay(
                    Capsule()
                        .stroke(Color.white.opacity(0.2), lineWidth: 1)
                )
                .shadow(color: .black.opacity(0.15), radius: 12, y: 4)
        )
        .padding(.bottom, 16)
        .onAppear {
            // Start pulsing animation after a short delay
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
                isPulsing = true
            }
        }
    }
    
    private func genreEmoji(for genre: Genre) -> String {
        switch genre {
        case .action: return "🎬"
        case .drama: return "🎭"
        case .comedy: return "😂"
        case .thriller: return "😱"
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


