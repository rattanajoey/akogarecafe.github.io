//
//  AppTheme.swift
//  Movie Club Cafe
//
//  Created by Kavy Rattana on 10/4/25.
//

import SwiftUI

struct AppTheme {
    // Colors matching the web version
    static let backgroundColor1 = Color(hex: "d2d2cb")
    static let backgroundColor2 = Color(hex: "4d695d")
    static let accentColor = Color(hex: "bc252d")
    static let cardBackground = Color.white.opacity(0.9)
    static let textPrimary = Color(hex: "2c2c2c")
    static let textSecondary = Color.gray
    
    // Gradient background
    static let backgroundGradient = LinearGradient(
        gradient: Gradient(colors: [backgroundColor1, backgroundColor2]),
        startPoint: .top,
        endPoint: .bottom
    )
}

extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 3: // RGB (12-bit)
            (a, r, g, b) = (255, (int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)
        case 6: // RGB (24-bit)
            (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8: // ARGB (32-bit)
            (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default:
            (a, r, g, b) = (255, 0, 0, 0)
        }
        
        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue:  Double(b) / 255,
            opacity: Double(a) / 255
        )
    }
}

