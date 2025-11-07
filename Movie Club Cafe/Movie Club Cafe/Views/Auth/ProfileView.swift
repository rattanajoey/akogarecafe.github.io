//
//  ProfileView.swift
//  Movie Club Cafe
//
//  Created by Kavy Rattana on 10/5/25.
//

import SwiftUI

struct ProfileView: View {
    @EnvironmentObject var authService: AuthenticationService
    @State private var showingSignOut = false
    @State private var showingShareSheet = false
    @State private var errorMessage: String?
    @State private var showError = false
    
    var body: some View {
        NavigationView {
            List {
                // User Info Section
                Section {
                    HStack(spacing: 15) {
                        // Profile Image or Icon
                        if let photoURL = authService.currentUser?.photoURL {
                            AsyncImage(url: URL(string: photoURL)) { image in
                                image
                                    .resizable()
                                    .scaledToFill()
                            } placeholder: {
                                Image(systemName: "person.circle.fill")
                                    .resizable()
                                    .foregroundStyle(.purple)
                            }
                            .frame(width: 70, height: 70)
                            .clipShape(Circle())
                        } else {
                            Image(systemName: "person.circle.fill")
                                .resizable()
                                .frame(width: 70, height: 70)
                                .foregroundStyle(.purple)
                        }
                        
                        VStack(alignment: .leading, spacing: 5) {
                            Text(authService.currentUser?.displayName ?? "Movie Fan")
                                .font(.title2.bold())
                            
                            if let email = authService.currentUser?.email {
                                Text(email)
                                    .font(.subheadline)
                                    .foregroundStyle(.secondary)
                            }
                        }
                    }
                    .padding(.vertical, 8)
                }
                
                // Account Details
                Section("Account") {
                    if let user = authService.currentUser {
                        DetailRow(icon: "envelope.fill", title: "Email", value: user.email ?? "Not set")
                        DetailRow(icon: "phone.fill", title: "Phone", value: user.phoneNumber ?? "Not set")
                        DetailRow(icon: "calendar", title: "Member Since", value: formatDate(user.createdAt))
                    }
                }
                
                // Movie Stats
                Section("Statistics") {
                    if let user = authService.currentUser {
                        StatRow(icon: "film.fill", title: "Movies Submitted", count: user.submittedMovies.count)
                        StatRow(icon: "eye.fill", title: "Movies Watched", count: user.watchedMovies.count)
                        StatRow(icon: "heart.fill", title: "Favorite Genres", count: user.favoriteGenres.count)
                    }
                }
                
                // Actions
                Section {
                    Button(action: {
                        showingShareSheet = true
                    }) {
                        Label("Share App", systemImage: "square.and.arrow.up")
                            .foregroundStyle(.blue)
                    }
                    
                    Button(role: .destructive, action: {
                        showingSignOut = true
                    }) {
                        Label("Sign Out", systemImage: "arrow.right.square")
                    }
                }
            }
            .navigationTitle("Profile")
            .sheet(isPresented: $showingShareSheet) {
                ShareSheet(items: [
                    ShareHelper.shareMessage,
                    URL(string: ShareHelper.websiteURL)!
                ])
            }
            .confirmationDialog("Sign Out", isPresented: $showingSignOut) {
                Button("Sign Out", role: .destructive) {
                    signOut()
                }
                Button("Cancel", role: .cancel) { }
            } message: {
                Text("Are you sure you want to sign out?")
            }
            .alert("Error", isPresented: $showError) {
                Button("OK", role: .cancel) { }
            } message: {
                Text(errorMessage ?? "An error occurred")
            }
        }
    }
    
    private func signOut() {
        do {
            try authService.signOut()
        } catch {
            errorMessage = error.localizedDescription
            showError = true
        }
    }
    
    private func formatDate(_ date: Date) -> String {
        let formatter = DateFormatter()
        formatter.dateStyle = .medium
        return formatter.string(from: date)
    }
}

struct DetailRow: View {
    let icon: String
    let title: String
    let value: String
    
    var body: some View {
        HStack {
            Label {
                Text(title)
            } icon: {
                Image(systemName: icon)
                    .foregroundStyle(.purple)
            }
            Spacer()
            Text(value)
                .foregroundStyle(.secondary)
        }
    }
}

struct StatRow: View {
    let icon: String
    let title: String
    let count: Int
    
    var body: some View {
        HStack {
            Label {
                Text(title)
            } icon: {
                Image(systemName: icon)
                    .foregroundStyle(.blue)
            }
            Spacer()
            Text("\(count)")
                .font(.headline)
                .foregroundStyle(.blue)
        }
    }
}

#Preview {
    ProfileView()
        .environmentObject(AuthenticationService())
}
