//
//  Movie_Club_CafeApp.swift
//  Movie Club Cafe
//
//  Created by Kavy Rattana on 10/4/25.
//

import SwiftUI
import FirebaseCore
import GoogleSignIn
import UserNotifications

@main
struct Movie_Club_CafeApp: App {
    @StateObject private var authService = AuthenticationService()
    @UIApplicationDelegateAdaptor(AppDelegate.self) var appDelegate
    
    init() {
        // Initialize Firebase
        FirebaseConfig.shared.configure()
    }
    
    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(authService)
                .onAppear {
                    // Restore Google Sign In on app launch
                    authService.restoreGoogleSignIn()
                }
                .onOpenURL { url in
                    // Handle Google Sign In URL callback
                    GIDSignIn.sharedInstance.handle(url)
                }
        }
    }
}

// MARK: - App Delegate for Push Notifications

class AppDelegate: NSObject, UIApplicationDelegate {
    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey : Any]? = nil) -> Bool {
        // Register for remote notifications
        application.registerForRemoteNotifications()
        return true
    }
    
    func application(_ application: UIApplication, didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data) {
        // Pass device token to Firebase
        let tokenParts = deviceToken.map { data in String(format: "%02.2hhx", data) }
        let token = tokenParts.joined()
        print("Device Token: \(token)")
        
        // Firebase Messaging will automatically handle this
    }
    
    func application(_ application: UIApplication, didFailToRegisterForRemoteNotificationsWithError error: Error) {
        print("Failed to register for remote notifications: \(error)")
    }
}
