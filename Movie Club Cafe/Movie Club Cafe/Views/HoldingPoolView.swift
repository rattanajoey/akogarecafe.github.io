//
//  HoldingPoolView.swift
//  Movie Club Cafe
//
//  Created by Kavy Rattana on 11/6/25.
//

import SwiftUI
#if canImport(FirebaseFirestore)
import FirebaseFirestore
#endif

struct HoldingPoolView: View {
    @State private var holdingPool: [HoldingSubmission] = []
    @State private var genrePools: [Genre: [HoldingMovie]] = [
        .action: [],
        .drama: [],
        .comedy: [],
        .thriller: []
    ]
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("📋 Holding Submissions")
                .font(.title2)
                .fontWeight(.bold)
                .foregroundColor(AppTheme.textPrimary)
            
            LazyVGrid(columns: [
                GridItem(.flexible(), spacing: 16),
                GridItem(.flexible(), spacing: 16)
            ], spacing: 16) {
                ForEach(Genre.allCases, id: \.self) { genre in
                    HoldingGenreCard(genre: genre, movies: genrePools[genre] ?? [])
                }
            }
        }
        .padding()
        .onAppear {
            loadHoldingPool()
        }
    }
    
    private func loadHoldingPool() {
        #if canImport(FirebaseFirestore)
        let db = FirebaseConfig.shared.db
        let holdingRef = db.collection("HoldingPool")
        
        holdingRef.addSnapshotListener { snapshot, error in
            guard let documents = snapshot?.documents else {
                print("Error fetching holding pool: \(error?.localizedDescription ?? "Unknown error")")
                return
            }
            
            var submissions: [HoldingSubmission] = []
            for doc in documents {
                let data = doc.data()
                submissions.append(HoldingSubmission(
                    id: doc.documentID,
                    action: data["action"] as? String,
                    drama: data["drama"] as? String,
                    comedy: data["comedy"] as? String,
                    thriller: data["thriller"] as? String
                ))
            }
            
            holdingPool = submissions
            
            // Transform into genre-based structure
            var pools: [Genre: [HoldingMovie]] = [
                .action: [],
                .drama: [],
                .comedy: [],
                .thriller: []
            ]
            
            for submission in submissions {
                if let action = submission.action?.trimmingCharacters(in: .whitespacesAndNewlines), !action.isEmpty {
                    pools[.action]?.append(HoldingMovie(title: action, submittedBy: submission.id))
                }
                if let drama = submission.drama?.trimmingCharacters(in: .whitespacesAndNewlines), !drama.isEmpty {
                    pools[.drama]?.append(HoldingMovie(title: drama, submittedBy: submission.id))
                }
                if let comedy = submission.comedy?.trimmingCharacters(in: .whitespacesAndNewlines), !comedy.isEmpty {
                    pools[.comedy]?.append(HoldingMovie(title: comedy, submittedBy: submission.id))
                }
                if let thriller = submission.thriller?.trimmingCharacters(in: .whitespacesAndNewlines), !thriller.isEmpty {
                    pools[.thriller]?.append(HoldingMovie(title: thriller, submittedBy: submission.id))
                }
            }
            
            genrePools = pools
        }
        #endif
    }
}

struct HoldingGenreCard: View {
    let genre: Genre
    let movies: [HoldingMovie]
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(genre.title)
                .font(.headline)
                .fontWeight(.bold)
                .foregroundColor(AppTheme.textPrimary)
            
            if movies.isEmpty {
                Text("No movies in this genre.")
                    .font(.caption)
                    .foregroundColor(AppTheme.textSecondary)
                    .padding(.vertical, 8)
            } else {
                VStack(alignment: .leading, spacing: 4) {
                    ForEach(movies, id: \.title) { movie in
                        HStack(alignment: .top, spacing: 4) {
                            Text("•")
                                .font(.caption)
                            VStack(alignment: .leading, spacing: 2) {
                                Text(movie.title)
                                    .font(.caption)
                                    .foregroundColor(AppTheme.textPrimary)
                                Text("by \(movie.submittedBy)")
                                    .font(.caption2)
                                    .foregroundColor(AppTheme.textSecondary)
                            }
                        }
                    }
                }
            }
        }
        .padding()
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(AppTheme.cardBackground)
        .cornerRadius(8)
    }
}

struct HoldingSubmission: Identifiable {
    let id: String
    let action: String?
    let drama: String?
    let comedy: String?
    let thriller: String?
}

struct HoldingMovie: Identifiable {
    let id = UUID()
    let title: String
    let submittedBy: String
}

#Preview {
    HoldingPoolView()
}

