//
//  AnalyticsView.swift
//  Movie Club Cafe
//
//  Analytics dashboard with charts and stats
//

import SwiftUI
import Charts
#if canImport(FirebaseFirestore)
import FirebaseFirestore
#endif

struct AnalyticsView: View {
    @State private var monthlySelections: [MonthlySelection] = []
    @State private var poolStats: PoolStatistics?
    @State private var isLoading = true
    @State private var selectedTimeRange: TimeRange = .all
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: 24) {
                    // Time Range Picker
                    timeRangePicker
                    
                    if isLoading {
                        loadingView
                    } else {
                        // Overview Stats Cards
                        overviewStatsSection
                        
                        // Movies Per Genre Chart
                        genreDistributionChart
                        
                        // Monthly Selections Chart
                        monthlySelectionsChart
                        
                        // Pool Statistics
                        poolStatisticsSection
                        
                        // Top Contributors
                        topContributorsSection
                    }
                }
                .padding(.horizontal, 16)
                .padding(.vertical, 20)
            }
            .background(Color(UIColor.systemGroupedBackground))
            .navigationTitle("Analytics")
            .navigationBarTitleDisplayMode(.large)
            .task {
                await loadAnalyticsData()
            }
        }
    }
    
    // MARK: - Time Range Picker
    
    private var timeRangePicker: some View {
        Picker("Time Range", selection: $selectedTimeRange) {
            ForEach(TimeRange.allCases, id: \.self) { range in
                Text(range.title).tag(range)
            }
        }
        .pickerStyle(.segmented)
        .padding(.horizontal, 4)
    }
    
    // MARK: - Loading View
    
    private var loadingView: some View {
        VStack(spacing: 16) {
            ProgressView()
                .scaleEffect(1.5)
            Text("Loading analytics...")
                .font(.system(size: 15, design: .rounded))
                .foregroundColor(.secondary)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 60)
    }
    
    // MARK: - Overview Stats Section
    
    private var overviewStatsSection: some View {
        VStack(spacing: 12) {
            Text("Overview")
                .font(.system(size: 20, weight: .bold, design: .rounded))
                .frame(maxWidth: .infinity, alignment: .leading)
                .padding(.horizontal, 4)
            
            LazyVGrid(columns: [
                GridItem(.flexible()),
                GridItem(.flexible())
            ], spacing: 12) {
                StatCard(
                    title: "Total Movies",
                    value: "\(totalMoviesCount)",
                    icon: "film.stack",
                    color: AppTheme.accentColor
                )
                
                StatCard(
                    title: "Months Active",
                    value: "\(monthlySelections.count)",
                    icon: "calendar",
                    color: .blue
                )
                
                StatCard(
                    title: "Pool Movies",
                    value: "\(poolStats?.totalMovies ?? 0)",
                    icon: "tray.full",
                    color: .purple
                )
                
                StatCard(
                    title: "Contributors",
                    value: "\(uniqueContributors.count)",
                    icon: "person.3",
                    color: .green
                )
            }
        }
    }
    
    // MARK: - Genre Distribution Chart
    
    private var genreDistributionChart: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Movies by Genre")
                .font(.system(size: 20, weight: .bold, design: .rounded))
                .padding(.horizontal, 4)
            
            VStack(spacing: 0) {
                if !genreData.isEmpty {
                    Chart(genreData) { item in
                        BarMark(
                            x: .value("Count", item.count),
                            y: .value("Genre", item.genre.title)
                        )
                        .foregroundStyle(genreColor(for: item.genre))
                        .annotation(position: .trailing) {
                            Text("\(item.count)")
                                .font(.system(size: 12, weight: .semibold, design: .rounded))
                                .foregroundColor(.secondary)
                        }
                    }
                    .frame(height: 200)
                    .chartXAxis(.hidden)
                    .chartYAxis {
                        AxisMarks { value in
                            AxisValueLabel {
                                if let genre = value.as(String.self) {
                                    HStack(spacing: 6) {
                                        Text(genreEmoji(for: genre))
                                        Text(genre)
                                            .font(.system(size: 14, design: .rounded))
                                    }
                                }
                            }
                        }
                    }
                    .padding()
                } else {
                    Text("No data available")
                        .font(.system(size: 15, design: .rounded))
                        .foregroundColor(.secondary)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 40)
                }
            }
            .background(
                RoundedRectangle(cornerRadius: 16)
                    .fill(Color(UIColor.systemBackground))
            )
            .overlay(
                RoundedRectangle(cornerRadius: 16)
                    .stroke(Color.gray.opacity(0.2), lineWidth: 1)
            )
        }
    }
    
    // MARK: - Monthly Selections Chart
    
    private var monthlySelectionsChart: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Monthly Selections")
                .font(.system(size: 20, weight: .bold, design: .rounded))
                .padding(.horizontal, 4)
            
            VStack(spacing: 0) {
                if !filteredMonthlyData.isEmpty {
                    Chart(filteredMonthlyData) { item in
                        LineMark(
                            x: .value("Month", item.monthName),
                            y: .value("Movies", item.movieCount)
                        )
                        .foregroundStyle(AppTheme.accentColor)
                        .symbol(Circle().strokeBorder(lineWidth: 2))
                        
                        PointMark(
                            x: .value("Month", item.monthName),
                            y: .value("Movies", item.movieCount)
                        )
                        .foregroundStyle(AppTheme.accentColor)
                    }
                    .frame(height: 200)
                    .chartYAxis {
                        AxisMarks(position: .leading) { value in
                            AxisValueLabel {
                                if let count = value.as(Int.self) {
                                    Text("\(count)")
                                        .font(.system(size: 12, design: .rounded))
                                }
                            }
                        }
                    }
                    .chartXAxis {
                        AxisMarks { value in
                            AxisValueLabel {
                                if let month = value.as(String.self) {
                                    Text(month)
                                        .font(.system(size: 11, design: .rounded))
                                        .rotationEffect(.degrees(-45))
                                }
                            }
                        }
                    }
                    .padding()
                } else {
                    Text("No data available")
                        .font(.system(size: 15, design: .rounded))
                        .foregroundColor(.secondary)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 40)
                }
            }
            .background(
                RoundedRectangle(cornerRadius: 16)
                    .fill(Color(UIColor.systemBackground))
            )
            .overlay(
                RoundedRectangle(cornerRadius: 16)
                    .stroke(Color.gray.opacity(0.2), lineWidth: 1)
            )
        }
    }
    
    // MARK: - Pool Statistics Section
    
    private var poolStatisticsSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Current Pool Stats")
                .font(.system(size: 20, weight: .bold, design: .rounded))
                .padding(.horizontal, 4)
            
            VStack(spacing: 12) {
                ForEach(Genre.allCases, id: \.self) { genre in
                    PoolStatRow(
                        genre: genre,
                        count: poolStats?.genreCounts[genre] ?? 0
                    )
                }
            }
            .padding(16)
            .background(
                RoundedRectangle(cornerRadius: 16)
                    .fill(Color(UIColor.systemBackground))
            )
            .overlay(
                RoundedRectangle(cornerRadius: 16)
                    .stroke(Color.gray.opacity(0.2), lineWidth: 1)
            )
        }
    }
    
    // MARK: - Top Contributors Section
    
    private var topContributorsSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Top Contributors")
                .font(.system(size: 20, weight: .bold, design: .rounded))
                .padding(.horizontal, 4)
            
            VStack(spacing: 12) {
                ForEach(Array(topContributorsData.enumerated()), id: \.element.name) { index, contributor in
                    ContributorRow(
                        rank: index + 1,
                        name: contributor.name,
                        count: contributor.count
                    )
                }
            }
            .padding(16)
            .background(
                RoundedRectangle(cornerRadius: 16)
                    .fill(Color(UIColor.systemBackground))
            )
            .overlay(
                RoundedRectangle(cornerRadius: 16)
                    .stroke(Color.gray.opacity(0.2), lineWidth: 1)
            )
        }
    }
    
    // MARK: - Computed Properties
    
    private var totalMoviesCount: Int {
        monthlySelections.reduce(0) { $0 + $1.movies.count }
    }
    
    private var uniqueContributors: Set<String> {
        var contributors = Set<String>()
        for selection in monthlySelections {
            for movie in selection.movies {
                contributors.insert(movie.submittedBy)
            }
        }
        return contributors
    }
    
    private var genreData: [GenreCount] {
        var counts: [Genre: Int] = [:]
        for selection in monthlySelections {
            for movie in selection.movies {
                if let genre = movie.genre {
                    counts[genre, default: 0] += 1
                }
            }
        }
        return counts.map { GenreCount(genre: $0.key, count: $0.value) }
            .sorted { $0.count > $1.count }
    }
    
    private var filteredMonthlyData: [MonthlyChartData] {
        let filtered = filterByTimeRange(monthlySelections)
        return filtered.map { selection in
            MonthlyChartData(
                monthName: selection.monthName,
                movieCount: selection.movies.count
            )
        }
    }
    
    private var topContributorsData: [ContributorData] {
        var contributions: [String: Int] = [:]
        for selection in monthlySelections {
            for movie in selection.movies {
                contributions[movie.submittedBy, default: 0] += 1
            }
        }
        return contributions.map { ContributorData(name: $0.key, count: $0.value) }
            .sorted { $0.count > $1.count }
            .prefix(5)
            .map { $0 }
    }
    
    // MARK: - Helper Functions
    
    private func filterByTimeRange(_ selections: [MonthlySelection]) -> [MonthlySelection] {
        let now = Date()
        switch selectedTimeRange {
        case .threeMonths:
            let threeMonthsAgo = Calendar.current.date(byAdding: .month, value: -3, to: now)!
            return selections.filter { $0.date >= threeMonthsAgo }
        case .sixMonths:
            let sixMonthsAgo = Calendar.current.date(byAdding: .month, value: -6, to: now)!
            return selections.filter { $0.date >= sixMonthsAgo }
        case .year:
            let oneYearAgo = Calendar.current.date(byAdding: .year, value: -1, to: now)!
            return selections.filter { $0.date >= oneYearAgo }
        case .all:
            return selections
        }
    }
    
    private func genreColor(for genre: Genre) -> Color {
        switch genre {
        case .action: return .red
        case .drama: return .blue
        case .comedy: return .yellow
        case .thriller: return .purple
        }
    }
    
    private func genreEmoji(for genreName: String) -> String {
        switch genreName {
        case "Action": return "🎬"
        case "Drama": return "🎭"
        case "Comedy": return "😂"
        case "Thriller": return "😱"
        default: return "🎬"
        }
    }
    
    // MARK: - Data Loading
    
    private func loadAnalyticsData() async {
        isLoading = true
        
        #if canImport(FirebaseFirestore)
        let db = FirebaseConfig.shared.db
        
        do {
            // Load monthly selections
            let selectionsSnapshot = try await db.collection("MonthlySelections")
                .order(by: "month", descending: false)
                .getDocuments()
            
            var selections: [MonthlySelection] = []
            for doc in selectionsSnapshot.documents {
                let data = doc.data()
                let monthStr = doc.documentID
                
                var movies: [SelectedMovie] = []
                for genre in Genre.allCases {
                    if let movieData = data[genre.rawValue] as? [String: Any],
                       let title = movieData["title"] as? String,
                       let submittedBy = movieData["submittedBy"] as? String {
                        movies.append(SelectedMovie(
                            title: title,
                            submittedBy: submittedBy,
                            genre: genre
                        ))
                    }
                }
                
                if let date = parseMonthString(monthStr) {
                    selections.append(MonthlySelection(
                        id: doc.documentID,
                        monthName: formatMonthName(monthStr),
                        date: date,
                        movies: movies
                    ))
                }
            }
            
            // Load pool statistics
            let poolSnapshot = try await db.collection("GenrePools")
                .document("current")
                .getDocument()
            
            if let poolData = poolSnapshot.data() {
                var genreCounts: [Genre: Int] = [:]
                var totalCount = 0
                
                for genre in Genre.allCases {
                    if let movies = poolData[genre.rawValue] as? [[String: Any]] {
                        genreCounts[genre] = movies.count
                        totalCount += movies.count
                    }
                }
                
                await MainActor.run {
                    self.monthlySelections = selections
                    self.poolStats = PoolStatistics(
                        totalMovies: totalCount,
                        genreCounts: genreCounts
                    )
                    self.isLoading = false
                }
            }
        } catch {
            print("Error loading analytics: \(error)")
            await MainActor.run {
                self.isLoading = false
            }
        }
        #else
        await MainActor.run {
            self.isLoading = false
        }
        #endif
    }
    
    private func parseMonthString(_ monthStr: String) -> Date? {
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM"
        return formatter.date(from: monthStr)
    }
    
    private func formatMonthName(_ monthStr: String) -> String {
        guard let date = parseMonthString(monthStr) else { return monthStr }
        let formatter = DateFormatter()
        formatter.dateFormat = "MMM yy"
        return formatter.string(from: date)
    }
}

// MARK: - Supporting Views

struct StatCard: View {
    let title: String
    let value: String
    let icon: String
    let color: Color
    
    var body: some View {
        VStack(spacing: 12) {
            Image(systemName: icon)
                .font(.system(size: 32))
                .foregroundColor(color)
            
            VStack(spacing: 4) {
                Text(value)
                    .font(.system(size: 28, weight: .bold, design: .rounded))
                    .foregroundColor(.primary)
                
                Text(title)
                    .font(.system(size: 13, design: .rounded))
                    .foregroundColor(.secondary)
            }
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 20)
        .background(
            RoundedRectangle(cornerRadius: 16)
                .fill(Color(UIColor.systemBackground))
        )
        .overlay(
            RoundedRectangle(cornerRadius: 16)
                .stroke(color.opacity(0.3), lineWidth: 2)
        )
    }
}

struct PoolStatRow: View {
    let genre: Genre
    let count: Int
    
    var body: some View {
        HStack(spacing: 12) {
            Text(genreEmoji)
                .font(.system(size: 24))
            
            Text(genre.title)
                .font(.system(size: 16, weight: .semibold, design: .rounded))
                .foregroundColor(.primary)
            
            Spacer()
            
            Text("\(count)")
                .font(.system(size: 20, weight: .bold, design: .rounded))
                .foregroundColor(AppTheme.accentColor)
        }
        .padding(12)
        .background(
            RoundedRectangle(cornerRadius: 12)
                .fill(Color.gray.opacity(0.05))
        )
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

struct ContributorRow: View {
    let rank: Int
    let name: String
    let count: Int
    
    var body: some View {
        HStack(spacing: 12) {
            // Rank Badge
            ZStack {
                Circle()
                    .fill(rankColor)
                    .frame(width: 32, height: 32)
                
                Text("\(rank)")
                    .font(.system(size: 14, weight: .bold, design: .rounded))
                    .foregroundColor(.white)
            }
            
            // Name
            Text(name)
                .font(.system(size: 16, weight: .semibold, design: .rounded))
                .foregroundColor(.primary)
            
            Spacer()
            
            // Count
            HStack(spacing: 4) {
                Image(systemName: "film.fill")
                    .font(.system(size: 12))
                    .foregroundColor(.secondary)
                
                Text("\(count)")
                    .font(.system(size: 16, weight: .bold, design: .rounded))
                    .foregroundColor(.secondary)
            }
        }
        .padding(12)
        .background(
            RoundedRectangle(cornerRadius: 12)
                .fill(Color.gray.opacity(0.05))
        )
    }
    
    private var rankColor: Color {
        switch rank {
        case 1: return .yellow
        case 2: return Color(red: 0.75, green: 0.75, blue: 0.75)
        case 3: return Color(red: 0.80, green: 0.50, blue: 0.20)
        default: return .gray
        }
    }
}

// MARK: - Data Models

struct MonthlySelection: Identifiable {
    let id: String
    let monthName: String
    let date: Date
    let movies: [SelectedMovie]
}

struct SelectedMovie {
    let title: String
    let submittedBy: String
    let genre: Genre?
}

struct PoolStatistics {
    let totalMovies: Int
    let genreCounts: [Genre: Int]
}

struct GenreCount: Identifiable {
    let id = UUID()
    let genre: Genre
    let count: Int
}

struct MonthlyChartData: Identifiable {
    let id = UUID()
    let monthName: String
    let movieCount: Int
}

struct ContributorData {
    let name: String
    let count: Int
}

enum TimeRange: String, CaseIterable {
    case threeMonths = "3M"
    case sixMonths = "6M"
    case year = "1Y"
    case all = "All"
    
    var title: String { rawValue }
}

#Preview {
    AnalyticsView()
}

