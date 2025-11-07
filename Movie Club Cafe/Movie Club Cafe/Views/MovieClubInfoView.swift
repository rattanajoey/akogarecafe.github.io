//
//  MovieClubInfoView.swift
//  Movie Club Cafe
//
//  Created by Kavy Rattana on 11/6/25.
//

import SwiftUI

struct MovieClubInfoView: View {
    @Environment(\.dismiss) var dismiss
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(alignment: .leading, spacing: 20) {
                    // Header
                    HStack {
                        Image(systemName: "film.fill")
                            .font(.largeTitle)
                            .foregroundColor(AppTheme.accentColor)
                        Text("Movie Club Info")
                            .font(.largeTitle)
                            .fontWeight(.bold)
                    }
                    .padding(.bottom, 10)
                    
                    Divider()
                    
                    // How It Works
                    SectionView(
                        icon: "questionmark.circle.fill",
                        title: "How It Works",
                        content: "Each month, submit up to one movie per category. You can resubmit to update your picks until the submission period closes (usually one week). Submitting again with the same nickname and password will replace your prior submission."
                    )
                    
                    // Genre Categories
                    VStack(alignment: .leading, spacing: 12) {
                        HStack {
                            Image(systemName: "square.grid.2x2.fill")
                                .foregroundColor(AppTheme.accentColor)
                            Text("Genre Categories")
                                .font(.title2)
                                .fontWeight(.bold)
                        }
                        
                        GenreCategoryRow(emoji: "🎬", title: "Action", subtitle: "Sci-Fi / Fantasy")
                        GenreCategoryRow(emoji: "🎭", title: "Drama", subtitle: "Documentary")
                        GenreCategoryRow(emoji: "😂", title: "Comedy", subtitle: "Musical")
                        GenreCategoryRow(emoji: "😱", title: "Thriller", subtitle: "Horror")
                    }
                    .padding()
                    .background(
                        RoundedRectangle(cornerRadius: 12)
                            .fill(Color.gray.opacity(0.1))
                    )
                    
                    // Submission Guidelines
                    SectionView(
                        icon: "pencil.circle.fill",
                        title: "Submission Guidelines",
                        content: "We will announce when the submission period is open and closed. Make sure to submit your picks before the deadline!"
                    )
                    
                    // Selection Process
                    SectionView(
                        icon: "star.circle.fill",
                        title: "Selection Process",
                        content: "After the period ends, one movie per category will be selected randomly from all submissions. These will be displayed as the official Movie Club picks for the month."
                    )
                    
                    // Carryover
                    SectionView(
                        icon: "arrow.forward.circle.fill",
                        title: "Carryover",
                        content: "Movies not picked will carry over to the next month, giving them another chance to be selected!"
                    )
                }
                .padding()
            }
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Done") {
                        dismiss()
                    }
                    .foregroundColor(AppTheme.accentColor)
                }
            }
            .background(Color(UIColor.systemBackground))
        }
    }
}

struct SectionView: View {
    let icon: String
    let title: String
    let content: String
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Image(systemName: icon)
                    .foregroundColor(AppTheme.accentColor)
                Text(title)
                    .font(.title2)
                    .fontWeight(.bold)
            }
            Text(content)
                .font(.body)
                .foregroundColor(AppTheme.textSecondary)
        }
    }
}

struct GenreCategoryRow: View {
    let emoji: String
    let title: String
    let subtitle: String
    
    var body: some View {
        HStack(spacing: 12) {
            Text(emoji)
                .font(.title)
            VStack(alignment: .leading, spacing: 2) {
                Text(title)
                    .font(.headline)
                    .fontWeight(.semibold)
                Text(subtitle)
                    .font(.subheadline)
                    .foregroundColor(AppTheme.textSecondary)
            }
            Spacer()
        }
        .padding(.vertical, 4)
    }
}

#Preview {
    MovieClubInfoView()
}

