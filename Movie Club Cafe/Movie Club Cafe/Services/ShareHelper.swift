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
    
    // Share message
    static var shareMessage: String {
        """
        Join me on \(appName)! 🎬
        
        A cozy corner for anime, manga, music, and monthly movie club! 🍿✨
        
        Check it out: \(websiteURL)
        """
    }
    
    /// Present the iOS share sheet
    /// - Parameters:
    ///   - items: Items to share (defaults to app message and URL)
    ///   - sourceView: The view from which to present (for iPad positioning)
    static func presentShareSheet(items: [Any]? = nil, from sourceView: UIView? = nil) {
        let shareItems = items ?? [shareMessage, URL(string: websiteURL)!].compactMap { $0 }
        
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

// SwiftUI wrapper for ShareSheet
struct ShareSheet: UIViewControllerRepresentable {
    let items: [Any]
    
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

