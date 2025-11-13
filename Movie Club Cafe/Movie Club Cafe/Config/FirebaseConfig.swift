//
//  FirebaseConfig.swift
//  Movie Club Cafe
//
//  Created by Kavy Rattana on 10/4/25.
//

import Foundation
import FirebaseCore
import FirebaseFirestore
import FirebaseAuth
import FirebaseAnalytics
import FirebaseCrashlytics
import FirebaseRemoteConfig
import FirebasePerformance
import FirebaseStorage
import FirebaseMessaging
import FirebaseAppCheck

class FirebaseConfig {
    static let shared = FirebaseConfig()
    private var firestoreInstance: Firestore?
    
    private init() {}
    
    func configure() {
        // Configure Firebase using GoogleService-Info.plist
        // The plist file should be in the Config/ folder
        FirebaseApp.configure()
        
        // Configure App Check for security (using DeviceCheck provider)
        #if DEBUG
        let providerFactory = AppCheckDebugProviderFactory()
        #else
        let providerFactory = DeviceCheckProviderFactory()
        #endif
        AppCheck.setAppCheckProviderFactory(providerFactory)
        
        // Configure Firestore with offline persistence
        configureFirestore()
        
        // Configure Analytics
        configureAnalytics()
        
        // Configure Crashlytics
        configureCrashlytics()
        
        // Configure Remote Config
        configureRemoteConfig()
        
        // Configure Performance Monitoring
        configurePerformance()
        
        // Configure Firebase Messaging
        configureMessaging()
        
        print("✅ Firebase fully configured with all features enabled")
    }
    
    // MARK: - Firestore Configuration
    
    private func configureFirestore() {
        let settings = FirestoreSettings()
        settings.isPersistenceEnabled = true
        settings.cacheSizeBytes = FirestoreCacheSizeUnlimited
        
        let db = Firestore.firestore()
        db.settings = settings
        firestoreInstance = db
        
        print("✅ Firestore configured with offline persistence")
        
        // Prefetch essential data for offline access
        Task {
            await FirestoreCacheService.shared.prefetchEssentialData()
            await FirestoreCacheService.shared.prefetchRecentMonths()
        }
    }
    
    // MARK: - Analytics Configuration
    
    private func configureAnalytics() {
        Analytics.setAnalyticsCollectionEnabled(true)
        
        // Set default event parameters
        Analytics.setDefaultEventParameters([
            "app_version": Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String ?? "unknown",
            "platform": "iOS"
        ])
        
        print("✅ Analytics configured")
    }
    
    // MARK: - Crashlytics Configuration
    
    private func configureCrashlytics() {
        let crashlytics = Crashlytics.crashlytics()
        
        #if DEBUG
        // Disable Crashlytics in debug mode (optional)
        crashlytics.setCrashlyticsCollectionEnabled(false)
        print("⚠️ Crashlytics disabled in DEBUG mode")
        #else
        crashlytics.setCrashlyticsCollectionEnabled(true)
        
        // Set custom keys for better debugging
        crashlytics.setCustomValue(Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String ?? "unknown", forKey: "app_version")
        crashlytics.setCustomValue("iOS", forKey: "platform")
        
        print("✅ Crashlytics configured")
        #endif
    }
    
    // MARK: - Remote Config Configuration
    
    private func configureRemoteConfig() {
        RemoteConfigService.shared.configure()
    }
    
    // MARK: - Performance Monitoring Configuration
    
    private func configurePerformance() {
        Performance.sharedInstance().isDataCollectionEnabled = true
        Performance.sharedInstance().isInstrumentationEnabled = true
        
        print("✅ Performance Monitoring configured")
    }
    
    // MARK: - Firebase Messaging Configuration
    
    private func configureMessaging() {
        Messaging.messaging().isAutoInitEnabled = true
        
        // Request FCM token
        Messaging.messaging().token { token, error in
            if let error = error {
                print("❌ Error fetching FCM token: \(error)")
            } else if let token = token {
                print("✅ FCM token: \(token)")
            }
        }
    }
    
    // MARK: - Public Accessors
    
    var db: Firestore {
        if let instance = firestoreInstance {
            return instance
        }
        return Firestore.firestore()
    }
    
    var auth: Auth {
        return Auth.auth()
    }
    
    var storage: Storage {
        return Storage.storage()
    }
    
    var remoteConfig: RemoteConfig {
        return RemoteConfig.remoteConfig()
    }
    
    var messaging: Messaging {
        return Messaging.messaging()
    }
    
    // MARK: - Helper Methods
    
    func logCustomCrashlyticsError(_ error: Error, context: String) {
        let crashlytics = Crashlytics.crashlytics()
        crashlytics.log("Context: \(context)")
        crashlytics.record(error: error)
    }
    
    func setUserIdentifier(_ userId: String, nickname: String? = nil) {
        // Analytics
        Analytics.setUserID(userId)
        if let nickname = nickname {
            Analytics.setUserProperty(nickname, forName: "nickname")
        }
        
        // Crashlytics
        let crashlytics = Crashlytics.crashlytics()
        crashlytics.setUserID(userId)
        if let nickname = nickname {
            crashlytics.setCustomValue(nickname, forKey: "nickname")
        }
    }
    
    func clearUserIdentifier() {
        Analytics.setUserID(nil)
        Crashlytics.crashlytics().setUserID("")
    }
}

