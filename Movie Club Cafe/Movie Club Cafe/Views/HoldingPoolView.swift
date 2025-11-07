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
    @State private var expandedGenres: Set<Genre> = []
    @State private var isLoading = true
    @State private var isRefreshing = false
    
    var body: some View {
        ScrollView {
            VStack(spacing: 0) {
                // Header
                HStack {
                    VStack(alignment: .leading, spacing: 4) {
                        Text("Holding Pool")
                            .font(.system(size: 32, weight: .bold, design: .rounded))
                            .foregroundColor(AppTheme.textPrimary)
                        
                        if isLoading {
                            Text("Loading...")
                                .font(.system(size: 15, design: .rounded))
                                .foregroundColor(.secondary)
                        } else {
                            Text("\(totalMovieCount) movie\(totalMovieCount == 1 ? "" : "s") awaiting selection")
                                .font(.system(size: 15, design: .rounded))
                                .foregroundColor(.secondary)
                        }
                    }
                    Spacer()
                    
                    // Refresh Button
                    Button(action: refreshData) {
                        Image(systemName: "arrow.clockwise")
                            .font(.system(size: 16, weight: .semibold))
                            .foregroundColor(AppTheme.accentColor)
                            .frame(width: 40, height: 40)
                            .background(
                                Circle()
                                    .fill(.ultraThinMaterial)
                            )
                            .overlay(
                                Circle()
                                    .stroke(Color.gray.opacity(0.2), lineWidth: 1)
                            )
                            .rotationEffect(.degrees(isRefreshing ? 360 : 0))
                    }
                    .disabled(isRefreshing)
                }
                .padding(.horizontal, 20)
                .padding(.top, 12)
                .padding(.bottom, 24)
                
                // Genre Sections
                if isLoading {
                    // Loading State
                    VStack(spacing: 16) {
                        ForEach(0..<4, id: \.self) { _ in
                            LoadingCard()
                        }
                    }
                    .padding(.horizontal, 16)
                } else {
                    VStack(spacing: 12) {
                        ForEach(Genre.allCases, id: \.self) { genre in
                            HoldingGenreSection(
                                genre: genre,
                                movies: genrePools[genre] ?? [],
                                isExpanded: expandedGenres.contains(genre),
                                onToggle: { toggleGenre(genre) }
                            )
                        }
                    }
                    .padding(.horizontal, 16)
                }
                
                Spacer(minLength: 20)
            }
            .padding(.bottom, 20)
        }
        .onAppear {
            loadHoldingPool()
        }
    }
    
    private var totalMovieCount: Int {
        genrePools.values.reduce(0) { $0 + $1.count }
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
    
    private func refreshData() {
        guard !isRefreshing else { return }
        
        withAnimation(.easeInOut(duration: 0.3)) {
            isRefreshing = true
        }
        
        loadHoldingPool()
        
        DispatchQueue.main.asyncAfter(deadline: .now() + 1.0) {
            withAnimation(.easeInOut(duration: 0.3)) {
                isRefreshing = false
            }
        }
    }
    
    private func loadHoldingPool() {
        #if canImport(FirebaseFirestore)
        let db = FirebaseConfig.shared.db
        let holdingRef = db.collection("HoldingPool")
        
        holdingRef.addSnapshotListener { snapshot, error in
            guard let documents = snapshot?.documents else {
                print("Error fetching holding pool: \(error?.localizedDescription ?? "Unknown error")")
                withAnimation {
                    isLoading = false
                }
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
            
            withAnimation {
                genrePools = pools
                isLoading = false
            }
        }
        #else
        withAnimation {
            isLoading = false
        }
        #endif
    }
}

struct HoldingGenreSection: View {
    let genre: Genre
    let movies: [HoldingMovie]
    let isExpanded: Bool
    let onToggle: () -> Void
    
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
                            Image(systemName: "tray")
                                .font(.system(size: 32))
                                .foregroundColor(.secondary.opacity(0.5))
                            
                            Text("No submissions yet")
                                .font(.system(size: 15, design: .rounded))
                                .foregroundColor(.secondary)
                            
                            Text("Movies will appear here after submission")
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
                            HoldingMovieRowView(movie: movie)
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

struct HoldingMovieRowView: View {
    let movie: HoldingMovie
    
    var body: some View {
        HStack(spacing: 12) {
            // Movie Icon
            ZStack {
                RoundedRectangle(cornerRadius: 8)
                    .fill(Color.gray.opacity(0.15))
                    .frame(width: 50, height: 75)
                
                Image(systemName: "film")
                    .font(.system(size: 22))
                    .foregroundColor(.secondary.opacity(0.6))
            }
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
            
            // Status Badge
            HStack(spacing: 4) {
                Image(systemName: "clock.fill")
                    .font(.system(size: 9))
                Text("Pending")
                    .font(.system(size: 11, weight: .medium, design: .rounded))
            }
            .foregroundColor(.orange)
            .padding(.horizontal, 8)
            .padding(.vertical, 4)
            .background(
                Capsule()
                    .fill(Color.orange.opacity(0.15))
            )
        }
        .padding(12)
        .background(
            RoundedRectangle(cornerRadius: 12)
                .fill(Color.gray.opacity(0.05))
        )
    }
}

struct LoadingCard: View {
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack(spacing: 12) {
                Circle()
                    .fill(Color.gray.opacity(0.2))
                    .frame(width: 28, height: 28)
                
                VStack(alignment: .leading, spacing: 4) {
                    RoundedRectangle(cornerRadius: 4)
                        .fill(Color.gray.opacity(0.2))
                        .frame(width: 100, height: 16)
                    
                    RoundedRectangle(cornerRadius: 4)
                        .fill(Color.gray.opacity(0.15))
                        .frame(width: 60, height: 12)
                }
                
                Spacer()
            }
        }
        .padding(16)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(
            RoundedRectangle(cornerRadius: 16)
                .fill(.ultraThinMaterial)
        )
        .overlay(
            RoundedRectangle(cornerRadius: 16)
                .stroke(Color.gray.opacity(0.2), lineWidth: 1.5)
        )
        .shimmer()
    }
}

extension View {
    func shimmer() -> some View {
        self.overlay(
            GeometryReader { geometry in
                LinearGradient(
                    gradient: Gradient(colors: [
                        .clear,
                        .white.opacity(0.3),
                        .clear
                    ]),
                    startPoint: .leading,
                    endPoint: .trailing
                )
                .offset(x: -geometry.size.width)
                .animation(
                    Animation.linear(duration: 1.5)
                        .repeatForever(autoreverses: false),
                    value: UUID()
                )
            }
        )
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

