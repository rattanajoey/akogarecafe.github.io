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
        VStack(alignment: .leading, spacing: 12) {
            Text("Submissions for \(getCurrentMonthDisplay())")
                .font(.title2)
                .fontWeight(.bold)
                .foregroundColor(AppTheme.accentColor)
                .padding(.horizontal)
            
            if submissions.isEmpty {
                Text("No submissions yet.")
                    .font(.body)
                    .foregroundColor(AppTheme.textSecondary)
                    .padding()
                    .frame(maxWidth: .infinity, alignment: .center)
            } else {
                ScrollView(.horizontal, showsIndicators: true) {
                    HStack(spacing: 16) {
                        ForEach(submissions) { submission in
                            SubmissionCard(submission: submission)
                        }
                    }
                    .padding(.horizontal)
                }
            }
        }
        .padding(.vertical)
        .background(
            RoundedRectangle(cornerRadius: 10)
                .fill(Color(red: 131/255, green: 167/255, blue: 157/255).opacity(0.8))
        )
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
        VStack(alignment: .leading, spacing: 8) {
            Text(submission.id)
                .font(.headline)
                .fontWeight(.bold)
                .foregroundColor(.white)
                .lineLimit(1)
            
            VStack(alignment: .leading, spacing: 4) {
                SubmissionRow(emoji: "🎬", movie: submission.action ?? "No Action")
                SubmissionRow(emoji: "🎭", movie: submission.drama ?? "No Drama")
                SubmissionRow(emoji: "😂", movie: submission.comedy ?? "No Comedy")
                SubmissionRow(emoji: "😱", movie: submission.thriller ?? "No Thriller")
            }
        }
        .padding()
        .frame(minWidth: 250, maxWidth: 280)
        .background(Color(red: 77/255, green: 105/255, blue: 93/255))
        .cornerRadius(10)
        .shadow(color: .black.opacity(0.3), radius: 5, x: 0, y: 4)
    }
}

struct SubmissionRow: View {
    let emoji: String
    let movie: String
    
    var body: some View {
        HStack(spacing: 4) {
            Text(emoji)
                .font(.body)
            Text(movie)
                .font(.caption)
                .foregroundColor(.white)
                .lineLimit(1)
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

