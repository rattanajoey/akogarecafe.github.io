//
//  OscarVotingView.swift
//  Movie Club Cafe
//
//  Created by Kavy Rattana on 11/6/25.
//

import SwiftUI
#if canImport(FirebaseFirestore)
import FirebaseFirestore
#endif

struct OscarVotingView: View {
    @Environment(\.dismiss) var dismiss
    @EnvironmentObject var authService: AuthenticationService
    
    @State private var step: VotingStep = .password
    @State private var password = ""
    @State private var voterName = ""
    @State private var categories: [OscarCategory] = []
    @State private var votes: [String: String] = [:]
    @State private var loading = false
    @State private var submitting = false
    @State private var errorMessage = ""
    @State private var showError = false
    
    private var oscarPassword: String { AppConfig.oscarPassword }
    
    var body: some View {
        NavigationView {
            ZStack {
                // Background gradient
                LinearGradient(
                    gradient: Gradient(colors: [
                        Color(red: 210/255, green: 210/255, blue: 203/255),
                        Color(red: 77/255, green: 105/255, blue: 93/255)
                    ]),
                    startPoint: .top,
                    endPoint: .bottom
                )
                .ignoresSafeArea()
                
                ScrollView {
                    VStack(spacing: 20) {
                        switch step {
                        case .password:
                            passwordStepView
                        case .name:
                            nameStepView
                        case .voting:
                            votingStepView
                        case .success:
                            successStepView
                        }
                    }
                    .padding()
                }
            }
            .navigationTitle(stepTitle)
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    if step != .success {
                        Button("Cancel") {
                            dismiss()
                        }
                    }
                }
            }
            .alert("Error", isPresented: $showError) {
                Button("OK", role: .cancel) {}
            } message: {
                Text(errorMessage)
            }
        }
    }
    
    private var stepTitle: String {
        switch step {
        case .password: return "🔐 Access Required"
        case .name: return "👤 Voter Registration"
        case .voting: return "🗳️ Cast Your Votes"
        case .success: return "✅ Success"
        }
    }
    
    private var passwordStepView: some View {
        VStack(spacing: 20) {
            Image(systemName: "trophy.fill")
                .font(.system(size: 60))
                .foregroundColor(.yellow)
            
            Text("🏆 Oscar Voting")
                .font(.largeTitle)
                .fontWeight(.bold)
                .foregroundColor(AppTheme.accentColor)
            
            Text("Enter the voting password to participate")
                .font(.body)
                .foregroundColor(AppTheme.textSecondary)
            
            VStack(spacing: 12) {
                HStack {
                    Image(systemName: "lock.fill")
                        .foregroundColor(AppTheme.textSecondary)
                    SecureField("Voting Password", text: $password)
                }
                .padding()
                .background(Color.white.opacity(0.9))
                .cornerRadius(10)
                
                Button(action: handlePasswordSubmit) {
                    Text("Continue")
                        .fontWeight(.semibold)
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(AppTheme.accentColor)
                        .foregroundColor(.white)
                        .cornerRadius(10)
                }
            }
            .padding(.top, 20)
        }
        .padding()
        .background(Color.white.opacity(0.95))
        .cornerRadius(15)
    }
    
    private var nameStepView: some View {
        VStack(spacing: 20) {
            Image(systemName: "person.fill")
                .font(.system(size: 60))
                .foregroundColor(.blue)
            
            Text("Enter Your Name")
                .font(.title)
                .fontWeight(.bold)
                .foregroundColor(AppTheme.accentColor)
            
            Text("Your votes will be tracked by this name")
                .font(.body)
                .foregroundColor(AppTheme.textSecondary)
            
            Text("⚠️ Use the same name if you want to update your votes later!")
                .font(.caption)
                .fontWeight(.bold)
                .foregroundColor(.orange)
                .multilineTextAlignment(.center)
            
            VStack(spacing: 12) {
                TextField("Your Name", text: $voterName)
                    .padding()
                    .background(Color.white.opacity(0.9))
                    .cornerRadius(10)
                
                Button(action: handleNameSubmit) {
                    Text("Continue")
                        .fontWeight(.semibold)
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color.blue)
                        .foregroundColor(.white)
                        .cornerRadius(10)
                }
            }
            .padding(.top, 20)
        }
        .padding()
        .background(Color.white.opacity(0.95))
        .cornerRadius(15)
    }
    
    private var votingStepView: some View {
        VStack(spacing: 20) {
            Image(systemName: "trophy.fill")
                .font(.system(size: 50))
                .foregroundColor(.yellow)
            
            Text("Cast Your Votes")
                .font(.title)
                .fontWeight(.bold)
                .foregroundColor(AppTheme.accentColor)
            
            Text("Vote for your favorites in each category")
                .font(.body)
                .foregroundColor(AppTheme.textSecondary)
            
            if loading {
                ProgressView()
                    .scaleEffect(1.5)
                    .padding()
            } else if categories.isEmpty {
                Text("No categories available")
                    .font(.body)
                    .foregroundColor(AppTheme.textSecondary)
                    .padding()
            } else {
                ForEach(categories) { category in
                    VStack(alignment: .leading, spacing: 10) {
                        Text(category.name)
                            .font(.headline)
                            .fontWeight(.bold)
                            .foregroundColor(AppTheme.accentColor)
                        
                        Picker("Select your choice", selection: Binding(
                            get: { votes[category.id] ?? "" },
                            set: { votes[category.id] = $0 }
                        )) {
                            Text("Select a movie").tag("")
                            ForEach(category.movies, id: \.self) { movie in
                                Text(movie).tag(movie)
                            }
                        }
                        .pickerStyle(.menu)
                        .padding()
                        .background(Color.white.opacity(0.9))
                        .cornerRadius(10)
                    }
                    .padding()
                    .background(Color.white.opacity(0.95))
                    .cornerRadius(12)
                    .overlay(
                        RoundedRectangle(cornerRadius: 12)
                            .stroke(Color.blue, lineWidth: 2)
                    )
                }
                
                Button(action: handleSubmitVotes) {
                    if submitting {
                        ProgressView()
                            .progressViewStyle(CircularProgressViewStyle(tint: .white))
                    } else {
                        Text("Submit Votes")
                            .fontWeight(.semibold)
                    }
                }
                .frame(maxWidth: .infinity)
                .padding()
                .background(votes.isEmpty ? Color.gray : AppTheme.accentColor)
                .foregroundColor(.white)
                .cornerRadius(10)
                .disabled(votes.isEmpty || submitting)
            }
        }
    }
    
    private var successStepView: some View {
        VStack(spacing: 20) {
            Image(systemName: "checkmark.circle.fill")
                .font(.system(size: 80))
                .foregroundColor(.green)
            
            Text("🎉 Votes Submitted!")
                .font(.largeTitle)
                .fontWeight(.bold)
                .foregroundColor(.green)
            
            Text("Thank you for participating in the Oscar voting!")
                .font(.body)
                .foregroundColor(AppTheme.textSecondary)
                .multilineTextAlignment(.center)
            
            Text("Results will be announced later. You can update your votes anytime by voting again.")
                .font(.caption)
                .foregroundColor(AppTheme.textSecondary)
                .multilineTextAlignment(.center)
            
            Button(action: { dismiss() }) {
                Text("Close")
                    .fontWeight(.semibold)
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(Color.blue)
                    .foregroundColor(.white)
                    .cornerRadius(10)
            }
            .padding(.top, 20)
        }
        .padding()
        .background(Color.white.opacity(0.95))
        .cornerRadius(15)
    }
    
    private func handlePasswordSubmit() {
        if password == oscarPassword {
            step = .name
            errorMessage = ""
        } else {
            errorMessage = "Incorrect password"
            showError = true
        }
    }
    
    private func handleNameSubmit() {
        if voterName.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
            errorMessage = "Please enter your name"
            showError = true
        } else {
            step = .voting
            fetchCategories()
        }
    }
    
    private func fetchCategories() {
        #if canImport(FirebaseFirestore)
        loading = true
        let db = FirebaseConfig.shared.db
        
        Task {
            do {
                let snapshot = try await db.collection("OscarCategories").getDocuments()
                var fetchedCategories: [OscarCategory] = []
                
                for document in snapshot.documents {
                    let data = document.data()
                    if let name = data["name"] as? String,
                       let movies = data["movies"] as? [String] {
                        fetchedCategories.append(OscarCategory(
                            id: document.documentID,
                            name: name,
                            movies: movies
                        ))
                    }
                }
                
                await MainActor.run {
                    categories = fetchedCategories
                    loading = false
                }
            } catch {
                await MainActor.run {
                    errorMessage = "Failed to load voting categories"
                    showError = true
                    loading = false
                }
            }
        }
        #endif
    }
    
    private func handleSubmitVotes() {
        #if canImport(FirebaseFirestore)
        submitting = true
        let db = FirebaseConfig.shared.db
        
        Task {
            do {
                for (categoryId, movie) in votes where !movie.isEmpty {
                    let voteRef = db.collection("OscarVotes").document("\(voterName)_\(categoryId)")
                    let voteDoc = try await voteRef.getDocument()
                    
                    let voteData: [String: Any] = [
                        "voterName": voterName,
                        "categoryId": categoryId,
                        "movie": movie,
                        "timestamp": Timestamp(date: Date()),
                        "updated": voteDoc.exists
                    ]
                    
                    try await voteRef.setData(voteData)
                }
                
                await MainActor.run {
                    step = .success
                    submitting = false
                }
            } catch {
                await MainActor.run {
                    errorMessage = "Failed to submit votes. Please try again."
                    showError = true
                    submitting = false
                }
            }
        }
        #endif
    }
}

enum VotingStep {
    case password
    case name
    case voting
    case success
}

struct OscarCategory: Identifiable, Codable {
    let id: String
    let name: String
    let movies: [String]
}

#Preview {
    OscarVotingView()
        .environmentObject(AuthenticationService())
}

