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
    @EnvironmentObject var authService: AuthenticationService
    
    var body: some View {
        ScrollView {
            VStack(spacing: 0) {
                // Header
                VStack(spacing: 8) {
                    HStack(alignment: .center, spacing: 12) {
                        Text("Movie Club")
                            .font(.system(size: 34, weight: .bold, design: .serif))
                            .foregroundColor(AppTheme.accentColor)
                            .shadow(color: .black.opacity(0.5), radius: 3, x: 2, y: 2)
                        
                        Link(destination: URL(string: "https://www.themoviedb.org/")!) {
                            Image("tmdb")
                                .resizable()
                                .scaledToFit()
                                .frame(height: 22)
                        }
                        
                        Spacer()
                        
                        // Info Button
                        Button(action: {
                            showInfoModal = true
                        }) {
                            Image(systemName: "info.circle")
                                .font(.title2)
                                .foregroundColor(AppTheme.accentColor)
                        }
                        
                        // Calendar Sync Button
                        Button(action: {
                            syncWithCalendar()
                        }) {
                            HStack(spacing: 4) {
                                if isSyncing {
                                    ProgressView()
                                        .scaleEffect(0.7)
                                        .tint(.white)
                                } else {
                                    Image(systemName: "calendar.badge.clock")
                                }
                                Text(isSyncing ? "Syncing..." : "Sync")
                                    .font(.caption)
                            }
                            .padding(.horizontal, 10)
                            .padding(.vertical, 6)
                            .background(AppTheme.accentColor)
                            .foregroundColor(.white)
                            .cornerRadius(8)
                        }
                        .disabled(isSyncing)
                    }
#if !canImport(FirebaseFirestore)
                    Text("Firebase is not available in this build. Data will not load.")
                        .font(.footnote)
                        .foregroundColor(.secondary)
#endif
                    
                    if let message = syncMessage {
                        Text(message)
                            .font(.caption)
                            .foregroundColor(message.contains("Success") ? .green : .red)
                            .padding(.top, 4)
                    }
                }
                .padding(.horizontal)
                .padding(.top, 40)
                .padding(.bottom, 20)
                
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
        }
    }
    
#if canImport(FirebaseFirestore)
    @MainActor
    private func fetchSelections() async {
        let db = FirebaseConfig.shared.db
        let docRef = db.collection("MonthlySelections").document(selectedMonth)
        
        do {
            let document = try await docRef.getDocument()
            if document.exists {
                selections = try document.data(as: MonthlySelections.self)
            }
        } catch {
            print("Error fetching selections: \(error)")
        }
    }
    
    @MainActor
    private func fetchGenrePools() async {
        let db = FirebaseConfig.shared.db
        let docRef = db.collection("GenrePools").document("current")
        
        do {
            let document = try await docRef.getDocument()
            if document.exists {
                pools = try document.data(as: GenrePools.self)
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
