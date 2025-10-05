//
//  GenrePoolView.swift
//  Movie Club Cafe
//
//  Created by Kavy Rattana on 10/4/25.
//

import SwiftUI

struct GenrePoolView: View {
    let pools: GenrePools
    
    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("🎬 Genre Pools")
                .font(.title2)
                .fontWeight(.bold)
                .foregroundColor(AppTheme.textPrimary)
                .padding(.horizontal)
            
            LazyVGrid(columns: [
                GridItem(.flexible(), spacing: 16),
                GridItem(.flexible(), spacing: 16)
            ], spacing: 16) {
                ForEach(Genre.allCases, id: \.self) { genre in
                    GenrePoolCard(genre: genre, movies: getMovies(for: genre))
                }
            }
            .padding(.horizontal)
            .padding(.bottom, 80)
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
}

struct GenrePoolCard: View {
    let genre: Genre
    let movies: [Movie]
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(genre.title)
                .font(.headline)
                .foregroundColor(AppTheme.textPrimary)
                .textCase(.uppercase)
            
            if movies.isEmpty {
                Text("No movies in this genre.")
                    .font(.caption)
                    .foregroundColor(AppTheme.textSecondary)
                    .italic()
            } else {
                VStack(alignment: .leading, spacing: 4) {
                    ForEach(movies) { movie in
                        HStack(alignment: .top, spacing: 4) {
                            Text("•")
                                .foregroundColor(AppTheme.textPrimary)
                            VStack(alignment: .leading, spacing: 2) {
                                Text(movie.title)
                                    .font(.caption)
                                    .foregroundColor(AppTheme.textPrimary)
                                Text("— \(movie.submittedBy)")
                                    .font(.caption2)
                                    .foregroundColor(AppTheme.textSecondary)
                            }
                        }
                    }
                }
            }
        }
        .padding(12)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(AppTheme.cardBackground)
        .cornerRadius(8)
    }
}

#Preview {
    GenrePoolView(pools: GenrePools(
        action: [
            Movie(title: "The Matrix", submittedBy: "Alice", director: nil, year: nil, posterUrl: nil),
            Movie(title: "Inception", submittedBy: "Bob", director: nil, year: nil, posterUrl: nil)
        ],
        drama: [],
        comedy: [],
        thriller: []
    ))
}

