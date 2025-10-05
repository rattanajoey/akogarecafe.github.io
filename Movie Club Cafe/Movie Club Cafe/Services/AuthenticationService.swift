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
    
    // Note: You'll need to add GoogleSignIn SDK for full implementation
    // This is a placeholder for the structure
    func signInWithGoogle() async throws {
        // TODO: Implement Google Sign In
        // 1. Add GoogleSignIn package
        // 2. Configure Google Sign In
        // 3. Present sign in flow
        // 4. Get ID token and access token
        // 5. Create Firebase credential
        // 6. Sign in with credential
        throw AuthenticationError.unknown("Google Sign In not yet implemented")
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
