//
//  SignInView.swift
//  Movie Club Cafe
//
//  Created by Kavy Rattana on 10/5/25.
//

import SwiftUI
import AuthenticationServices

struct SignInView: View {
    @EnvironmentObject var authService: AuthenticationService
    @State private var email = ""
    @State private var password = ""
    @State private var showingSignUp = false
    @State private var showingForgotPassword = false
    @State private var errorMessage: String?
    @State private var showError = false
    
    var body: some View {
        NavigationView {
            ZStack {
                // Background gradient
                LinearGradient(
                    colors: [Color.purple.opacity(0.3), Color.blue.opacity(0.3)],
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )
                .ignoresSafeArea()
                
                ScrollView {
                    VStack(spacing: 25) {
                        // Logo and Title
                        VStack(spacing: 10) {
                            Image(systemName: "film.stack")
                                .font(.system(size: 80))
                                .foregroundStyle(.purple)
                            
                            Text("Movie Club Cafe")
                                .font(.largeTitle.bold())
                            
                            Text("Welcome back!")
                                .font(.title3)
                                .foregroundStyle(.secondary)
                        }
                        .padding(.top, 50)
                        .padding(.bottom, 30)
                        
                        // Email/Password Sign In
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
                            
                            SecureField("Password", text: $password)
                                .padding()
                                .background(Color(.systemBackground))
                                .cornerRadius(10)
                                .overlay(
                                    RoundedRectangle(cornerRadius: 10)
                                        .stroke(Color.gray.opacity(0.3), lineWidth: 1)
                                )
                            
                            Button(action: {
                                showingForgotPassword = true
                            }) {
                                Text("Forgot Password?")
                                    .font(.subheadline)
                                    .foregroundColor(.purple)
                            }
                            .frame(maxWidth: .infinity, alignment: .trailing)
                            
                            Button(action: signIn) {
                                if authService.isLoading {
                                    ProgressView()
                                        .tint(.white)
                                } else {
                                    Text("Sign In")
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
                            .disabled(authService.isLoading || email.isEmpty || password.isEmpty)
                            .opacity((email.isEmpty || password.isEmpty) ? 0.6 : 1)
                        }
                        .padding(.horizontal)
                        
                        // Divider
                        HStack {
                            Rectangle()
                                .frame(height: 1)
                                .foregroundColor(.gray.opacity(0.3))
                            Text("OR")
                                .foregroundStyle(.secondary)
                                .padding(.horizontal, 10)
                            Rectangle()
                                .frame(height: 1)
                                .foregroundColor(.gray.opacity(0.3))
                        }
                        .padding(.horizontal)
                        .padding(.vertical, 10)
                        
                        // Social Sign In Buttons
                        VStack(spacing: 12) {
                            // Apple Sign In
                            SignInWithAppleButton(
                                .signIn,
                                onRequest: { request in
                                    request.requestedScopes = [.fullName, .email]
                                    request.nonce = authService.startSignInWithAppleFlow()
                                },
                                onCompletion: { result in
                                    handleAppleSignIn(result)
                                }
                            )
                            .frame(height: 50)
                            .cornerRadius(10)
                            
                            // Google Sign In (placeholder)
                            Button(action: signInWithGoogle) {
                                HStack {
                                    Image(systemName: "g.circle.fill")
                                        .font(.title3)
                                    Text("Continue with Google")
                                        .fontWeight(.medium)
                                }
                                .frame(maxWidth: .infinity)
                                .padding()
                                .background(Color(.systemBackground))
                                .foregroundColor(.primary)
                                .cornerRadius(10)
                                .overlay(
                                    RoundedRectangle(cornerRadius: 10)
                                        .stroke(Color.gray.opacity(0.3), lineWidth: 1)
                                )
                            }
                        }
                        .padding(.horizontal)
                        
                        // Sign Up Link
                        HStack {
                            Text("Don't have an account?")
                                .foregroundStyle(.secondary)
                            Button(action: {
                                showingSignUp = true
                            }) {
                                Text("Sign Up")
                                    .fontWeight(.semibold)
                                    .foregroundColor(.purple)
                            }
                        }
                        .padding(.top, 20)
                        
                        Spacer()
                    }
                }
            }
            .navigationBarHidden(true)
            .sheet(isPresented: $showingSignUp) {
                SignUpView()
            }
            .sheet(isPresented: $showingForgotPassword) {
                ForgotPasswordView()
            }
            .alert("Error", isPresented: $showError) {
                Button("OK", role: .cancel) { }
            } message: {
                Text(errorMessage ?? "An error occurred")
            }
        }
    }
    
    private func signIn() {
        Task {
            do {
                try await authService.signIn(email: email, password: password)
            } catch {
                errorMessage = error.localizedDescription
                showError = true
            }
        }
    }
    
    private func handleAppleSignIn(_ result: Result<ASAuthorization, Error>) {
        Task {
            do {
                switch result {
                case .success(let authorization):
                    try await authService.signInWithApple(authorization: authorization)
                case .failure(let error):
                    errorMessage = error.localizedDescription
                    showError = true
                }
            } catch {
                errorMessage = error.localizedDescription
                showError = true
            }
        }
    }
    
    private func signInWithGoogle() {
        Task {
            do {
                try await authService.signInWithGoogle()
            } catch {
                errorMessage = "Google Sign In is not yet implemented"
                showError = true
            }
        }
    }
}

#Preview {
    SignInView()
        .environmentObject(AuthenticationService())
}
