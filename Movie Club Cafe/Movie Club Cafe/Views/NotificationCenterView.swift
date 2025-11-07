//
//  NotificationCenterView.swift
//  Movie Club Cafe
//
//  Notification center view
//

import SwiftUI

struct NotificationCenterView: View {
    @EnvironmentObject var notificationService: NotificationService
    
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
                
                if notificationService.notifications.isEmpty {
                    emptyStateView
                } else {
                    notificationsList
                }
            }
            .navigationTitle("Notifications")
            .toolbar {
                if !notificationService.notifications.isEmpty {
                    ToolbarItem(placement: .navigationBarTrailing) {
                        Button("Mark All Read") {
                            notificationService.markAllAsRead()
                        }
                        .font(.subheadline)
                        .foregroundColor(Color(red: 0.74, green: 0.15, blue: 0.18))
                    }
                }
            }
        }
    }
    
    // MARK: - Notifications List
    
    private var notificationsList: some View {
        ScrollView {
            LazyVStack(spacing: 12) {
                ForEach(notificationService.notifications) { notification in
                    NotificationCard(notification: notification)
                        .onTapGesture {
                            notificationService.markAsRead(notification: notification)
                        }
                }
            }
            .padding()
        }
    }
    
    // MARK: - Empty State
    
    private var emptyStateView: some View {
        VStack(spacing: 20) {
            Image(systemName: "bell.slash")
                .font(.system(size: 60))
                .foregroundColor(.gray.opacity(0.5))
            
            Text("No Notifications")
                .font(.title2)
                .fontWeight(.bold)
            
            Text("You're all caught up!")
                .font(.body)
                .foregroundColor(.gray)
        }
    }
}

// MARK: - Notification Card

struct NotificationCard: View {
    let notification: AppNotification
    
    var body: some View {
        HStack(alignment: .top, spacing: 15) {
            // Notification Icon
            ZStack {
                Circle()
                    .fill(iconColor.opacity(0.2))
                    .frame(width: 50, height: 50)
                
                Image(systemName: iconName)
                    .foregroundColor(iconColor)
                    .font(.title3)
            }
            
            VStack(alignment: .leading, spacing: 6) {
                HStack {
                    Text(notification.title)
                        .font(.headline)
                        .foregroundColor(.primary)
                    
                    Spacer()
                    
                    if !notification.isRead {
                        Circle()
                            .fill(Color(red: 0.74, green: 0.15, blue: 0.18))
                            .frame(width: 8, height: 8)
                    }
                }
                
                Text(notification.body)
                    .font(.subheadline)
                    .foregroundColor(.secondary)
                    .lineLimit(3)
                
                Text(notification.timestamp, style: .relative)
                    .font(.caption)
                    .foregroundColor(.gray)
            }
        }
        .padding()
        .background(notification.isRead ? Color.white.opacity(0.7) : Color.white.opacity(0.95))
        .cornerRadius(12)
        .shadow(color: Color.black.opacity(0.1), radius: 4, x: 0, y: 2)
    }
    
    // MARK: - Icon Helpers
    
    private var iconName: String {
        switch notification.type {
        case .movieUpdate:
            return "film.fill"
        case .adminAnnouncement:
            return "megaphone.fill"
        case .newSubmission:
            return "square.and.arrow.down.fill"
        case .monthlySelection:
            return "star.fill"
        case .chatMention:
            return "at.circle.fill"
        case .oscarVoting:
            return "trophy.fill"
        case .general:
            return "bell.fill"
        }
    }
    
    private var iconColor: Color {
        switch notification.type {
        case .movieUpdate, .monthlySelection:
            return Color(red: 0.74, green: 0.15, blue: 0.18)
        case .adminAnnouncement:
            return .orange
        case .newSubmission:
            return .blue
        case .chatMention:
            return .purple
        case .oscarVoting:
            return .yellow
        case .general:
            return .gray
        }
    }
}

#Preview {
    NotificationCenterView()
        .environmentObject(NotificationService())
}

