//
//  MovieSubmissionView.swift
//  Movie Club Cafe
//
//  Created by Kavy Rattana on 10/4/25.
//

import SwiftUI
import FirebaseFirestore

struct MovieSubmissionView: View {
    @State private var nickname = ""
    @State private var accessCode = ""
    @State private var actionMovie = ""
    @State private var dramaMovie = ""
    @State private var comedyMovie = ""
    @State private var thrillerMovie = ""
    @State private var errorMessage = ""
    @State private var showingAlert = false
    @State private var alertTitle = ""
    @State private var alertMessage = ""
    
    private let validAccessCode = "thunderbolts"
    
    var body: some View {
        ScrollView {
            VStack(spacing: 20) {
                Text("Submit Your Movie Picks")
                    .font(.title2)
                    .fontWeight(.bold)
                    .foregroundColor(AppTheme.textPrimary)
                    .padding(.top)
                
                if !errorMessage.isEmpty {
                    Text(errorMessage)
                        .font(.caption)
                        .foregroundColor(.red)
                        .padding(.horizontal)
                }
                
                VStack(spacing: 16) {
                    // Nickname field
                    VStack(alignment: .leading, spacing: 4) {
                        Text("Nickname (Case Sensitive)")
                            .font(.caption)
                            .foregroundColor(.white)
                        TextField("", text: $nickname)
                            .textFieldStyle(RoundedBorderTextFieldStyle())
                    }
                    
                    // Access code field
                    VStack(alignment: .leading, spacing: 4) {
                        Text("Password (Check your partiful invite)")
                            .font(.caption)
                            .foregroundColor(.white)
                        SecureField("", text: $accessCode)
                            .textFieldStyle(RoundedBorderTextFieldStyle())
                    }
                    
                    Divider()
                        .padding(.vertical, 8)
                    
                    // Movie fields
                    VStack(alignment: .leading, spacing: 4) {
                        Text("Action/Sci-Fi/Fantasy")
                            .font(.caption)
                            .foregroundColor(.white)
                        TextField("", text: $actionMovie)
                            .textFieldStyle(RoundedBorderTextFieldStyle())
                    }
                    
                    VStack(alignment: .leading, spacing: 4) {
                        Text("Drama/Documentary")
                            .font(.caption)
                            .foregroundColor(.white)
                        TextField("", text: $dramaMovie)
                            .textFieldStyle(RoundedBorderTextFieldStyle())
                    }
                    
                    VStack(alignment: .leading, spacing: 4) {
                        Text("Comedy/Musical")
                            .font(.caption)
                            .foregroundColor(.white)
                        TextField("", text: $comedyMovie)
                            .textFieldStyle(RoundedBorderTextFieldStyle())
                    }
                    
                    VStack(alignment: .leading, spacing: 4) {
                        Text("Thriller/Horror")
                            .font(.caption)
                            .foregroundColor(.white)
                        TextField("", text: $thrillerMovie)
                            .textFieldStyle(RoundedBorderTextFieldStyle())
                    }
                    
                    // Submit button
                    Button(action: handleSubmit) {
                        Text("Submit")
                            .font(.headline)
                            .foregroundColor(.white)
                            .frame(maxWidth: .infinity)
                            .padding()
                            .background(Color(hex: "4d695d"))
                            .cornerRadius(8)
                    }
                    .padding(.top)
                }
                .padding()
                .background(Color(hex: "83a79d").opacity(0.8))
                .cornerRadius(10)
                .padding(.horizontal)
            }
        }
        .alert(alertTitle, isPresented: $showingAlert) {
            Button("OK", role: .cancel) { }
        } message: {
            Text(alertMessage)
        }
    }
    
    private func handleSubmit() {
        errorMessage = ""
        
        guard !nickname.isEmpty, !accessCode.isEmpty else {
            errorMessage = "Nickname & Password are required!"
            return
        }
        
        guard accessCode == validAccessCode else {
            errorMessage = "Incorrect Password!"
            return
        }
        
        Task {
            do {
                let db = FirebaseConfig.shared.db
                let currentMonth = getCurrentMonth()
                let userRef = db.collection("Submissions")
                    .document(currentMonth)
                    .collection("users")
                    .document(nickname)
                
                let userSnap = try await userRef.getDocument()
                
                let data: [String: Any] = [
                    "accesscode": accessCode,
                    "action": actionMovie,
                    "drama": dramaMovie,
                    "comedy": comedyMovie,
                    "thriller": thrillerMovie,
                    "submittedAt": Date()
                ]
                
                try await userRef.setData(data, merge: true)
                
                alertTitle = "Success"
                alertMessage = userSnap.exists ? "Submission updated!" : "Submission added!"
                showingAlert = true
                
                // Clear form
                nickname = ""
                accessCode = ""
                actionMovie = ""
                dramaMovie = ""
                comedyMovie = ""
                thrillerMovie = ""
            } catch {
                errorMessage = "🔥 Firestore Error: Failed to submit. Please try again."
                print("Firestore Error:", error)
            }
        }
    }
}

#Preview {
    MovieSubmissionView()
}

