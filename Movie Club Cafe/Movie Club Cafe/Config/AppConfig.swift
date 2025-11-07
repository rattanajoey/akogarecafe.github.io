//
//  AppConfig.swift
//  Movie Club Cafe
//
//  Created by Kavy Rattana on 11/6/25.
//

import Foundation

/// Centralized configuration for the Movie Club app
/// This file contains passwords, API keys, and other configuration values
struct AppConfig {
    
    // MARK: - Admin Configuration
    
    /// Email addresses that are automatically granted admin privileges
    static let adminEmails: Set<String> = [
        "rattanajoey@gmail.com"
    ]
    
    /// Password required to access the admin panel
    static let adminPanelPassword = "adminpass"
    
    /// Password required to publish monthly selections
    static let publishSelectionsPassword = "thunderbolts"
    
    /// Check if an email should have admin privileges
    static func isAdminEmail(_ email: String?) -> Bool {
        guard let email = email?.lowercased() else { return false }
        return adminEmails.contains(email)
    }
    
    // MARK: - Oscar Voting Configuration
    
    /// Password required to access Oscar voting
    static let oscarVotingPassword = "oscar2025"
    
    /// Whether Oscar voting is currently enabled
    static let oscarVotingEnabled = true // Set to false during off-season
    
    // MARK: - Submission Configuration
    
    /// Password required to submit movies (matches web app)
    static let movieSubmissionPassword = "thunderbolts"
    
    // MARK: - Feature Flags
    
    /// Whether submissions are currently open
    static let submissionsOpen = false
    
    /// Whether to show the submission list
    static let showSubmissionList = true
    
    /// Whether to show the holding pool
    static let showHoldingPool = true
    
    // MARK: - Firebase Collections
    
    struct Collections {
        static let monthlySelections = "MonthlySelections"
        static let genrePools = "GenrePools"
        static let submissions = "Submissions"
        static let holdingPool = "HoldingPool"
        static let oscarCategories = "OscarCategories"
        static let oscarVotes = "OscarVotes"
        static let users = "users"
    }
    
    // MARK: - Environment-based Configuration
    
    /// Get configuration value from environment or use default
    static func getPassword(key: String, defaultValue: String) -> String {
        if let envValue = ProcessInfo.processInfo.environment[key] {
            return envValue
        }
        return defaultValue
    }
    
    // MARK: - Helper Functions
    
    /// Get the admin password from environment or default
    static var adminPassword: String {
        getPassword(key: "ADMIN_PANEL_PASSWORD", defaultValue: adminPanelPassword)
    }
    
    /// Get the publish password from environment or default
    static var publishPassword: String {
        getPassword(key: "PUBLISH_PASSWORD", defaultValue: publishSelectionsPassword)
    }
    
    /// Get the Oscar voting password from environment or default
    static var oscarPassword: String {
        getPassword(key: "OSCAR_PASSWORD", defaultValue: oscarVotingPassword)
    }
}

// MARK: - Usage Examples

/*
 
 To use these configurations in your code:
 
 1. Import the config:
    import Config (if needed)
 
 2. Access passwords:
    if password == AppConfig.adminPassword {
        // Grant access
    }
 
 3. Use feature flags:
    if AppConfig.oscarVotingEnabled {
        // Show Oscar voting button
    }
 
 4. Access collection names:
    db.collection(AppConfig.Collections.monthlySelections)
 
 5. Override with environment variables:
    In Xcode:
    - Edit Scheme → Run → Arguments → Environment Variables
    - Add: ADMIN_PANEL_PASSWORD = your_secure_password
 
 */

