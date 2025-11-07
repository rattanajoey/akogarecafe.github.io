//
//  ContentView.swift
//  Movie Club Cafe
//
//  Created by Kavy Rattana on 10/4/25.
//

import SwiftUI

struct ContentView: View {
    @EnvironmentObject var authService: AuthenticationService
    
    var body: some View {
        Group {
            if authService.isAuthenticated {
                TabView {
                    MovieClubView()
                        .tabItem {
                            Label("Movie Club", systemImage: "film.stack")
                        }
                    
                    ProfileView()
                        .tabItem {
                            Label("Profile", systemImage: "person.circle")
                        }
                    
                    // Admin tab (only visible for admin users)
                    if authService.isAdmin {
                        MovieClubAdminView()
                            .tabItem {
                                Label("Admin", systemImage: "gear")
                            }
                    }
                }
            } else {
                SignInView()
            }
        }
    }
}

#Preview {
    ContentView()
        .environmentObject(AuthenticationService())
}
