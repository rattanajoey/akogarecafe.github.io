//
//  ContentView.swift
//  Movie Club Cafe
//
//  Created by Kavy Rattana on 10/4/25.
//

import SwiftUI

struct ContentView: View {
    @EnvironmentObject var authService: AuthenticationService
    @StateObject private var notificationService = NotificationService()
    @StateObject private var chatService = ChatService()
    
    var body: some View {
        Group {
            if authService.isAuthenticated {
                TabView {
                    MovieClubView()
                        .tabItem {
                            Label("Movie Club", systemImage: "film.stack")
                        }
                    
                    ChatListView()
                        .tabItem {
                            Label("Chat", systemImage: "bubble.left.and.bubble.right")
                        }
                        .badge(chatService.unreadCount > 0 ? chatService.unreadCount : nil as Int?)
                    
                    NotificationCenterView()
                        .environmentObject(notificationService)
                        .tabItem {
                            Label("Notifications", systemImage: "bell")
                        }
                        .badge(notificationService.unreadCount > 0 ? notificationService.unreadCount : nil as Int?)
                    
                    ProfileView()
                        .tabItem {
                            Label("Profile", systemImage: "person.circle")
                        }
                    
                    // Admin tab (only visible for admin users)
                    if authService.isAdmin {
                        AdminTabView()
                            .environmentObject(notificationService)
                            .tabItem {
                                Label("Admin", systemImage: "gear")
                            }
                    }
                }
                .onAppear {
                    // Start listening to notifications and chat
                    notificationService.listenToNotifications()
                    chatService.listenToUnreadCount()
                }
            } else {
                SignInView()
            }
        }
    }
}

// MARK: - Admin Tab View

struct AdminTabView: View {
    @EnvironmentObject var notificationService: NotificationService
    
    var body: some View {
        NavigationView {
            List {
                NavigationLink(destination: MovieClubAdminView()) {
                    Label("Movie Management", systemImage: "film")
                }
                
                NavigationLink(destination: AdminNotificationView()) {
                    Label("Send Notifications", systemImage: "megaphone")
                }
            }
            .navigationTitle("Admin")
        }
    }
}

#Preview {
    ContentView()
        .environmentObject(AuthenticationService())
}
