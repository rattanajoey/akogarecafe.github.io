//
//  AdminMonthlyHistoryView.swift
//  Movie Club Cafe
//
//  Created by Kavy Rattana on 11/7/25.
//

import SwiftUI
#if canImport(FirebaseFirestore)
import FirebaseFirestore
#endif

struct AdminMonthlyHistoryView: View {
    @State private var monthlyHistory: [MonthHistory] = []
    @State private var isLoading = false
    @State private var errorMessage = ""
    @State private var showError = false
    
    var body: some View {
        ScrollView {
            VStack(spacing: 20) {
                // Header
                HStack {
                    Image(systemName: "calendar")
                        .font(.system(size: 40))
                        .foregroundColor(.blue)
                    Text("📅 Monthly History")
                        .font(.title)
                        .fontWeight(.bold)
                }
                .padding()
                
                Text("View past movie selections")
                    .font(.subheadline)
                    .foregroundColor(.secondary)
                
                Divider()
                
                if isLoading {
                    ProgressView()
                        .padding()
                } else if monthlyHistory.isEmpty {
                    VStack(spacing: 15) {
                        Image(systemName: "calendar.badge.clock")
                            .font(.system(size: 60))
                            .foregroundColor(.gray)
                        Text("No history available yet")
                            .font(.headline)
                            .foregroundColor(.secondary)
                    }
                    .frame(maxWidth: .infinity)
                    .padding(40)
                } else {
                    ForEach(monthlyHistory.sorted(by: { $0.monthId > $1.monthId }), id: \.monthId) { month in
                        MonthHistoryCard(month: month)
                    }
                }
            }
            .padding()
        }
        .onAppear {
            loadHistory()
        }
        .alert("Error", isPresented: $showError) {
            Button("OK", role: .cancel) {}
        } message: {
            Text(errorMessage)
        }
    }
    
    // MARK: - Firebase Operations
    
    private func loadHistory() {
        #if canImport(FirebaseFirestore)
        isLoading = true
        let db = FirebaseConfig.shared.db
        
        Task {
            do {
                let snapshot = try await db.collection("MonthlySelections").getDocuments()
                var history: [MonthHistory] = []
                
                for document in snapshot.documents {
                    let data = try document.data(as: MonthlySelections.self)
                    let monthHistory = MonthHistory(
                        monthId: document.documentID,
                        action: data.action,
                        drama: data.drama,
                        comedy: data.comedy,
                        thriller: data.thriller
                    )
                    history.append(monthHistory)
                }
                
                await MainActor.run {
                    self.monthlyHistory = history
                    self.isLoading = false
                }
            } catch {
                await MainActor.run {
                    errorMessage = "Failed to load history: \(error.localizedDescription)"
                    showError = true
                    isLoading = false
                }
            }
        }
        #endif
    }
}

// MARK: - Supporting Types & Views

struct MonthHistory: Identifiable {
    let id = UUID()
    let monthId: String
    let action: Movie?
    let drama: Movie?
    let comedy: Movie?
    let thriller: Movie?
    
    var displayName: String {
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM"
        if let date = formatter.date(from: monthId) {
            formatter.dateFormat = "MMMM yyyy"
            return formatter.string(from: date)
        }
        return monthId
    }
}

struct MonthHistoryCard: View {
    let month: MonthHistory
    @State private var isExpanded = false
    
    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack {
                Image(systemName: "calendar.badge.checkmark")
                    .foregroundColor(.blue)
                Text(month.displayName)
                    .font(.headline)
                
                Spacer()
                
                Button(action: { isExpanded.toggle() }) {
                    Image(systemName: isExpanded ? "chevron.up" : "chevron.down")
                        .foregroundColor(.secondary)
                }
            }
            
            if isExpanded {
                VStack(alignment: .leading, spacing: 12) {
                    Divider()
                    
                    if let movie = month.action {
                        MovieHistoryRow(emoji: "💥", genre: "Action/Sci-Fi", movie: movie)
                    }
                    if let movie = month.drama {
                        MovieHistoryRow(emoji: "🎭", genre: "Drama/Documentary", movie: movie)
                    }
                    if let movie = month.comedy {
                        MovieHistoryRow(emoji: "😂", genre: "Comedy/Musical", movie: movie)
                    }
                    if let movie = month.thriller {
                        MovieHistoryRow(emoji: "😱", genre: "Thriller/Horror", movie: movie)
                    }
                }
            }
        }
        .padding()
        .background(Color.blue.opacity(0.1))
        .cornerRadius(10)
    }
}

struct MovieHistoryRow: View {
    let emoji: String
    let genre: String
    let movie: Movie
    
    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            HStack {
                Text(emoji)
                Text(genre)
                    .font(.subheadline)
                    .fontWeight(.semibold)
            }
            
            Text(movie.title)
                .font(.body)
            
            Text("Selected from: \(movie.submittedBy)")
                .font(.caption)
                .foregroundColor(.secondary)
                .italic()
        }
        .padding(10)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Color.white.opacity(0.5))
        .cornerRadius(8)
    }
}

#Preview {
    AdminMonthlyHistoryView()
}

