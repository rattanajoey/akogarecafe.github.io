//
//  ShareHelper.swift
//  Movie Club Cafe
//
//  Share functionality for inviting users to the app
//

import SwiftUI
import UIKit

struct ShareHelper {
    // App details
    static let appName = "Movie Club Cafe"
    static let websiteURL = "https://akogarecafe.com"
    
    // App Store URL (update this when app is published)
    // For now, we'll share the website URL
    static let appStoreURL = websiteURL
    
    // App metadata for rich sharing
    static var appTitle: String {
        "Akogare Cafe - Anime, Manga, Music & Movie Club"
    }
    
    // Share message
    static var shareMessage: String {
        """
        Join me on \(appName)! 🎬
        
        A cozy corner for anime, manga, music, and monthly movie club! 🍿✨
        
        Check it out: \(websiteURL)
        """
    }
    
    // Get app icon as UIImage
    static var appIcon: UIImage? {
        // Try to get the app icon from the asset catalog
        if let iconImage = UIImage(named: "AppIcon") {
            return iconImage
        }
        
        // Fallback: Try to get from bundle
        guard let icons = Bundle.main.object(forInfoDictionaryKey: "CFBundleIcons") as? [String: Any],
              let primaryIcon = icons["CFBundlePrimaryIcon"] as? [String: Any],
              let iconFiles = primaryIcon["CFBundleIconFiles"] as? [String],
              let lastIcon = iconFiles.last else {
            return nil
        }
        
        return UIImage(named: lastIcon)
    }
    
    /// Present the iOS share sheet with rich content
    /// - Parameters:
    ///   - items: Items to share (defaults to app message, URL, and icon)
    ///   - sourceView: The view from which to present (for iPad positioning)
    static func presentShareSheet(items: [Any]? = nil, from sourceView: UIView? = nil) {
        // Create rich share items with app icon if available
        var shareItems: [Any] = []
        
        if let customItems = items {
            shareItems = customItems
        } else {
            // Add app icon if available
            if let icon = appIcon {
                shareItems.append(icon)
            }
            
            // Add message and URL
            shareItems.append(shareMessage)
            if let url = URL(string: websiteURL) {
                shareItems.append(url)
            }
        }
        
        let activityViewController = UIActivityViewController(
            activityItems: shareItems,
            applicationActivities: nil
        )
        
        // Configure for iPad (popover)
        if let popoverController = activityViewController.popoverPresentationController,
           let sourceView = sourceView {
            popoverController.sourceView = sourceView
            popoverController.sourceRect = sourceView.bounds
        }
        
        // Get the root view controller
        if let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
           let rootViewController = windowScene.windows.first?.rootViewController {
            
            // Find the topmost view controller
            var topController = rootViewController
            while let presentedViewController = topController.presentedViewController {
                topController = presentedViewController
            }
            
            topController.present(activityViewController, animated: true)
        }
    }
    
    /// Share via a specific app (if installed)
    /// - Parameter activityType: The activity type (e.g., UIActivity.ActivityType.message for iMessage)
    static func shareVia(activityType: UIActivity.ActivityType) {
        let shareItems = [shareMessage, URL(string: websiteURL)!].compactMap { $0 }
        
        let activityViewController = UIActivityViewController(
            activityItems: shareItems,
            applicationActivities: nil
        )
        
        // Attempt to share via specific app
        activityViewController.excludedActivityTypes = UIActivity.ActivityType.allCases.filter { $0 != activityType }
        
        if let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
           let rootViewController = windowScene.windows.first?.rootViewController {
            
            var topController = rootViewController
            while let presentedViewController = topController.presentedViewController {
                topController = presentedViewController
            }
            
            topController.present(activityViewController, animated: true)
        }
    }
}

// SwiftUI wrapper for ShareSheet with automatic icon inclusion
struct ShareSheet: UIViewControllerRepresentable {
    let items: [Any]
    let includeAppIcon: Bool
    
    init(items: [Any], includeAppIcon: Bool = true) {
        // Automatically include app icon if not already in items
        if includeAppIcon, !items.contains(where: { $0 is UIImage }) {
            var enrichedItems: [Any] = []
            if let icon = ShareHelper.appIcon {
                enrichedItems.append(icon)
            }
            enrichedItems.append(contentsOf: items)
            self.items = enrichedItems
        } else {
            self.items = items
        }
        self.includeAppIcon = includeAppIcon
    }
    
    func makeUIViewController(context: Context) -> UIActivityViewController {
        let controller = UIActivityViewController(
            activityItems: items,
            applicationActivities: nil
        )
        return controller
    }
    
    func updateUIViewController(_ uiViewController: UIActivityViewController, context: Context) {
        // No updates needed
    }
}

// Extension to get all activity types (for exclusion)
extension UIActivity.ActivityType {
    static var allCases: [UIActivity.ActivityType] {
        return [
            .postToFacebook,
            .postToTwitter,
            .postToWeibo,
            .message,
            .mail,
            .print,
            .copyToPasteboard,
            .assignToContact,
            .saveToCameraRoll,
            .addToReadingList,
            .postToFlickr,
            .postToVimeo,
            .postToTencentWeibo,
            .airDrop,
            .openInIBooks,
            .markupAsPDF
        ]
    }
}

