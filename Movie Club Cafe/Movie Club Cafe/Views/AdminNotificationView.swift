//
//  AdminNotificationView.swift
//  Movie Club Cafe
//
//  Admin view for sending notifications to all users
//

import SwiftUI

struct AdminNotificationView: View {
    @EnvironmentObject var notificationService: NotificationService
    @EnvironmentObject var authService: AuthenticationService
    @State private var notificationTitle = ""
    @State private var notificationBody = ""
    @State private var selectedType: AppNotification.NotificationType = .general
    @State private var showingSuccess = false
    @State private var showingError = false
    @State private var errorMessage = ""
    @State private var isSending = false
    
    var isAdmin: Bool {
        authService.currentUser?.role == "admin"
    }
    
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
                
                if !isAdmin {
                    notAdminView
                } else {
                    adminForm
                }
            }
            .navigationTitle("Send Notification")
            .alert("Success", isPresented: $showingSuccess) {
                Button("OK") {
                    resetForm()
                }
            } message: {
                Text("Notification sent to all users!")
            }
            .alert("Error", isPresented: $showingError) {
                Button("OK") { }
            } message: {
                Text(errorMessage)
            }
        }
    }
    
    // MARK: - Admin Form
    
    private var adminForm: some View {
        Form {
            Section(header: Text("Notification Content")) {
                TextField("Title", text: $notificationTitle)
                
                TextEditor(text: $notificationBody)
                    .frame(minHeight: 100)
                
                Picker("Type", selection: $selectedType) {
                    Text("General").tag(AppNotification.NotificationType.general)
                    Text("Movie Update").tag(AppNotification.NotificationType.movieUpdate)
                    Text("Admin Announcement").tag(AppNotification.NotificationType.adminAnnouncement)
                    Text("Monthly Selection").tag(AppNotification.NotificationType.monthlySelection)
                }
            }
            
            Section(header: Text("Preview")) {
                NotificationPreview(
                    title: notificationTitle.isEmpty ? "Notification Title" : notificationTitle,
                    body: notificationBody.isEmpty ? "Notification body text..." : notificationBody,
                    type: selectedType
                )
            }
            
            Section {
                Button(action: sendNotification) {
                    if isSending {
                        HStack {
                            ProgressView()
                            Text("Sending...")
                        }
                    } else {
                        Text("Send to All Users")
                            .frame(maxWidth: .infinity)
                            .foregroundColor(.white)
                    }
                }
                .listRowBackground(Color(red: 0.74, green: 0.15, blue: 0.18))
                .disabled(notificationTitle.isEmpty || notificationBody.isEmpty || isSending)
            }
            
            Section(header: Text("Quick Actions")) {
                Button("Notify: Monthly Selections Updated") {
                    notificationTitle = "Monthly Selections Updated! 🍿"
                    notificationBody = "Check out the new movie selections for this month!"
                    selectedType = .monthlySelection
                }
                
                Button("Notify: New Movie Added") {
                    notificationTitle = "New Movie Added! 🎬"
                    notificationBody = "A new movie has been added to the genre pool!"
                    selectedType = .movieUpdate
                }
            }
        }
    }
    
    // MARK: - Not Admin View
    
    private var notAdminView: some View {
        VStack(spacing: 20) {
            Image(systemName: "lock.shield")
                .font(.system(size: 60))
                .foregroundColor(.gray.opacity(0.5))
            
            Text("Admin Only")
                .font(.title2)
                .fontWeight(.bold)
            
            Text("This feature is only available to administrators")
                .font(.body)
                .foregroundColor(.gray)
                .multilineTextAlignment(.center)
                .padding(.horizontal)
        }
    }
    
    // MARK: - Actions
    
    private func sendNotification() {
        isSending = true
        
        Task {
            do {
                try await notificationService.sendNotificationToAll(
                    title: notificationTitle,
                    body: notificationBody,
                    type: selectedType
                )
                
                await MainActor.run {
                    isSending = false
                    showingSuccess = true
                }
            } catch {
                await MainActor.run {
                    isSending = false
                    errorMessage = error.localizedDescription
                    showingError = true
                }
            }
        }
    }
    
    private func resetForm() {
        notificationTitle = ""
        notificationBody = ""
        selectedType = .general
    }
}

// MARK: - Notification Preview

struct NotificationPreview: View {
    let title: String
    let body: String
    let type: AppNotification.NotificationType
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Image(systemName: iconName)
                    .foregroundColor(iconColor)
                
                Text(title)
                    .font(.headline)
            }
            
            Text(body)
                .font(.subheadline)
                .foregroundColor(.secondary)
            
            Text("Just now")
                .font(.caption)
                .foregroundColor(.gray)
        }
        .padding()
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Color.white.opacity(0.9))
        .cornerRadius(12)
    }
    
    private var iconName: String {
        switch type {
        case .movieUpdate: return "film.fill"
        case .adminAnnouncement: return "megaphone.fill"
        case .monthlySelection: return "star.fill"
        default: return "bell.fill"
        }
    }
    
    private var iconColor: Color {
        switch type {
        case .movieUpdate, .monthlySelection:
            return Color(red: 0.74, green: 0.15, blue: 0.18)
        case .adminAnnouncement:
            return .orange
        default:
            return .gray
        }
    }
}

#Preview {
    AdminNotificationView()
        .environmentObject(NotificationService())
        .environmentObject(AuthenticationService())
}

