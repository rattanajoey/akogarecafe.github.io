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
    @State private var showingClearCache = false
    @State private var showingEditProfile = false
    @State private var errorMessage: String?
    @State private var showError = false
    @State private var showCacheCleared = false
    
    var body: some View {
        ScrollView {
            VStack(spacing: 0) {
                // Header - Minimalist Apple Design
                VStack(spacing: 16) {
                    HStack {
                        Text("Profile")
                            .font(.system(size: 38, weight: .bold, design: .rounded))
                            .foregroundColor(AppTheme.accentColor)
                        
                        Spacer()
                        
                        // Share Button
                        Button(action: {
                            showingShareSheet = true
                        }) {
                            Image(systemName: "square.and.arrow.up")
                                .font(.system(size: 20, weight: .medium))
                                .foregroundColor(AppTheme.accentColor)
                                .frame(width: 44, height: 44)
                                .background(.ultraThinMaterial)
                                .clipShape(Circle())
                        }
                    }
                }
                .padding(.horizontal, 20)
                .padding(.top, 20)
                .padding(.bottom, 24)
                
                // Main Content
                VStack(spacing: 20) {
                    // User Info Card with Edit Button
                    VStack(spacing: 12) {
                        ProfileHeaderCard(
                            displayName: authService.currentUser?.displayName ?? "Movie Fan",
                            email: authService.currentUser?.email,
                            photoURL: authService.currentUser?.photoURL
                        )
                        
                        // Edit Profile Button
                        Button(action: {
                            showingEditProfile = true
                        }) {
                            HStack {
                                Image(systemName: "pencil")
                                    .font(.system(size: 16, weight: .semibold))
                                Text("Edit Profile")
                                    .font(.system(size: 16, weight: .medium))
                                Spacer()
                                Image(systemName: "chevron.right")
                                    .font(.system(size: 14, weight: .semibold))
                                    .foregroundColor(.secondary)
                            }
                            .foregroundColor(.primary)
                            .padding(16)
                            .background(
                                RoundedRectangle(cornerRadius: 16)
                                    .fill(.ultraThinMaterial)
                            )
                            .overlay(
                                RoundedRectangle(cornerRadius: 16)
                                    .stroke(Color.gray.opacity(0.2), lineWidth: 1)
                            )
                        }
                    }
                    .padding(.horizontal, 16)
                    
                    // Account Details Card
                    if let user = authService.currentUser {
                        InfoCard(
                            title: "Account",
                            items: [
                                InfoItem(icon: "envelope.fill", title: "Email", value: user.email ?? "Not set"),
                                InfoItem(icon: "phone.fill", title: "Phone", value: user.phoneNumber ?? "Not set"),
                                InfoItem(icon: "calendar", title: "Member Since", value: formatDate(user.createdAt))
                            ]
                        )
                        .padding(.horizontal, 16)
                        
                        // Statistics Card
                        StatsCard(
                            stats: [
                                StatItem(icon: "film.fill", title: "Movies Submitted", count: user.submittedMovies.count),
                                StatItem(icon: "eye.fill", title: "Movies Watched", count: user.watchedMovies.count),
                                StatItem(icon: "heart.fill", title: "Favorite Genres", count: user.favoriteGenres.count)
                            ]
                        )
                        .padding(.horizontal, 16)
                    }
                    
                    // App Settings Section
                    VStack(spacing: 12) {
                        // Clear Cache Button
                        Button(action: {
                            showingClearCache = true
                        }) {
                            HStack {
                                Image(systemName: "trash")
                                    .font(.system(size: 16, weight: .semibold))
                                Text("Clear Cache")
                                    .font(.system(size: 16, weight: .medium))
                                Spacer()
                                Image(systemName: "chevron.right")
                                    .font(.system(size: 14, weight: .semibold))
                                    .foregroundColor(.secondary)
                            }
                            .foregroundColor(.primary)
                            .padding(16)
                            .background(
                                RoundedRectangle(cornerRadius: 16)
                                    .fill(.ultraThinMaterial)
                            )
                            .overlay(
                                RoundedRectangle(cornerRadius: 16)
                                    .stroke(Color.gray.opacity(0.2), lineWidth: 1)
                            )
                        }
                    }
                    .padding(.horizontal, 16)
                    .padding(.top, 12)
                    
                    // Sign Out Button
                    Button(action: {
                        showingSignOut = true
                    }) {
                        HStack(spacing: 8) {
                            Image(systemName: "arrow.right.square")
                                .font(.system(size: 16, weight: .semibold))
                            Text("Sign Out")
                                .font(.system(size: 16, weight: .semibold))
                        }
                        .foregroundColor(.white)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 14)
                        .background(
                            RoundedRectangle(cornerRadius: 16)
                                .fill(AppTheme.accentColor)
                        )
                    }
                    .padding(.horizontal, 16)
                    .padding(.top, 12)
                    .padding(.bottom, 40)
                }
            }
        }
        .background(AppTheme.backgroundGradient)
        .sheet(isPresented: $showingEditProfile) {
            EditProfileView()
                .environmentObject(authService)
        }
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
        .confirmationDialog("Clear Cache", isPresented: $showingClearCache) {
            Button("Clear Cache", role: .destructive) {
                clearCache()
            }
            Button("Cancel", role: .cancel) { }
        } message: {
            Text("This will clear all cached movie data. The app will need to reload movie information from the internet.")
        }
        .alert("Cache Cleared", isPresented: $showCacheCleared) {
            Button("OK", role: .cancel) { }
        } message: {
            Text("All cached movie data has been cleared successfully.")
        }
        .alert("Error", isPresented: $showError) {
            Button("OK", role: .cancel) { }
        } message: {
            Text(errorMessage ?? "An error occurred")
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
    
    private func clearCache() {
        // Clear TMDB cache
        TMDBService.shared.clearCache()
        
        // Clear Firebase cache timestamps (forces fresh fetches)
        FirestoreCacheService.shared.invalidateCache()
        
        // Show success message
        showCacheCleared = true
    }
    
    private func formatDate(_ date: Date) -> String {
        let formatter = DateFormatter()
        formatter.dateStyle = .medium
        return formatter.string(from: date)
    }
}

// MARK: - Profile Header Card
struct ProfileHeaderCard: View {
    let displayName: String
    let email: String?
    let photoURL: String?
    
    var body: some View {
        HStack(spacing: 16) {
            // Profile Image or Icon
            if let photoURL = photoURL {
                AsyncImage(url: URL(string: photoURL)) { phase in
                    switch phase {
                    case .success(let image):
                        image
                            .resizable()
                            .scaledToFill()
                            .frame(width: 80, height: 80)
                            .clipShape(Circle())
                            .overlay(
                                Circle()
                                    .stroke(Color.gray.opacity(0.2), lineWidth: 2)
                            )
                    case .failure(_), .empty:
                        defaultProfileImage
                    @unknown default:
                        defaultProfileImage
                    }
                }
            } else {
                defaultProfileImage
            }
            
            VStack(alignment: .leading, spacing: 6) {
                Text(displayName)
                    .font(.system(size: 24, weight: .bold, design: .rounded))
                    .foregroundColor(AppTheme.textPrimary)
                
                if let email = email {
                    Text(email)
                        .font(.system(size: 14))
                        .foregroundColor(.secondary)
                        .lineLimit(1)
                }
            }
            
            Spacer()
        }
        .padding(20)
        .background(
            RoundedRectangle(cornerRadius: 16)
                .fill(.ultraThinMaterial)
        )
        .overlay(
            RoundedRectangle(cornerRadius: 16)
                .stroke(Color.gray.opacity(0.2), lineWidth: 1)
        )
    }
    
    private var defaultProfileImage: some View {
        Image(systemName: "person.circle.fill")
            .resizable()
            .frame(width: 80, height: 80)
            .foregroundStyle(AppTheme.accentColor.opacity(0.7))
    }
}

// MARK: - Info Card
struct InfoItem {
    let icon: String
    let title: String
    let value: String
}

struct InfoCard: View {
    let title: String
    let items: [InfoItem]
    
    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            // Section Title
            Text(title)
                .font(.system(size: 20, weight: .semibold, design: .rounded))
                .foregroundColor(AppTheme.textPrimary)
            
            Divider()
                .background(Color.gray.opacity(0.3))
            
            // Info Items
            VStack(spacing: 14) {
                ForEach(items.indices, id: \.self) { index in
                    HStack(spacing: 12) {
                        Image(systemName: items[index].icon)
                            .font(.system(size: 16, weight: .medium))
                            .foregroundColor(AppTheme.accentColor)
                            .frame(width: 24, height: 24)
                        
                        Text(items[index].title)
                            .font(.system(size: 15, weight: .medium))
                            .foregroundColor(AppTheme.textPrimary)
                        
                        Spacer()
                        
                        Text(items[index].value)
                            .font(.system(size: 14))
                            .foregroundColor(.secondary)
                            .lineLimit(1)
                    }
                }
            }
        }
        .padding(20)
        .background(
            RoundedRectangle(cornerRadius: 16)
                .fill(.ultraThinMaterial)
        )
        .overlay(
            RoundedRectangle(cornerRadius: 16)
                .stroke(Color.gray.opacity(0.2), lineWidth: 1)
        )
    }
}

// MARK: - Stats Card
struct StatItem {
    let icon: String
    let title: String
    let count: Int
}

struct StatsCard: View {
    let stats: [StatItem]
    
    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            // Section Title
            Text("Statistics")
                .font(.system(size: 20, weight: .semibold, design: .rounded))
                .foregroundColor(AppTheme.textPrimary)
            
            Divider()
                .background(Color.gray.opacity(0.3))
            
            // Stats Grid
            LazyVGrid(columns: [
                GridItem(.flexible(), spacing: 12),
                GridItem(.flexible(), spacing: 12),
                GridItem(.flexible(), spacing: 12)
            ], spacing: 16) {
                ForEach(stats.indices, id: \.self) { index in
                    VStack(spacing: 8) {
                        Image(systemName: stats[index].icon)
                            .font(.system(size: 24, weight: .medium))
                            .foregroundColor(AppTheme.accentColor)
                        
                        Text("\(stats[index].count)")
                            .font(.system(size: 22, weight: .bold, design: .rounded))
                            .foregroundColor(AppTheme.textPrimary)
                        
                        Text(stats[index].title)
                            .font(.system(size: 11, weight: .medium))
                            .foregroundColor(.secondary)
                            .multilineTextAlignment(.center)
                            .lineLimit(2)
                            .fixedSize(horizontal: false, vertical: true)
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 12)
                    .background(
                        RoundedRectangle(cornerRadius: 12)
                            .fill(Color.white.opacity(0.3))
                    )
                }
            }
        }
        .padding(20)
        .background(
            RoundedRectangle(cornerRadius: 16)
                .fill(.ultraThinMaterial)
        )
        .overlay(
            RoundedRectangle(cornerRadius: 16)
                .stroke(Color.gray.opacity(0.2), lineWidth: 1)
        )
    }
}

#Preview {
    ProfileView()
        .environmentObject(AuthenticationService())
}
