//
//  RemoteConfigService.swift
//  Movie Club Cafe
//
//  Firebase Remote Config Service for feature flags and dynamic configuration
//

import Foundation
import FirebaseRemoteConfig

class RemoteConfigService {
    static let shared = RemoteConfigService()
    
    private var remoteConfig: RemoteConfig!
    private var isInitialized = false
    
    private init() {}
    
    // MARK: - Configuration Keys
    
    struct ConfigKeys {
        // Feature Flags
        static let submissionEnabled = "submission_enabled"
        static let chatEnabled = "chat_enabled"
        static let watchlistEnabled = "watchlist_enabled"
        static let calendarEnabled = "calendar_enabled"
        static let shareEnabled = "share_enabled"
        static let analyticsEnabled = "analytics_enabled"
        
        // Configuration Values
        static let submissionDeadline = "submission_deadline"
        static let maxSubmissionsPerUser = "max_submissions_per_user"
        static let minMovieYear = "min_movie_year"
        static let maxMovieYear = "max_movie_year"
        static let chatMessageMaxLength = "chat_message_max_length"
        static let maxWatchlistItems = "max_watchlist_items"
        
        // UI Configuration
        static let primaryColor = "primary_color"
        static let accentColor = "accent_color"
        static let showMovieRatings = "show_movie_ratings"
        static let showMovieDescriptions = "show_movie_descriptions"
        static let enableAnimations = "enable_animations"
        
        // API Configuration
        static let tmdbApiTimeout = "tmdb_api_timeout"
        static let cacheExpirationHours = "cache_expiration_hours"
        
        // Messages
        static let maintenanceMessage = "maintenance_message"
        static let announcementMessage = "announcement_message"
        static let welcomeMessage = "welcome_message"
    }
    
    // MARK: - Initialization
    
    func configure() {
        remoteConfig = RemoteConfig.remoteConfig()
        
        let settings = RemoteConfigSettings()
        settings.minimumFetchInterval = 3600 // 1 hour in production, 0 for testing
        remoteConfig.configSettings = settings
        
        // Set default values
        setDefaultValues()
        
        // Fetch initial values
        fetchAndActivate()
        
        isInitialized = true
        print("✅ Remote Config initialized")
    }
    
    private func setDefaultValues() {
        let defaults: [String: NSObject] = [
            // Feature Flags (default all enabled)
            ConfigKeys.submissionEnabled: true as NSObject,
            ConfigKeys.chatEnabled: true as NSObject,
            ConfigKeys.watchlistEnabled: true as NSObject,
            ConfigKeys.calendarEnabled: true as NSObject,
            ConfigKeys.shareEnabled: true as NSObject,
            ConfigKeys.analyticsEnabled: true as NSObject,
            
            // Configuration Values
            ConfigKeys.submissionDeadline: "" as NSObject, // Empty means no deadline
            ConfigKeys.maxSubmissionsPerUser: 1 as NSObject,
            ConfigKeys.minMovieYear: 1900 as NSObject,
            ConfigKeys.maxMovieYear: 2025 as NSObject,
            ConfigKeys.chatMessageMaxLength: 500 as NSObject,
            ConfigKeys.maxWatchlistItems: 50 as NSObject,
            
            // UI Configuration
            ConfigKeys.primaryColor: "#bc252d" as NSObject,
            ConfigKeys.accentColor: "#4d695d" as NSObject,
            ConfigKeys.showMovieRatings: true as NSObject,
            ConfigKeys.showMovieDescriptions: true as NSObject,
            ConfigKeys.enableAnimations: true as NSObject,
            
            // API Configuration
            ConfigKeys.tmdbApiTimeout: 10 as NSObject, // seconds
            ConfigKeys.cacheExpirationHours: 24 as NSObject,
            
            // Messages
            ConfigKeys.maintenanceMessage: "" as NSObject,
            ConfigKeys.announcementMessage: "" as NSObject,
            ConfigKeys.welcomeMessage: "Welcome to Movie Club Cafe! 🎬" as NSObject
        ]
        
        remoteConfig.setDefaults(defaults)
    }
    
    func fetchAndActivate(completion: ((Bool) -> Void)? = nil) {
        remoteConfig.fetch { [weak self] status, error in
            guard let self = self else { return }
            
            if status == .success {
                self.remoteConfig.activate { _, error in
                    if let error = error {
                        print("❌ Remote Config activation error: \(error.localizedDescription)")
                        completion?(false)
                    } else {
                        print("✅ Remote Config fetched and activated")
                        completion?(true)
                    }
                }
            } else if let error = error {
                print("❌ Remote Config fetch error: \(error.localizedDescription)")
                completion?(false)
            }
        }
    }
    
    // MARK: - Feature Flags
    
    func isSubmissionEnabled() -> Bool {
        return remoteConfig[ConfigKeys.submissionEnabled].boolValue
    }
    
    func isChatEnabled() -> Bool {
        return remoteConfig[ConfigKeys.chatEnabled].boolValue
    }
    
    func isWatchlistEnabled() -> Bool {
        return remoteConfig[ConfigKeys.watchlistEnabled].boolValue
    }
    
    func isCalendarEnabled() -> Bool {
        return remoteConfig[ConfigKeys.calendarEnabled].boolValue
    }
    
    func isShareEnabled() -> Bool {
        return remoteConfig[ConfigKeys.shareEnabled].boolValue
    }
    
    func isAnalyticsEnabled() -> Bool {
        return remoteConfig[ConfigKeys.analyticsEnabled].boolValue
    }
    
    // MARK: - Configuration Values
    
    func getSubmissionDeadline() -> String {
        return remoteConfig[ConfigKeys.submissionDeadline].stringValue ?? ""
    }
    
    func getMaxSubmissionsPerUser() -> Int {
        return remoteConfig[ConfigKeys.maxSubmissionsPerUser].numberValue.intValue
    }
    
    func getMinMovieYear() -> Int {
        return remoteConfig[ConfigKeys.minMovieYear].numberValue.intValue
    }
    
    func getMaxMovieYear() -> Int {
        return remoteConfig[ConfigKeys.maxMovieYear].numberValue.intValue
    }
    
    func getChatMessageMaxLength() -> Int {
        return remoteConfig[ConfigKeys.chatMessageMaxLength].numberValue.intValue
    }
    
    func getMaxWatchlistItems() -> Int {
        return remoteConfig[ConfigKeys.maxWatchlistItems].numberValue.intValue
    }
    
    // MARK: - UI Configuration
    
    func getPrimaryColor() -> String {
        return remoteConfig[ConfigKeys.primaryColor].stringValue ?? "#bc252d"
    }
    
    func getAccentColor() -> String {
        return remoteConfig[ConfigKeys.accentColor].stringValue ?? "#4d695d"
    }
    
    func shouldShowMovieRatings() -> Bool {
        return remoteConfig[ConfigKeys.showMovieRatings].boolValue
    }
    
    func shouldShowMovieDescriptions() -> Bool {
        return remoteConfig[ConfigKeys.showMovieDescriptions].boolValue
    }
    
    func areAnimationsEnabled() -> Bool {
        return remoteConfig[ConfigKeys.enableAnimations].boolValue
    }
    
    // MARK: - API Configuration
    
    func getTMDBApiTimeout() -> TimeInterval {
        return TimeInterval(remoteConfig[ConfigKeys.tmdbApiTimeout].numberValue.intValue)
    }
    
    func getCacheExpirationHours() -> Int {
        return remoteConfig[ConfigKeys.cacheExpirationHours].numberValue.intValue
    }
    
    // MARK: - Messages
    
    func getMaintenanceMessage() -> String? {
        let message = remoteConfig[ConfigKeys.maintenanceMessage].stringValue
        return message?.isEmpty == false ? message : nil
    }
    
    func getAnnouncementMessage() -> String? {
        let message = remoteConfig[ConfigKeys.announcementMessage].stringValue
        return message?.isEmpty == false ? message : nil
    }
    
    func getWelcomeMessage() -> String {
        return remoteConfig[ConfigKeys.welcomeMessage].stringValue ?? "Welcome to Movie Club Cafe! 🎬"
    }
    
    // MARK: - Helper Methods
    
    func getAllValues() -> [String: Any] {
        var values: [String: Any] = [:]
        
        for key in remoteConfig.allKeys(from: .remote) {
            let configValue = remoteConfig[key]
            
            if let stringValue = configValue.stringValue {
                values[key] = stringValue
            } else if let numberValue = configValue.numberValue {
                values[key] = numberValue
            }
        }
        
        return values
    }
    
    func refreshConfig() {
        fetchAndActivate { success in
            if success {
                print("✅ Remote Config refreshed successfully")
            }
        }
    }
}

// MARK: - SwiftUI Integration Helper

import SwiftUI

struct RemoteConfigKey: EnvironmentKey {
    static let defaultValue = RemoteConfigService.shared
}

extension EnvironmentValues {
    var remoteConfig: RemoteConfigService {
        get { self[RemoteConfigKey.self] }
        set { self[RemoteConfigKey.self] = newValue }
    }
}

