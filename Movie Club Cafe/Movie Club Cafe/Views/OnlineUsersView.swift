//
//  OnlineUsersView.swift
//  Movie Club Cafe
//
//  View showing online users in the chat
//

import SwiftUI

struct OnlineUsersView: View {
    @ObservedObject var chatService: ChatService
    @Environment(\.dismiss) var dismiss
    
    var body: some View {
        NavigationView {
            ZStack {
                // Background gradient
                LinearGradient(
                    gradient: Gradient(colors: [
                        Color(red: 0.82, green: 0.82, blue: 0.80),
                        Color(red: 0.30, green: 0.41, blue: 0.36)
                    ]),
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )
                .ignoresSafeArea()
                
                if chatService.onlineUsers.isEmpty {
                    emptyStateView
                } else {
                    usersList
                }
            }
            .navigationTitle("Online Users")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Done") {
                        dismiss()
                    }
                }
            }
        }
    }
    
    // MARK: - Users List
    
    private var usersList: some View {
        ScrollView {
            LazyVStack(spacing: 12) {
                // Header with count
                HStack {
                    Image(systemName: "person.2.fill")
                        .foregroundColor(Color(red: 0.74, green: 0.15, blue: 0.18))
                    Text("\(chatService.onlineUsers.count) online")
                        .font(.headline)
                        .foregroundColor(.primary)
                    Spacer()
                }
                .padding()
                .background(Color.white.opacity(0.9))
                .cornerRadius(12)
                
                // User list
                ForEach(chatService.onlineUsers, id: \.userId) { user in
                    OnlineUserCard(user: user)
                }
            }
            .padding()
        }
    }
    
    // MARK: - Empty State
    
    private var emptyStateView: some View {
        VStack(spacing: 20) {
            Image(systemName: "person.slash")
                .font(.system(size: 60))
                .foregroundColor(.gray.opacity(0.5))
            
            Text("No One Online")
                .font(.title2)
                .fontWeight(.bold)
            
            Text("Be the first to join the chat!")
                .font(.body)
                .foregroundColor(.gray)
        }
    }
}

// MARK: - Online User Card

struct OnlineUserCard: View {
    let user: UserStatus
    
    var body: some View {
        HStack(spacing: 15) {
            // User Avatar
            ZStack(alignment: .bottomTrailing) {
                if let photoURL = user.photoURL, let url = URL(string: photoURL) {
                    AsyncImage(url: url) { image in
                        image
                            .resizable()
                            .scaledToFill()
                    } placeholder: {
                        Circle()
                            .fill(Color(red: 0.74, green: 0.15, blue: 0.18).opacity(0.2))
                            .overlay(
                                Text(user.displayName.prefix(1).uppercased())
                                    .font(.title2)
                                    .fontWeight(.bold)
                                    .foregroundColor(Color(red: 0.74, green: 0.15, blue: 0.18))
                            )
                    }
                    .frame(width: 50, height: 50)
                    .clipShape(Circle())
                } else {
                    Circle()
                        .fill(Color(red: 0.74, green: 0.15, blue: 0.18).opacity(0.2))
                        .frame(width: 50, height: 50)
                        .overlay(
                            Text(user.displayName.prefix(1).uppercased())
                                .font(.title2)
                                .fontWeight(.bold)
                                .foregroundColor(Color(red: 0.74, green: 0.15, blue: 0.18))
                        )
                }
                
                // Online indicator
                Circle()
                    .fill(Color.green)
                    .frame(width: 14, height: 14)
                    .overlay(
                        Circle()
                            .stroke(Color.white, lineWidth: 2)
                    )
            }
            
            // User Info
            VStack(alignment: .leading, spacing: 4) {
                Text(user.displayName)
                    .font(.headline)
                    .foregroundColor(.primary)
                
                HStack(spacing: 4) {
                    Circle()
                        .fill(Color.green)
                        .frame(width: 8, height: 8)
                    
                    Text("Active now")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
            }
            
            Spacer()
        }
        .padding()
        .background(Color.white.opacity(0.9))
        .cornerRadius(12)
        .shadow(color: Color.black.opacity(0.1), radius: 4, x: 0, y: 2)
    }
}

#Preview {
    OnlineUsersView(chatService: ChatService())
}

