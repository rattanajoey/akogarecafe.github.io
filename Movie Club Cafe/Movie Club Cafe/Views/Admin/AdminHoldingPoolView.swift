//
//  AdminHoldingPoolView.swift
//  Movie Club Cafe
//
//  Created by Kavy Rattana on 11/7/25.
//

import SwiftUI
#if canImport(FirebaseFirestore)
import FirebaseFirestore
#endif

struct AdminHoldingPoolView: View {
    @State private var holdingSubmissions: [HoldingPoolSubmission] = []
    @State private var isLoading = false
    @State private var errorMessage = ""
    @State private var showError = false
    @State private var successMessage = ""
    @State private var showSuccess = false
    @State private var editingSubmission: HoldingPoolSubmission?
    @State private var showEditDialog = false
    
    var body: some View {
        ScrollView {
            VStack(spacing: 20) {
                // Header
                HStack {
                    Image(systemName: "tray.full.fill")
                        .font(.system(size: 40))
                        .foregroundColor(.orange)
                    Text("📋 Holding Pool Management")
                        .font(.title)
                        .fontWeight(.bold)
                }
                .padding()
                
                Text("Review and manage movie submissions waiting for approval")
                    .font(.subheadline)
                    .foregroundColor(.secondary)
                
                Divider()
                
                if isLoading {
                    ProgressView()
                        .padding()
                } else if holdingSubmissions.isEmpty {
                    VStack(spacing: 15) {
                        Image(systemName: "tray")
                            .font(.system(size: 60))
                            .foregroundColor(.gray)
                        Text("No submissions in holding pool")
                            .font(.headline)
                            .foregroundColor(.secondary)
                    }
                    .frame(maxWidth: .infinity)
                    .padding(40)
                } else {
                    Text("\(holdingSubmissions.count) submission(s) pending review")
                        .font(.headline)
                        .padding()
                    
                    ForEach(holdingSubmissions, id: \.userId) { submission in
                        HoldingSubmissionCard(
                            submission: submission,
                            onApprove: { approveSubmission(submission) },
                            onEdit: {
                                editingSubmission = submission
                                showEditDialog = true
                            },
                            onDelete: { deleteSubmission(submission) }
                        )
                    }
                }
            }
            .padding()
        }
        .onAppear {
            loadHoldingPool()
        }
        .sheet(isPresented: $showEditDialog) {
            if let submission = editingSubmission {
                EditSubmissionSheet(
                    submission: submission,
                    onSave: { edited in
                        updateSubmission(edited)
                        showEditDialog = false
                    },
                    onCancel: { showEditDialog = false }
                )
            }
        }
        .alert("Error", isPresented: $showError) {
            Button("OK", role: .cancel) {}
        } message: {
            Text(errorMessage)
        }
        .alert("Success", isPresented: $showSuccess) {
            Button("OK", role: .cancel) {}
        } message: {
            Text(successMessage)
        }
    }
    
    // MARK: - Firebase Operations
    
    private func loadHoldingPool() {
        #if canImport(FirebaseFirestore)
        isLoading = true
        let db = FirebaseConfig.shared.db
        
        Task {
            do {
                let snapshot = try await db.collection("HoldingPool").getDocuments()
                let submissions = try snapshot.documents.compactMap { doc -> HoldingPoolSubmission? in
                    var data = try doc.data(as: MovieSubmissionData.self)
                    return HoldingPoolSubmission(
                        userId: doc.documentID,
                        nickname: data.nickname,
                        action: data.action,
                        drama: data.drama,
                        comedy: data.comedy,
                        thriller: data.thriller
                    )
                }
                
                await MainActor.run {
                    self.holdingSubmissions = submissions
                    self.isLoading = false
                }
            } catch {
                await MainActor.run {
                    errorMessage = "Failed to load holding pool: \(error.localizedDescription)"
                    showError = true
                    isLoading = false
                }
            }
        }
        #endif
    }
    
    private func approveSubmission(_ submission: HoldingPoolSubmission) {
        #if canImport(FirebaseFirestore)
        let db = FirebaseConfig.shared.db
        let currentMonth = getCurrentMonth()
        
        Task {
            do {
                // Move to current submissions
                let submissionData = MovieSubmissionData(
                    nickname: submission.nickname,
                    action: submission.action,
                    drama: submission.drama,
                    comedy: submission.comedy,
                    thriller: submission.thriller
                )
                
                try db.collection("Submissions")
                    .document(currentMonth)
                    .collection("users")
                    .document(submission.userId)
                    .setData(from: submissionData)
                
                // Delete from holding pool
                try await db.collection("HoldingPool").document(submission.userId).delete()
                
                // Update genre pools
                await updateGenrePools(with: submission)
                
                await MainActor.run {
                    holdingSubmissions.removeAll { $0.userId == submission.userId }
                    successMessage = "Submission approved and moved to current month!"
                    showSuccess = true
                }
            } catch {
                await MainActor.run {
                    errorMessage = "Failed to approve submission: \(error.localizedDescription)"
                    showError = true
                }
            }
        }
        #endif
    }
    
    private func updateGenrePools(with submission: HoldingPoolSubmission) async {
        #if canImport(FirebaseFirestore)
        let db = FirebaseConfig.shared.db
        
        do {
            let poolRef = db.collection("GenrePools").document("current")
            let document = try await poolRef.getDocument()
            
            var pools = try document.data(as: GenrePools.self)
            
            // Add new movies to pools
            if !submission.action.isEmpty {
                pools.action.append(Movie(title: submission.action, submittedBy: submission.nickname))
            }
            if !submission.drama.isEmpty {
                pools.drama.append(Movie(title: submission.drama, submittedBy: submission.nickname))
            }
            if !submission.comedy.isEmpty {
                pools.comedy.append(Movie(title: submission.comedy, submittedBy: submission.nickname))
            }
            if !submission.thriller.isEmpty {
                pools.thriller.append(Movie(title: submission.thriller, submittedBy: submission.nickname))
            }
            
            try poolRef.setData(from: pools)
        } catch {
            print("Error updating genre pools: \(error.localizedDescription)")
        }
        #endif
    }
    
    private func updateSubmission(_ submission: HoldingPoolSubmission) {
        #if canImport(FirebaseFirestore)
        let db = FirebaseConfig.shared.db
        
        Task {
            do {
                let submissionData = MovieSubmissionData(
                    nickname: submission.nickname,
                    action: submission.action,
                    drama: submission.drama,
                    comedy: submission.comedy,
                    thriller: submission.thriller
                )
                
                try db.collection("HoldingPool").document(submission.userId).setData(from: submissionData)
                
                await MainActor.run {
                    if let index = holdingSubmissions.firstIndex(where: { $0.userId == submission.userId }) {
                        holdingSubmissions[index] = submission
                    }
                    successMessage = "Submission updated successfully!"
                    showSuccess = true
                }
            } catch {
                await MainActor.run {
                    errorMessage = "Failed to update submission: \(error.localizedDescription)"
                    showError = true
                }
            }
        }
        #endif
    }
    
    private func deleteSubmission(_ submission: HoldingPoolSubmission) {
        #if canImport(FirebaseFirestore)
        let db = FirebaseConfig.shared.db
        
        Task {
            do {
                try await db.collection("HoldingPool").document(submission.userId).delete()
                
                await MainActor.run {
                    holdingSubmissions.removeAll { $0.userId == submission.userId }
                    successMessage = "Submission deleted successfully!"
                    showSuccess = true
                }
            } catch {
                await MainActor.run {
                    errorMessage = "Failed to delete submission: \(error.localizedDescription)"
                    showError = true
                }
            }
        }
        #endif
    }
}

// MARK: - Supporting Types & Views

struct HoldingPoolSubmission {
    let userId: String
    var nickname: String
    var action: String
    var drama: String
    var comedy: String
    var thriller: String
}

struct HoldingSubmissionCard: View {
    let submission: HoldingPoolSubmission
    let onApprove: () -> Void
    let onEdit: () -> Void
    let onDelete: () -> Void
    
    @State private var showDeleteConfirmation = false
    @State private var isExpanded = false
    
    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack {
                Image(systemName: "person.circle.fill")
                    .foregroundColor(AppTheme.accentColor)
                Text(submission.nickname)
                    .font(.headline)
                
                Spacer()
                
                Button(action: { isExpanded.toggle() }) {
                    Image(systemName: isExpanded ? "chevron.up" : "chevron.down")
                        .foregroundColor(.secondary)
                }
            }
            
            if isExpanded {
                VStack(alignment: .leading, spacing: 8) {
                    GenreRow(emoji: "💥", genre: "Action/Sci-Fi", title: submission.action)
                    GenreRow(emoji: "🎭", genre: "Drama/Documentary", title: submission.drama)
                    GenreRow(emoji: "😂", genre: "Comedy/Musical", title: submission.comedy)
                    GenreRow(emoji: "😱", genre: "Thriller/Horror", title: submission.thriller)
                    
                    Divider()
                    
                    HStack(spacing: 10) {
                        Button(action: onApprove) {
                            Label("Approve", systemImage: "checkmark.circle.fill")
                                .font(.subheadline)
                                .fontWeight(.semibold)
                                .frame(maxWidth: .infinity)
                                .padding(.vertical, 10)
                                .background(Color.green)
                                .foregroundColor(.white)
                                .cornerRadius(8)
                        }
                        
                        Button(action: onEdit) {
                            Label("Edit", systemImage: "pencil")
                                .font(.subheadline)
                                .fontWeight(.semibold)
                                .frame(maxWidth: .infinity)
                                .padding(.vertical, 10)
                                .background(Color.blue)
                                .foregroundColor(.white)
                                .cornerRadius(8)
                        }
                        
                        Button(action: { showDeleteConfirmation = true }) {
                            Label("Delete", systemImage: "trash")
                                .font(.subheadline)
                                .fontWeight(.semibold)
                                .frame(maxWidth: .infinity)
                                .padding(.vertical, 10)
                                .background(Color.red)
                                .foregroundColor(.white)
                                .cornerRadius(8)
                        }
                    }
                }
            }
        }
        .padding()
        .background(Color.gray.opacity(0.1))
        .cornerRadius(10)
        .confirmationDialog("Delete Submission", isPresented: $showDeleteConfirmation) {
            Button("Delete", role: .destructive, action: onDelete)
            Button("Cancel", role: .cancel) {}
        } message: {
            Text("Are you sure you want to delete \(submission.nickname)'s submission?")
        }
    }
}

struct GenreRow: View {
    let emoji: String
    let genre: String
    let title: String
    
    var body: some View {
        HStack {
            Text(emoji)
            Text(genre + ":")
                .font(.caption)
                .fontWeight(.semibold)
            Text(title.isEmpty ? "(empty)" : title)
                .font(.caption)
                .foregroundColor(title.isEmpty ? .secondary : .primary)
        }
    }
}

struct EditSubmissionSheet: View {
    @State private var editedSubmission: HoldingPoolSubmission
    let onSave: (HoldingPoolSubmission) -> Void
    let onCancel: () -> Void
    
    init(submission: HoldingPoolSubmission, onSave: @escaping (HoldingPoolSubmission) -> Void, onCancel: @escaping () -> Void) {
        _editedSubmission = State(initialValue: submission)
        self.onSave = onSave
        self.onCancel = onCancel
    }
    
    var body: some View {
        NavigationView {
            Form {
                Section("Submitter") {
                    TextField("Nickname", text: $editedSubmission.nickname)
                }
                
                Section("Movies") {
                    TextField("Action/Sci-Fi", text: $editedSubmission.action)
                    TextField("Drama/Documentary", text: $editedSubmission.drama)
                    TextField("Comedy/Musical", text: $editedSubmission.comedy)
                    TextField("Thriller/Horror", text: $editedSubmission.thriller)
                }
            }
            .navigationTitle("Edit Submission")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel", action: onCancel)
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Save") {
                        onSave(editedSubmission)
                    }
                }
            }
        }
    }
}

#Preview {
    AdminHoldingPoolView()
}

