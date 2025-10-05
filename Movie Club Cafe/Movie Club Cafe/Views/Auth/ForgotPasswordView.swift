//
//  ForgotPasswordView.swift
//  Movie Club Cafe
//
//  Created by Kavy Rattana on 10/5/25.
//

import SwiftUI

struct ForgotPasswordView: View {
    @Environment(\.dismiss) var dismiss
    @EnvironmentObject var authService: AuthenticationService
    
    @State private var email = ""
    @State private var errorMessage: String?
    @State private var showError = false
    @State private var showSuccess = false
    
    var body: some View {
        NavigationView {
            ZStack {
                // Background
                LinearGradient(
                    colors: [Color.purple.opacity(0.2), Color.blue.opacity(0.2)],
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )
                .ignoresSafeArea()
                
                VStack(spacing: 30) {
                    // Icon and Title
                    VStack(spacing: 15) {
                        Image(systemName: "lock.rotation")
                            .font(.system(size: 70))
                            .foregroundStyle(.purple)
                        
                        Text("Reset Password")
                            .font(.title.bold())
                        
                        Text("Enter your email address and we'll send you instructions to reset your password")
                            .font(.body)
                            .foregroundStyle(.secondary)
                            .multilineTextAlignment(.center)
                            .padding(.horizontal)
                    }
                    .padding(.top, 50)
                    
                    // Email Field
                    VStack(spacing: 15) {
                        TextField("Email", text: $email)
                            .textInputAutocapitalization(.never)
                            .keyboardType(.emailAddress)
                            .autocorrectionDisabled()
                            .padding()
                            .background(Color(.systemBackground))
                            .cornerRadius(10)
                            .overlay(
                                RoundedRectangle(cornerRadius: 10)
                                    .stroke(Color.gray.opacity(0.3), lineWidth: 1)
                            )
                        
                        Button(action: resetPassword) {
                            if authService.isLoading {
                                ProgressView()
                                    .tint(.white)
                            } else {
                                Text("Send Reset Link")
                                    .fontWeight(.semibold)
                            }
                        }
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(
                            LinearGradient(
                                colors: [.purple, .blue],
                                startPoint: .leading,
                                endPoint: .trailing
                            )
                        )
                        .foregroundColor(.white)
                        .cornerRadius(10)
                        .disabled(authService.isLoading || email.isEmpty)
                        .opacity(email.isEmpty ? 0.6 : 1)
                    }
                    .padding(.horizontal)
                    
                    Spacer()
                }
            }
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") {
                        dismiss()
                    }
                }
            }
            .alert("Success", isPresented: $showSuccess) {
                Button("OK") {
                    dismiss()
                }
            } message: {
                Text("Password reset email sent. Please check your inbox.")
            }
            .alert("Error", isPresented: $showError) {
                Button("OK", role: .cancel) { }
            } message: {
                Text(errorMessage ?? "An error occurred")
            }
        }
    }
    
    private func resetPassword() {
        Task {
            do {
                try await authService.resetPassword(email: email)
                showSuccess = true
            } catch {
                errorMessage = error.localizedDescription
                showError = true
            }
        }
    }
}

#Preview {
    ForgotPasswordView()
        .environmentObject(AuthenticationService())
}
