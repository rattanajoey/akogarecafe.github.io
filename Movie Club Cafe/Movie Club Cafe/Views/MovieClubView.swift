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
                    }
#if !canImport(FirebaseFirestore)
                    Text("Firebase is not available in this build. Data will not load.")
                        .font(.footnote)
                        .foregroundColor(.secondary)
#endif
                }
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
                        SelectedMoviesView(
                            selections: $selections,
                            selectedMonth: $selectedMonth,
                            onMonthChange: { month in
                                selectedMonth = month
                            }
                        )
                        
                        GenrePoolView(pools: pools)
                    }
                }
            }
        }
        .background(AppTheme.backgroundGradient)
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
#else
    @MainActor
    private func fetchSelections() async {
        print("FirebaseFirestore not available; fetchSelections is a no-op.")
    }
    
    @MainActor
    private func fetchGenrePools() async {
        print("FirebaseFirestore not available; fetchGenrePools is a no-op.")
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
