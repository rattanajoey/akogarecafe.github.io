//
//  NotificationService.swift
//  Movie Club Cafe
//
//  Real-time notification service with Firestore and FCM
//  NOTE: FirebaseMessaging is currently disabled. To enable push notifications:
//  1. Add FirebaseMessaging to Package Dependencies in Xcode
//  2. Uncomment the import and related code below
//

import Foundation
import FirebaseFirestore
import FirebaseAuth
// import FirebaseMessaging  // DISABLED - Add FirebaseMessaging package to enable
import UserNotifications
import Combine

class NotificationService: NSObject, ObservableObject {
    @Published var notifications: [AppNotification] = []
    @Published var unreadCount: Int = 0
    @Published var fcmToken: String?
    
    private let db = Firestore.firestore()
    private var notificationsListener: ListenerRegistration?
    
    override init() {
        super.init()
        setupFCM()
    }
    
    // MARK: - FCM Setup
    
    func setupFCM() {
        // Messaging.messaging().delegate = self  // DISABLED - FirebaseMessaging not configured
        UNUserNotificationCenter.current().delegate = self
        
        // Request notification permissions
        requestNotificationPermissions()
    }
    
    func requestNotificationPermissions() {
        UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .badge, .sound]) { granted, error in
            if granted {
                DispatchQueue.main.async {
                    UIApplication.shared.registerForRemoteNotifications()
                }
            }
            
            if let error = error {
                print("Error requesting notification permissions: \(error)")
            }
        }
    }
    
    // MARK: - Listen to Notifications
    
    func listenToNotifications() {
        guard let userId = Auth.auth().currentUser?.uid else { return }
        
        notificationsListener?.remove()
        
        notificationsListener = db.collection("Users")
            .document(userId)
            .collection("Notifications")
            .order(by: "timestamp", descending: true)
            .limit(to: 50)
            .addSnapshotListener { [weak self] snapshot, error in
                guard let self = self else { return }
                
                if let error = error {
                    print("Error listening to notifications: \(error)")
                    return
                }
                
                guard let documents = snapshot?.documents else { return }
                
                self.notifications = documents.compactMap { document in
                    try? document.data(as: AppNotification.self)
                }
                
                self.unreadCount = self.notifications.filter { !$0.isRead }.count
                
                // Update app badge
                DispatchQueue.main.async {
                    UIApplication.shared.applicationIconBadgeNumber = self.unreadCount
                }
            }
    }
    
    // MARK: - Send Notification (Admin)
    
    /// Send notification to all users (admin only)
    func sendNotificationToAll(title: String, body: String, type: AppNotification.NotificationType, metadata: [String: String]? = nil) async throws {
        guard let userId = Auth.auth().currentUser?.uid else {
            throw NSError(domain: "NotificationService", code: 401, userInfo: [NSLocalizedDescriptionKey: "User not authenticated"])
        }
        
        // Create notification in a special collection for broadcasting
        let notification = AppNotification(
            title: title,
            body: body,
            type: type,
            senderId: userId,
            senderName: Auth.auth().currentUser?.displayName,
            metadata: metadata
        )
        
        try db.collection("AdminNotifications").addDocument(from: notification)
    }
    
    /// Send notification to specific user
    func sendNotificationToUser(userId: String, title: String, body: String, type: AppNotification.NotificationType, metadata: [String: String]? = nil) async throws {
        let notification = AppNotification(
            title: title,
            body: body,
            type: type,
            senderId: Auth.auth().currentUser?.uid,
            senderName: Auth.auth().currentUser?.displayName,
            metadata: metadata
        )
        
        try db.collection("Users")
            .document(userId)
            .collection("Notifications")
            .addDocument(from: notification)
    }
    
    // MARK: - Mark as Read
    
    func markAsRead(notification: AppNotification) {
        guard let userId = Auth.auth().currentUser?.uid,
              let notificationId = notification.id else { return }
        
        db.collection("Users")
            .document(userId)
            .collection("Notifications")
            .document(notificationId)
            .updateData(["isRead": true])
    }
    
    func markAllAsRead() {
        guard let userId = Auth.auth().currentUser?.uid else { return }
        
        let unreadNotifications = notifications.filter { !$0.isRead }
        
        for notification in unreadNotifications {
            guard let notificationId = notification.id else { continue }
            
            db.collection("Users")
                .document(userId)
                .collection("Notifications")
                .document(notificationId)
                .updateData(["isRead": true])
        }
    }
    
    // MARK: - Movie Update Notifications
    
    func notifyMovieUpdate(movieTitle: String, genre: String) async throws {
        let notification = AppNotification(
            title: "New Movie Selected! 🎬",
            body: "\(movieTitle) has been selected for \(genre) this month!",
            type: .movieUpdate,
            metadata: ["movieTitle": movieTitle, "genre": genre]
        )
        
        try db.collection("AdminNotifications").addDocument(from: notification)
    }
    
    func notifyMonthlySelectionUpdate(month: String) async throws {
        let notification = AppNotification(
            title: "Monthly Selections Updated! 🍿",
            body: "Check out the new movie selections for \(month)!",
            type: .monthlySelection,
            metadata: ["month": month]
        )
        
        try db.collection("AdminNotifications").addDocument(from: notification)
    }
    
    // MARK: - Store FCM Token
    
    func storeFCMToken() {
        guard let userId = Auth.auth().currentUser?.uid,
              let token = fcmToken else { return }
        
        db.collection("Users")
            .document(userId)
            .updateData([
                "fcmToken": token,
                "lastTokenUpdate": FieldValue.serverTimestamp()
            ])
    }
    
    // MARK: - Cleanup
    
    func stopListening() {
        notificationsListener?.remove()
    }
    
    deinit {
        stopListening()
    }
}

// MARK: - Messaging Delegate
// DISABLED - FirebaseMessaging not configured
// Uncomment when FirebaseMessaging package is added
/*
extension NotificationService: MessagingDelegate {
    func messaging(_ messaging: Messaging, didReceiveRegistrationToken fcmToken: String?) {
        print("FCM Token: \(fcmToken ?? "none")")
        self.fcmToken = fcmToken
        storeFCMToken()
    }
}
*/

// MARK: - Notification Center Delegate

extension NotificationService: UNUserNotificationCenterDelegate {
    func userNotificationCenter(_ center: UNUserNotificationCenter, willPresent notification: UNNotification, withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void) {
        // Show notification even when app is in foreground
        completionHandler([.banner, .badge, .sound])
    }
    
    func userNotificationCenter(_ center: UNUserNotificationCenter, didReceive response: UNNotificationResponse, withCompletionHandler completionHandler: @escaping () -> Void) {
        // Handle notification tap
        let userInfo = response.notification.request.content.userInfo
        print("Notification tapped: \(userInfo)")
        
        completionHandler()
    }
}

