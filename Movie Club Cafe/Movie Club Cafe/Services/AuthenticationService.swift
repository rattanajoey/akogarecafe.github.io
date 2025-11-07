//
//  AuthenticationService.swift
//  Movie Club Cafe
//
//  Created by Kavy Rattana on 10/5/25.
//

import Foundation
import FirebaseAuth
import FirebaseFirestore
import Combine
import AuthenticationServices
import CryptoKit
import GoogleSignIn

@MainActor
class AuthenticationService: ObservableObject {
    @Published var currentUser: AppUser?
    @Published var isAuthenticated = false
    @Published var isLoading = false
    
    private var authStateHandle: AuthStateDidChangeListenerHandle?
    private let db = FirebaseConfig.shared.db
    private let auth = FirebaseConfig.shared.auth
    
    // For Apple Sign In
    private var currentNonce: String?
    
    // Admin role checking
    var isAdmin: Bool {
        currentUser?.role == "admin"
    }
    
    init() {
        setupAuthStateListener()
    }
    
    deinit {
        if let handle = authStateHandle {
            auth.removeStateDidChangeListener(handle)
        }
    }
    
    // MARK: - Auth State Management
    
    private func setupAuthStateListener() {
        authStateHandle = auth.addStateDidChangeListener { [weak self] _, user in
            Task { @MainActor in
                if let user = user {
                    await self?.loadUserData(firebaseUser: user)
                } else {
                    self?.currentUser = nil
                    self?.isAuthenticated = false
                }
            }
        }
    }
    
    private func loadUserData(firebaseUser: User) async {
        do {
            let userDoc = try await db.collection("users").document(firebaseUser.uid).getDocument()
            
            if userDoc.exists, let userData = try? userDoc.data(as: AppUser.self) {
                currentUser = userData
            } else {
                // Create new user document if it doesn't exist
                let newUser = AppUser(from: firebaseUser)
                try await createUserDocument(user: newUser)
                currentUser = newUser
            }
            
            isAuthenticated = true
        } catch {
            print("Error loading user data: \(error.localizedDescription)")
            currentUser = AppUser(from: firebaseUser)
            isAuthenticated = true
        }
    }
    
    private func createUserDocument(user: AppUser) async throws {
        try db.collection("users").document(user.id).setData(from: user)
    }
    
    // MARK: - Email/Password Authentication
    
    func signUp(email: String, password: String, displayName: String?) async throws {
        isLoading = true
        defer { isLoading = false }
        
        do {
            let result = try await auth.createUser(withEmail: email, password: password)
            
            // Update display name if provided
            if let displayName = displayName {
                let changeRequest = result.user.createProfileChangeRequest()
                changeRequest.displayName = displayName
                try await changeRequest.commitChanges()
            }
            
            // Create user document
            var newUser = AppUser(from: result.user)
            newUser.displayName = displayName
            try await createUserDocument(user: newUser)
            
        } catch let error as NSError {
            throw mapAuthError(error)
        }
    }
    
    func signIn(email: String, password: String) async throws {
        isLoading = true
        defer { isLoading = false }
        
        do {
            try await auth.signIn(withEmail: email, password: password)
        } catch let error as NSError {
            throw mapAuthError(error)
        }
    }
    
    // MARK: - Google Sign In
    
    @MainActor
    func signInWithGoogle() async throws {
        isLoading = true
        defer { isLoading = false }
        
        // Get the client ID from GoogleService-Info.plist
        guard let clientID = FirebaseApp.app()?.options.clientID else {
            throw AuthenticationError.unknown("Missing Google Client ID")
        }
        
        // Configure Google Sign In
        let config = GIDConfiguration(clientID: clientID)
        GIDSignIn.sharedInstance.configuration = config
        
        // Get the root view controller
        guard let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
              let rootViewController = windowScene.windows.first?.rootViewController else {
            throw AuthenticationError.unknown("No root view controller found")
        }
        
        do {
            // Present Google Sign In
            let result = try await GIDSignIn.sharedInstance.signIn(withPresenting: rootViewController)
            
            guard let idToken = result.user.idToken?.tokenString else {
                throw AuthenticationError.unknown("Missing ID token")
            }
            
            let accessToken = result.user.accessToken.tokenString
            
            // Create Firebase credential
            let credential = GoogleAuthProvider.credential(withIDToken: idToken, accessToken: accessToken)
            
            // Sign in to Firebase
            try await auth.signIn(with: credential)
            
        } catch let error as NSError {
            // Handle Google Sign In specific errors
            if error.domain == "com.google.GIDSignIn" {
                if error.code == -5 { // User cancelled
                    throw AuthenticationError.cancelled
                }
                throw AuthenticationError.unknown("Google Sign In failed: \(error.localizedDescription)")
            }
            throw mapAuthError(error)
        }
    }
    
    // Restore Google Sign In on app launch
    func restoreGoogleSignIn() {
        GIDSignIn.sharedInstance.restorePreviousSignIn { user, error in
            if let error = error {
                print("Error restoring Google Sign In: \(error.localizedDescription)")
                return
            }
            
            if user != nil {
                print("Google Sign In restored successfully")
            }
        }
    }
    
    // MARK: - Apple Sign In
    
    func signInWithApple(authorization: ASAuthorization) async throws {
        isLoading = true
        defer { isLoading = false }
        
        guard let appleIDCredential = authorization.credential as? ASAuthorizationAppleIDCredential else {
            throw AuthenticationError.unknown("Invalid Apple ID credential")
        }
        
        guard let nonce = currentNonce else {
            throw AuthenticationError.unknown("Invalid state: A login callback was received, but no login request was sent.")
        }
        
        guard let appleIDToken = appleIDCredential.identityToken else {
            throw AuthenticationError.unknown("Unable to fetch identity token")
        }
        
        guard let idTokenString = String(data: appleIDToken, encoding: .utf8) else {
            throw AuthenticationError.unknown("Unable to serialize token string from data")
        }
        
        let credential = OAuthProvider.appleCredential(withIDToken: idTokenString,
                                                       rawNonce: nonce,
                                                       fullName: appleIDCredential.fullName)
        
        do {
            try await auth.signIn(with: credential)
        } catch let error as NSError {
            throw mapAuthError(error)
        }
    }
    
    func startSignInWithAppleFlow() -> String {
        let nonce = randomNonceString()
        currentNonce = nonce
        return sha256(nonce)
    }
    
    // MARK: - Phone Authentication
    
    func signInWithPhone(phoneNumber: String, verificationCode: String, verificationID: String) async throws {
        isLoading = true
        defer { isLoading = false }
        
        let credential = PhoneAuthProvider.provider().credential(
            withVerificationID: verificationID,
            verificationCode: verificationCode
        )
        
        do {
            try await auth.signIn(with: credential)
        } catch let error as NSError {
            throw mapAuthError(error)
        }
    }
    
    func sendVerificationCode(phoneNumber: String) async throws -> String {
        isLoading = true
        defer { isLoading = false }
        
        do {
            let verificationID = try await PhoneAuthProvider.provider()
                .verifyPhoneNumber(phoneNumber, uiDelegate: nil)
            return verificationID
        } catch let error as NSError {
            throw mapAuthError(error)
        }
    }
    
    // MARK: - Password Reset
    
    func resetPassword(email: String) async throws {
        isLoading = true
        defer { isLoading = false }
        
        do {
            try await auth.sendPasswordReset(withEmail: email)
        } catch let error as NSError {
            throw mapAuthError(error)
        }
    }
    
    // MARK: - Sign Out
    
    func signOut() throws {
        try auth.signOut()
        currentUser = nil
        isAuthenticated = false
    }
    
    // MARK: - Helper Methods
    
    private func mapAuthError(_ error: NSError) -> AuthenticationError {
        guard let errorCode = AuthErrorCode(rawValue: error.code) else {
            return .unknown(error.localizedDescription)
        }
        
        switch errorCode {
        case .invalidEmail:
            return .invalidEmail
        case .weakPassword:
            return .weakPassword
        case .emailAlreadyInUse:
            return .emailAlreadyInUse
        case .userNotFound:
            return .userNotFound
        case .wrongPassword:
            return .wrongPassword
        case .networkError:
            return .networkError
        default:
            return .unknown(error.localizedDescription)
        }
    }
    
    // MARK: - Apple Sign In Helpers
    
    private func randomNonceString(length: Int = 32) -> String {
        precondition(length > 0)
        var randomBytes = [UInt8](repeating: 0, count: length)
        let errorCode = SecRandomCopyBytes(kSecRandomDefault, randomBytes.count, &randomBytes)
        if errorCode != errSecSuccess {
            fatalError("Unable to generate nonce. SecRandomCopyBytes failed with OSStatus \(errorCode)")
        }
        
        let charset: [Character] = Array("0123456789ABCDEFGHIJKLMNOPQRSTUVXYZabcdefghijklmnopqrstuvwxyz-._")
        
        let nonce = randomBytes.map { byte in
            charset[Int(byte) % charset.count]
        }
        
        return String(nonce)
    }
    
    private func sha256(_ input: String) -> String {
        let inputData = Data(input.utf8)
        let hashedData = SHA256.hash(data: inputData)
        let hashString = hashedData.compactMap {
            String(format: "%02x", $0)
        }.joined()
        
        return hashString
    }
}

// MARK: - Authentication Error

enum AuthenticationError: LocalizedError {
    case emailAlreadyInUse
    case invalidEmail
    case weakPassword
    case wrongPassword
    case userNotFound
    case networkError
    case cancelled
    case unknown(String)
    
    var errorDescription: String? {
        switch self {
        case .emailAlreadyInUse:
            return "This email is already registered. Please sign in instead."
        case .invalidEmail:
            return "Please enter a valid email address."
        case .weakPassword:
            return "Password should be at least 6 characters long."
        case .wrongPassword:
            return "Incorrect password. Please try again."
        case .userNotFound:
            return "No account found with this email."
        case .networkError:
            return "Network error. Please check your connection."
        case .cancelled:
            return "Sign in was cancelled."
        case .unknown(let message):
            return message
        }
    }
}
