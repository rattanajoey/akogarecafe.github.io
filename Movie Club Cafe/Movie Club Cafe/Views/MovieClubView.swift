//
//  MovieClubView.swift
//  Movie Club Cafe
//
//  Created by Kavy Rattana on 10/4/25.
//

import SwiftUI
#if canImport(FirebaseFirestore)
import FirebaseFirestore
#endif

struct MovieClubView: View {
    @State private var submissionsOpen = false
    @State private var selections: MonthlySelections = MonthlySelections(action: nil, drama: nil, comedy: nil, thriller: nil)
    @State private var pools: GenrePools = GenrePools(action: [], drama: [], comedy: [], thriller: [])
    @State private var selectedMonth: String = getCurrentMonth()
    @State private var isSyncing = false
    @State private var syncMessage: String?
    @State private var showSyncAlert = false
    @State private var showInfoModal = false
    @State private var showOscarVoting = false
    @State private var showingShareSheet = false
    @State private var showCalendarView = false
    @State private var calendarEvents: [CalendarEvent] = []
    @EnvironmentObject var authService: AuthenticationService
    
    var body: some View {
        ScrollView {
            VStack(spacing: 0) {
                // Header - Minimalist Apple Design
                VStack(spacing: 16) {
                    // Title Row
                    HStack(alignment: .center) {
                        Text("Movie Club")
                            .font(.system(size: 38, weight: .bold, design: .rounded))
                            .foregroundColor(AppTheme.accentColor)
                        
                        Spacer()
                        
                        // TMDB Attribution - subtle
                        Link(destination: URL(string: "https://www.themoviedb.org/")!) {
                            Image("tmdb")
                                .resizable()
                                .scaledToFit()
                                .frame(height: 18)
                                .opacity(0.6)
                        }
                    }
                    
                    // Action Buttons Row
                    HStack(spacing: 12) {
                        // Share Button
                        Button(action: {
                            showingShareSheet = true
                        }) {
                            Image(systemName: "square.and.arrow.up")
                                .font(.system(size: 20, weight: .medium))
                                .foregroundColor(AppTheme.accentColor)
                                .frame(width: 44, height: 44)
                                .background(.ultraThinMaterial)
                                .clipShape(Circle())
                        }
                        
                        // Info Button
                        Button(action: {
                            showInfoModal = true
                        }) {
                            Image(systemName: "info.circle")
                                .font(.system(size: 20, weight: .medium))
                                .foregroundColor(AppTheme.accentColor)
                                .frame(width: 44, height: 44)
                                .background(.ultraThinMaterial)
                                .clipShape(Circle())
                        }
                        
                        Spacer()
                        
                        // Calendar View Button - Minimalist
                        Button(action: {
                            showCalendarView.toggle()
                        }) {
                            HStack(spacing: 6) {
                                Image(systemName: showCalendarView ? "calendar" : "calendar.badge.clock")
                                    .font(.system(size: 16, weight: .medium))
                                Text(showCalendarView ? "Hide Calendar" : "Calendar")
                                    .font(.system(size: 15, weight: .semibold))
                            }
                            .foregroundColor(.white)
                            .padding(.horizontal, 16)
                            .padding(.vertical, 10)
                            .background(
                                Capsule()
                                    .fill(AppTheme.accentColor)
                            )
                        }
                    }
                    
#if !canImport(FirebaseFirestore)
                    Text("Firebase is not available in this build. Data will not load.")
                        .font(.footnote)
                        .foregroundColor(.secondary)
#endif
                    
                    // Sync Message
                    if let message = syncMessage {
                        HStack(spacing: 8) {
                            Image(systemName: message.contains("Success") ? "checkmark.circle.fill" : "exclamationmark.circle.fill")
                                .font(.caption)
                            Text(message)
                                .font(.caption)
                        }
                        .foregroundColor(message.contains("Success") ? .green : .red)
                        .padding(.horizontal, 12)
                        .padding(.vertical, 6)
                        .background(
                            Capsule()
                                .fill((message.contains("Success") ? Color.green : Color.red).opacity(0.15))
                        )
                        .transition(.scale.combined(with: .opacity))
                    }
                }
                .padding(.horizontal, 20)
                .padding(.top, 20)
                .padding(.bottom, showCalendarView ? 12 : 24)
                
                // Calendar View - Collapsible
                if showCalendarView {
                    CalendarView(movies: allMoviesWithDates)
                        .padding(.horizontal, 20)
                        .padding(.bottom, 24)
                        .transition(.move(edge: .top).combined(with: .opacity))
                }
                
                // Main Content
                if submissionsOpen {
                    // Submission mode (not typically used in current version)
                    MovieSubmissionView()
                        .padding()
                } else {
                    // Display mode
                    VStack(spacing: 20) {
                        // 1. Selected Movies Display
                        SelectedMoviesView(
                            selections: $selections,
                            selectedMonth: $selectedMonth,
                            onMonthChange: { month in
                                selectedMonth = month
                            }
                        )
                        
                        // 2. Genre Pool
                        GenrePoolView(pools: pools)
                        
                        // 3. Holding Pool
                        HoldingPoolView()
                        
                        // 4. Submission Form
                        MovieSubmissionView()
                            .padding()
                        
                        // 5. Submission List
                        SubmissionListView()
                            .padding(.horizontal)
                        
                        // 6. Oscar Voting Button
                        if AppConfig.oscarVotingEnabled {
                            Button(action: {
                                showOscarVoting = true
                            }) {
                                HStack(spacing: 8) {
                                    Image(systemName: "trophy.fill")
                                        .font(.title3)
                                    Text("🏆 Oscar Voting")
                                        .font(.title3)
                                        .fontWeight(.bold)
                                }
                                .frame(maxWidth: .infinity)
                                .padding()
                                .background(Color.yellow.opacity(0.7))
                                .foregroundColor(.black)
                                .cornerRadius(12)
                                .shadow(color: .black.opacity(0.3), radius: 4, x: 0, y: 4)
                            }
                            .padding(.horizontal)
                            .padding(.bottom, 40)
                        }
                    }
                }
            }
        }
        .background(AppTheme.backgroundGradient)
        .sheet(isPresented: $showingShareSheet) {
            ShareSheet(items: [
                ShareHelper.shareMessage,
                URL(string: ShareHelper.websiteURL)!
            ])
        }
        .sheet(isPresented: $showInfoModal) {
            MovieClubInfoView()
        }
        .sheet(isPresented: $showOscarVoting) {
            OscarVotingView()
        }
        .onAppear {
            loadData()
        }
        .onChange(of: selectedMonth) { _, newMonth in
            loadData()
        }
    }
    
    @MainActor private func loadData() {
        Task {
            await fetchSelections()
            await fetchGenrePools()
            // Automatically sync with calendar in the background
            await autoSyncCalendar()
        }
    }
    
    // Computed property to get all movies with event dates
    private var allMoviesWithDates: [Movie] {
        var movies: [Movie] = []
        if let action = selections.action, action.eventDate != nil {
            movies.append(action)
        }
        if let drama = selections.drama, drama.eventDate != nil {
            movies.append(drama)
        }
        if let comedy = selections.comedy, comedy.eventDate != nil {
            movies.append(comedy)
        }
        if let thriller = selections.thriller, thriller.eventDate != nil {
            movies.append(thriller)
        }
        return movies
    }
    
#if canImport(FirebaseFirestore)
    @MainActor
    private func fetchSelections() async {
        do {
            // Use cache-first strategy for instant loading
            if let cachedSelections = try await FirestoreCacheService.shared.getMonthlySelections(for: selectedMonth) {
                selections = cachedSelections
            }
        } catch {
            print("Error fetching selections: \(error)")
        }
    }
    
    @MainActor
    private func fetchGenrePools() async {
        do {
            // Use cache-first strategy for instant loading
            if let cachedPools = try await FirestoreCacheService.shared.getGenrePools() {
                pools = cachedPools
            }
        } catch {
            print("Error fetching genre pools: \(error)")
        }
    }
    
    @MainActor
    private func syncWithCalendar() {
        isSyncing = true
        syncMessage = nil
        
        Task {
            do {
                // Fetch calendar events
                let events = try await GoogleCalendarService.shared.fetchCalendarEvents()
                
                if events.isEmpty {
                    syncMessage = "No events found in calendar"
                    isSyncing = false
                    return
                }
                
                // Update each movie with calendar information
                var updatedSelections = selections
                var syncedCount = 0
                
                if let actionMovie = selections.action {
                    let synced = GoogleCalendarService.shared.syncMovieWithCalendar(movie: actionMovie, events: events)
                    if synced.eventDate != nil {
                        updatedSelections = MonthlySelections(
                            action: synced,
                            drama: updatedSelections.drama,
                            comedy: updatedSelections.comedy,
                            thriller: updatedSelections.thriller
                        )
                        syncedCount += 1
                    }
                }
                
                if let dramaMovie = selections.drama {
                    let synced = GoogleCalendarService.shared.syncMovieWithCalendar(movie: dramaMovie, events: events)
                    if synced.eventDate != nil {
                        updatedSelections = MonthlySelections(
                            action: updatedSelections.action,
                            drama: synced,
                            comedy: updatedSelections.comedy,
                            thriller: updatedSelections.thriller
                        )
                        syncedCount += 1
                    }
                }
                
                if let comedyMovie = selections.comedy {
                    let synced = GoogleCalendarService.shared.syncMovieWithCalendar(movie: comedyMovie, events: events)
                    if synced.eventDate != nil {
                        updatedSelections = MonthlySelections(
                            action: updatedSelections.action,
                            drama: updatedSelections.drama,
                            comedy: synced,
                            thriller: updatedSelections.thriller
                        )
                        syncedCount += 1
                    }
                }
                
                if let thrillerMovie = selections.thriller {
                    let synced = GoogleCalendarService.shared.syncMovieWithCalendar(movie: thrillerMovie, events: events)
                    if synced.eventDate != nil {
                        updatedSelections = MonthlySelections(
                            action: updatedSelections.action,
                            drama: updatedSelections.drama,
                            comedy: updatedSelections.comedy,
                            thriller: synced
                        )
                        syncedCount += 1
                    }
                }
                
                // Update Firebase with synced data
                if syncedCount > 0 {
                    let db = FirebaseConfig.shared.db
                    let docRef = db.collection("MonthlySelections").document(selectedMonth)
                    
                    try await docRef.setData([
                        "action": updatedSelections.action.map { movieToDict($0) } as Any,
                        "drama": updatedSelections.drama.map { movieToDict($0) } as Any,
                        "comedy": updatedSelections.comedy.map { movieToDict($0) } as Any,
                        "thriller": updatedSelections.thriller.map { movieToDict($0) } as Any
                    ], merge: true)
                    
                    selections = updatedSelections
                    syncMessage = "✓ Successfully synced \(syncedCount) movie(s) with calendar events"
                } else {
                    syncMessage = "No matching events found for current movies"
                }
                
                isSyncing = false
            } catch let error as CalendarError {
                syncMessage = "Calendar sync failed: \(error.localizedDescription)"
                isSyncing = false
            } catch {
                syncMessage = "Calendar sync failed: \(error.localizedDescription)"
                isSyncing = false
            }
            
            // Clear message after 5 seconds
            DispatchQueue.main.asyncAfter(deadline: .now() + 5) {
                syncMessage = nil
            }
        }
    }
    
    // Automatic background sync - silent, no user feedback
    @MainActor
    private func autoSyncCalendar() async {
        // Only sync if movies haven't been synced yet
        let needsSync = selections.action?.eventDate == nil ||
                       selections.drama?.eventDate == nil ||
                       selections.comedy?.eventDate == nil ||
                       selections.thriller?.eventDate == nil
        
        guard needsSync else { return }
        
        do {
            // Fetch calendar events silently
            let events = try await GoogleCalendarService.shared.fetchCalendarEvents()
            guard !events.isEmpty else { return }
            
            // Store events for calendar view
            calendarEvents = events
            
            // Update each movie with calendar information
            var updatedSelections = selections
            var hasUpdates = false
            
            if let actionMovie = selections.action, actionMovie.eventDate == nil {
                let synced = GoogleCalendarService.shared.syncMovieWithCalendar(movie: actionMovie, events: events)
                if synced.eventDate != nil {
                    updatedSelections = MonthlySelections(
                        action: synced,
                        drama: updatedSelections.drama,
                        comedy: updatedSelections.comedy,
                        thriller: updatedSelections.thriller
                    )
                    hasUpdates = true
                }
            }
            
            if let dramaMovie = selections.drama, dramaMovie.eventDate == nil {
                let synced = GoogleCalendarService.shared.syncMovieWithCalendar(movie: dramaMovie, events: events)
                if synced.eventDate != nil {
                    updatedSelections = MonthlySelections(
                        action: updatedSelections.action,
                        drama: synced,
                        comedy: updatedSelections.comedy,
                        thriller: updatedSelections.thriller
                    )
                    hasUpdates = true
                }
            }
            
            if let comedyMovie = selections.comedy, comedyMovie.eventDate == nil {
                let synced = GoogleCalendarService.shared.syncMovieWithCalendar(movie: comedyMovie, events: events)
                if synced.eventDate != nil {
                    updatedSelections = MonthlySelections(
                        action: updatedSelections.action,
                        drama: updatedSelections.drama,
                        comedy: synced,
                        thriller: updatedSelections.thriller
                    )
                    hasUpdates = true
                }
            }
            
            if let thrillerMovie = selections.thriller, thrillerMovie.eventDate == nil {
                let synced = GoogleCalendarService.shared.syncMovieWithCalendar(movie: thrillerMovie, events: events)
                if synced.eventDate != nil {
                    updatedSelections = MonthlySelections(
                        action: updatedSelections.action,
                        drama: updatedSelections.drama,
                        comedy: updatedSelections.comedy,
                        thriller: synced
                    )
                    hasUpdates = true
                }
            }
            
            // Update Firebase and local state silently
            if hasUpdates {
                let db = FirebaseConfig.shared.db
                let docRef = db.collection("MonthlySelections").document(selectedMonth)
                
                try await docRef.setData([
                    "action": updatedSelections.action.map { movieToDict($0) } as Any,
                    "drama": updatedSelections.drama.map { movieToDict($0) } as Any,
                    "comedy": updatedSelections.comedy.map { movieToDict($0) } as Any,
                    "thriller": updatedSelections.thriller.map { movieToDict($0) } as Any
                ], merge: true)
                
                selections = updatedSelections
            }
        } catch {
            // Silent failure - don't show errors for background sync
            print("Background calendar sync failed: \(error.localizedDescription)")
        }
    }
    
    private func movieToDict(_ movie: Movie) -> [String: Any] {
        var dict: [String: Any] = [
            "title": movie.title,
            "submittedBy": movie.submittedBy
        ]
        
        if let director = movie.director { dict["director"] = director }
        if let year = movie.year { dict["year"] = year }
        if let posterUrl = movie.posterUrl { dict["posterUrl"] = posterUrl }
        if let eventDate = movie.eventDate { dict["eventDate"] = eventDate }
        if let eventDescription = movie.eventDescription { dict["eventDescription"] = eventDescription }
        if let eventLocation = movie.eventLocation { dict["eventLocation"] = eventLocation }
        if let watchProvidersLink = movie.watchProvidersLink { dict["watchProvidersLink"] = watchProvidersLink }
        
        if let streamingProviders = movie.streamingProviders {
            dict["streamingProviders"] = streamingProviders.map { provider in
                [
                    "id": provider.id,
                    "name": provider.name,
                    "logoUrl": provider.logoUrl as Any
                ]
            }
        }
        
        return dict
    }
#else
    @MainActor
    private func fetchSelections() async {
        print("FirebaseFirestore not available; fetchSelections is a no-op.")
    }
    
    @MainActor
    private func fetchGenrePools() async {
        print("FirebaseFirestore not available; fetchGenrePools is a no-op.")
    }
    
    @MainActor
    private func syncWithCalendar() {
        syncMessage = "Calendar sync requires Firebase"
        isSyncing = false
    }
#endif
}

func getCurrentMonth() -> String {
    let formatter = DateFormatter()
    formatter.dateFormat = "yyyy-MM"
    return formatter.string(from: Date())
}

#Preview {
    MovieClubView()
}
