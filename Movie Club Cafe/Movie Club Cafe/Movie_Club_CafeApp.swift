//
//  Movie_Club_CafeApp.swift
//  Movie Club Cafe
//
//  Created by Kavy Rattana on 10/4/25.
//

import SwiftUI
import FirebaseCore

@main
struct Movie_Club_CafeApp: App {
    @StateObject private var authService = AuthenticationService()
    
    init() {
        // Initialize Firebase
        FirebaseConfig.shared.configure()
    }
    
    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(authService)
        }
    }
}
