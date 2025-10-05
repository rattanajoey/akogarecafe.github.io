//
//  SelectedMoviesView.swift
//  Movie Club Cafe
//
//  Created by Kavy Rattana on 10/4/25.
//

import SwiftUI
import FirebaseFirestore

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
                // Movie cards grid
                LazyVGrid(columns: [
                    GridItem(.flexible(), spacing: 16),
                    GridItem(.flexible(), spacing: 16)
                ], spacing: 16) {
                    ForEach(Genre.allCases, id: \.self) { genre in
                        MovieCard(
                            genre: genre,
                            movie: getMovie(for: genre),
                            tmdbData: movieDetails[genre],
                            showOverlay: selectedOverlay == genre
                        )
                        .onTapGesture {
                            withAnimation {
                                selectedOverlay = selectedOverlay == genre ? nil : genre
                            }
                        }
                    }
                }
                .padding(.horizontal)
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
        }
    }
}

struct MovieCard: View {
    let genre: Genre
    let movie: Movie?
    let tmdbData: TMDBMovie?
    let showOverlay: Bool
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            // Genre header
            VStack(alignment: .leading, spacing: 4) {
                Text(genre.title)
                    .font(.title3)
                    .fontWeight(.bold)
                    .foregroundColor(AppTheme.textPrimary)
                Text(genre.subtitle)
                    .font(.caption)
                    .foregroundColor(AppTheme.textSecondary)
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            
            if let movie = movie {
                VStack(alignment: .leading, spacing: 0) {
                    // Poster with overlay
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
                                        .aspectRatio(contentMode: .fill)
                                case .failure:
                                    Color.gray.opacity(0.3)
                                        .aspectRatio(2/3, contentMode: .fit)
                                        .overlay(Image(systemName: "photo"))
                                @unknown default:
                                    EmptyView()
                                }
                            }
                            .frame(height: 200)
                            .clipped()
                        } else {
                            Color.gray.opacity(0.3)
                                .frame(height: 200)
                                .overlay(Image(systemName: "film"))
                        }
                        
                        // Overlay with details
                        if showOverlay, let tmdbData = tmdbData {
                            ScrollView {
                                VStack(alignment: .leading, spacing: 8) {
                                    Text(movie.title)
                                        .font(.headline)
                                        .foregroundColor(.white)
                                        .fontWeight(.bold)
                                    
                                    if tmdbData.originalTitle != tmdbData.title {
                                        Text("Original: \(tmdbData.originalTitle)")
                                            .font(.caption)
                                            .foregroundColor(.white)
                                    }
                                    
                                    Text(tmdbData.overview)
                                        .font(.caption)
                                        .foregroundColor(.white)
                                        .lineLimit(nil)
                                    
                                    VStack(alignment: .leading, spacing: 4) {
                                        Text("Language: \(TMDBService.shared.getLanguageName(tmdbData.originalLanguage))")
                                        if let runtime = tmdbData.runtime {
                                            Text("Runtime: \(runtime) min")
                                        }
                                        Text("Release: \(tmdbData.releaseDate)")
                                        
                                        if let budget = tmdbData.budget, budget > 0 {
                                            Text("Budget: $\(formatCurrency(budget))")
                                        }
                                        
                                        if let revenue = tmdbData.revenue, revenue > 0 {
                                            Text("Revenue: $\(formatCurrency(revenue))")
                                        }
                                    }
                                    .font(.caption2)
                                    .foregroundColor(.white)
                                }
                                .padding(12)
                            }
                            .frame(height: 200)
                            .background(Color.black.opacity(0.85))
                        }
                    }
                    .cornerRadius(8)
                    
                    // Movie info
                    VStack(alignment: .leading, spacing: 4) {
                        Text(movie.title)
                            .font(.subheadline)
                            .fontWeight(.medium)
                            .lineLimit(1)
                        
                        // Event Date and Time
                        if let eventDate = movie.eventDate {
                            HStack(spacing: 4) {
                                Image(systemName: "calendar")
                                    .font(.caption2)
                                Text(formatEventDate(eventDate))
                                    .font(.caption)
                                    .fontWeight(.semibold)
                            }
                            .foregroundColor(AppTheme.accentColor)
                            .padding(.vertical, 2)
                        }
                        
                        // Event Location
                        if let location = movie.eventLocation {
                            HStack(spacing: 4) {
                                Image(systemName: "mappin.circle")
                                    .font(.caption2)
                                Text(location)
                                    .font(.caption)
                                    .lineLimit(1)
                            }
                            .foregroundColor(AppTheme.textSecondary)
                        }
                        
                        if let tmdbData = tmdbData {
                            HStack(spacing: 4) {
                                ForEach(0..<5) { index in
                                    Image(systemName: index < Int((tmdbData.voteAverage / 2).rounded()) ? "star.fill" : "star")
                                        .font(.caption2)
                                        .foregroundColor(.yellow)
                                }
                                Text(String(format: "%.1f", tmdbData.voteAverage))
                                    .font(.caption)
                                    .foregroundColor(AppTheme.textSecondary)
                            }
                        }
                        
                        Text("by \(movie.submittedBy)")
                            .font(.caption)
                            .foregroundColor(AppTheme.textSecondary)
                        
                        if let director = movie.director {
                            Text("Dir: \(director)")
                                .font(.caption)
                                .foregroundColor(AppTheme.textSecondary)
                        }
                        
                        if let trailerUrl = tmdbData.flatMap({ TMDBService.shared.getTrailerURL(videos: $0.videos) }) {
                            Link(destination: trailerUrl) {
                                HStack(spacing: 4) {
                                    Image(systemName: "play.circle")
                                    Text("Trailer")
                                }
                                .font(.caption)
                                .foregroundColor(AppTheme.accentColor)
                            }
                        }
                    }
                    .padding(12)
                }
                .background(AppTheme.cardBackground)
                .cornerRadius(8)
            } else {
                Text("No movie selected")
                    .font(.caption)
                    .foregroundColor(AppTheme.textSecondary)
                    .frame(height: 200)
                    .frame(maxWidth: .infinity)
                    .background(AppTheme.cardBackground)
                    .cornerRadius(8)
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

#Preview {
    SelectedMoviesView(
        selections: .constant(MonthlySelections(action: nil, drama: nil, comedy: nil, thriller: nil)),
        selectedMonth: .constant("2025-01"),
        onMonthChange: { _ in }
    )
}

