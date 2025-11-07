//
//  Movie_Club_CafeApp.swift
//  Movie Club Cafe
//
//  Created by Kavy Rattana on 10/4/25.
//

import SwiftUI
import FirebaseCore
import FirebaseCrashlytics
import FirebasePerformance
import FirebaseAnalytics
import GoogleSignIn
import UserNotifications

@main
struct Movie_Club_CafeApp: App {
    @StateObject private var authService = AuthenticationService()
    @StateObject private var deepLinkService = DeepLinkService.shared
    @UIApplicationDelegateAdaptor(AppDelegate.self) var appDelegate
    
    init() {
        // Initialize Firebase with all features
        FirebaseConfig.shared.configure()
        
        // Log app launch event
        AnalyticsService.shared.logScreenView(screenName: "App Launch")
    }
    
    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(authService)
                .environmentObject(deepLinkService)
                .onAppear {
                    // Restore Google Sign In on app launch
                    authService.restoreGoogleSignIn()
                    
                    // Log app opened event
                    AnalyticsService.shared.logScreenView(screenName: "Home")
                }
                .onOpenURL { url in
                    // Handle Google Sign In URL callback
                    if GIDSignIn.sharedInstance.handle(url) {
                        return
                    }
                    
                    // Handle deep links
                    let handled = deepLinkService.handleURL(url)
                    if handled {
                        AnalyticsService.shared.logFeatureUsed(featureName: "deep_link")
                    }
                }
        }
    }
}

// MARK: - App Delegate for Push Notifications & Crashlytics

class AppDelegate: NSObject, UIApplicationDelegate {
    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey : Any]? = nil) -> Bool {
        // Register for remote notifications
        application.registerForRemoteNotifications()
        
        // Configure Crashlytics to catch crashes during startup
        Crashlytics.crashlytics().log("App launched")
        
        return true
    }
    
    func application(_ application: UIApplication, didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data) {
        // Pass device token to Firebase
        let tokenParts = deviceToken.map { data in String(format: "%02.2hhx", data) }
        let token = tokenParts.joined()
        print("Device Token: \(token)")
        
        // Firebase Messaging will automatically handle this
        FirebaseConfig.shared.messaging.apnsToken = deviceToken
    }
    
    func application(_ application: UIApplication, didFailToRegisterForRemoteNotificationsWithError error: Error) {
        print("Failed to register for remote notifications: \(error)")
        
        // Log error to Crashlytics
        FirebaseConfig.shared.logCustomCrashlyticsError(error, context: "Failed to register for remote notifications")
        
        // Log to Analytics
        AnalyticsService.shared.logError(
            errorName: "notification_registration_failed",
            errorMessage: error.localizedDescription,
            context: "AppDelegate"
        )
    }
    
    // Handle app becoming active (for performance monitoring)
    func applicationDidBecomeActive(_ application: UIApplication) {
        Crashlytics.crashlytics().log("App became active")
    }
    
    // Handle app entering background
    func applicationDidEnterBackground(_ application: UIApplication) {
        Crashlytics.crashlytics().log("App entered background")
    }
}
