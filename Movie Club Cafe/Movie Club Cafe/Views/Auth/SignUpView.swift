//
//  SignUpView.swift
//  Movie Club Cafe
//
//  Created by Kavy Rattana on 10/5/25.
//

import SwiftUI

struct SignUpView: View {
    @Environment(\.dismiss) var dismiss
    @EnvironmentObject var authService: AuthenticationService
    
    @State private var email = ""
    @State private var password = ""
    @State private var confirmPassword = ""
    @State private var displayName = ""
    @State private var errorMessage: String?
    @State private var showError = false
    
    var body: some View {
        NavigationView {
            ZStack {
                // Background gradient
                LinearGradient(
                    colors: [Color.blue.opacity(0.3), Color.purple.opacity(0.3)],
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )
                .ignoresSafeArea()
                
                ScrollView {
                    VStack(spacing: 25) {
                        // Header
                        VStack(spacing: 10) {
                            Image(systemName: "person.crop.circle.badge.plus")
                                .font(.system(size: 80))
                                .foregroundStyle(.blue)
                            
                            Text("Create Account")
                                .font(.largeTitle.bold())
                            
                            Text("Join the Movie Club Cafe")
                                .font(.title3)
                                .foregroundStyle(.secondary)
                        }
                        .padding(.top, 50)
                        .padding(.bottom, 30)
                        
                        // Form Fields
                        VStack(spacing: 15) {
                            TextField("Display Name (Optional)", text: $displayName)
                                .autocorrectionDisabled()
                                .padding()
                                .background(Color(.systemBackground))
                                .cornerRadius(10)
                                .overlay(
                                    RoundedRectangle(cornerRadius: 10)
                                        .stroke(Color.gray.opacity(0.3), lineWidth: 1)
                                )
                            
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
                            
                            SecureField("Password", text: $password)
                                .padding()
                                .background(Color(.systemBackground))
                                .cornerRadius(10)
                                .overlay(
                                    RoundedRectangle(cornerRadius: 10)
                                        .stroke(Color.gray.opacity(0.3), lineWidth: 1)
                                )
                            
                            SecureField("Confirm Password", text: $confirmPassword)
                                .padding()
                                .background(Color(.systemBackground))
                                .cornerRadius(10)
                                .overlay(
                                    RoundedRectangle(cornerRadius: 10)
                                        .stroke(passwordsMatch ? Color.green.opacity(0.5) : Color.gray.opacity(0.3), lineWidth: 1)
                                )
                            
                            // Password Requirements
                            if !password.isEmpty {
                                VStack(alignment: .leading, spacing: 5) {
                                    PasswordRequirement(
                                        text: "At least 6 characters",
                                        isMet: password.count >= 6
                                    )
                                }
                                .padding(.horizontal, 5)
                            }
                            
                            Button(action: signUp) {
                                if authService.isLoading {
                                    ProgressView()
                                        .tint(.white)
                                } else {
                                    Text("Create Account")
                                        .fontWeight(.semibold)
                                }
                            }
                            .frame(maxWidth: .infinity)
                            .padding()
                            .background(
                                LinearGradient(
                                    colors: [.blue, .purple],
                                    startPoint: .leading,
                                    endPoint: .trailing
                                )
                            )
                            .foregroundColor(.white)
                            .cornerRadius(10)
                            .disabled(authService.isLoading || !isFormValid)
                            .opacity(isFormValid ? 1 : 0.6)
                        }
                        .padding(.horizontal)
                        
                        // Terms and Privacy
                        Text("By signing up, you agree to our Terms of Service and Privacy Policy")
                            .font(.caption)
                            .foregroundStyle(.secondary)
                            .multilineTextAlignment(.center)
                            .padding(.horizontal)
                        
                        Spacer()
                    }
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
            .alert("Error", isPresented: $showError) {
                Button("OK", role: .cancel) { }
            } message: {
                Text(errorMessage ?? "An error occurred")
            }
        }
    }
    
    private var isFormValid: Bool {
        !email.isEmpty &&
        !password.isEmpty &&
        password.count >= 6 &&
        passwordsMatch
    }
    
    private var passwordsMatch: Bool {
        !confirmPassword.isEmpty && password == confirmPassword
    }
    
    private func signUp() {
        Task {
            do {
                let name = displayName.isEmpty ? nil : displayName
                try await authService.signUp(email: email, password: password, displayName: name)
                dismiss()
            } catch {
                errorMessage = error.localizedDescription
                showError = true
            }
        }
    }
}

struct PasswordRequirement: View {
    let text: String
    let isMet: Bool
    
    var body: some View {
        HStack(spacing: 8) {
            Image(systemName: isMet ? "checkmark.circle.fill" : "circle")
                .foregroundColor(isMet ? .green : .gray)
                .font(.caption)
            Text(text)
                .font(.caption)
                .foregroundColor(isMet ? .green : .secondary)
        }
    }
}

#Preview {
    SignUpView()
        .environmentObject(AuthenticationService())
}
