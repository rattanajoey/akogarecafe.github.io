//
//  SubmissionListView.swift
//  Movie Club Cafe
//
//  Created by Kavy Rattana on 11/6/25.
//

import SwiftUI
#if canImport(FirebaseFirestore)
import FirebaseFirestore
#endif

struct SubmissionListView: View {
    @State private var submissions: [UserSubmission] = []
    
    var body: some View {
        VStack(alignment: .leading, spacing: 20) {
            // Section Header
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    Text("Recent Submissions")
                        .font(.system(size: 26, weight: .bold, design: .rounded))
                        .foregroundColor(AppTheme.textPrimary)
                    Text(getCurrentMonthDisplay())
                        .font(.system(size: 14, weight: .medium))
                        .foregroundColor(.secondary)
                }
                Spacer()
            }
            .padding(.horizontal, 20)
            
            // Submissions Content
            if submissions.isEmpty {
                VStack(spacing: 12) {
                    Image(systemName: "tray")
                        .font(.system(size: 40))
                        .foregroundColor(.gray.opacity(0.5))
                    Text("No submissions yet")
                        .font(.system(size: 15))
                        .foregroundColor(.secondary)
                }
                .frame(maxWidth: .infinity)
                .padding(.vertical, 40)
                .background(
                    RoundedRectangle(cornerRadius: 16)
                        .fill(.ultraThinMaterial)
                )
                .padding(.horizontal, 16)
            } else {
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 12) {
                        ForEach(submissions) { submission in
                            SubmissionCard(submission: submission)
                        }
                    }
                    .padding(.horizontal, 16)
                }
            }
        }
        .padding(.vertical, 20)
        .onAppear {
            loadSubmissions()
        }
    }
    
    private func loadSubmissions() {
        #if canImport(FirebaseFirestore)
        let currentMonth = getCurrentMonth()
        let db = FirebaseConfig.shared.db
        let submissionsRef = db.collection("Submissions").document(currentMonth).collection("users")
        
        submissionsRef.addSnapshotListener { snapshot, error in
            guard let documents = snapshot?.documents else {
                print("Error fetching submissions: \(error?.localizedDescription ?? "Unknown error")")
                return
            }
            
            submissions = documents.compactMap { doc -> UserSubmission? in
                let data = doc.data()
                return UserSubmission(
                    id: doc.documentID,
                    action: data["action"] as? String,
                    drama: data["drama"] as? String,
                    comedy: data["comedy"] as? String,
                    thriller: data["thriller"] as? String,
                    submittedAt: (data["submittedAt"] as? Timestamp)?.dateValue() ?? Date()
                )
            }
        }
        #endif
    }
    
    private func getCurrentMonthDisplay() -> String {
        let formatter = DateFormatter()
        formatter.dateFormat = "MMMM yyyy"
        return formatter.string(from: Date())
    }
}

struct SubmissionCard: View {
    let submission: UserSubmission
    
    var body: some View {
        VStack(alignment: .leading, spacing: 14) {
            // User Name Header
            HStack {
                Image(systemName: "person.circle.fill")
                    .font(.system(size: 20))
                    .foregroundColor(AppTheme.accentColor)
                Text(submission.id)
                    .font(.system(size: 17, weight: .semibold))
                    .foregroundColor(.primary)
                    .lineLimit(1)
            }
            
            Divider()
            
            // Movie Picks
            VStack(alignment: .leading, spacing: 10) {
                SubmissionRow(emoji: "🎬", label: "Action", movie: submission.action)
                SubmissionRow(emoji: "🎭", label: "Drama", movie: submission.drama)
                SubmissionRow(emoji: "😂", label: "Comedy", movie: submission.comedy)
                SubmissionRow(emoji: "😱", label: "Thriller", movie: submission.thriller)
            }
            
            // Timestamp
            HStack {
                Image(systemName: "clock")
                    .font(.caption2)
                Text(formatDate(submission.submittedAt))
                    .font(.system(size: 11))
            }
            .foregroundColor(.secondary)
        }
        .padding(16)
        .frame(width: 260)
        .background(
            RoundedRectangle(cornerRadius: 16)
                .fill(.ultraThinMaterial)
        )
        .overlay(
            RoundedRectangle(cornerRadius: 16)
                .stroke(Color.gray.opacity(0.2), lineWidth: 1)
        )
    }
    
    private func formatDate(_ date: Date) -> String {
        let formatter = RelativeDateTimeFormatter()
        formatter.unitsStyle = .abbreviated
        return formatter.localizedString(for: date, relativeTo: Date())
    }
}

struct SubmissionRow: View {
    let emoji: String
    let label: String
    let movie: String?
    
    var body: some View {
        HStack(spacing: 8) {
            Text(emoji)
                .font(.system(size: 16))
            VStack(alignment: .leading, spacing: 2) {
                Text(label)
                    .font(.system(size: 11, weight: .medium))
                    .foregroundColor(.secondary)
                if let movie = movie, !movie.isEmpty {
                    Text(movie)
                        .font(.system(size: 13, weight: .medium))
                        .foregroundColor(.primary)
                        .lineLimit(1)
                } else {
                    Text("Not selected")
                        .font(.system(size: 13))
                        .foregroundColor(.secondary)
                        .italic()
                }
            }
        }
    }
}

struct UserSubmission: Identifiable, Codable {
    let id: String
    let action: String?
    let drama: String?
    let comedy: String?
    let thriller: String?
    let submittedAt: Date
}

#Preview {
    SubmissionListView()
}

