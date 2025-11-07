//
//  MovieClubAdminView.swift
//  Movie Club Cafe
//
//  Created by Kavy Rattana on 11/6/25.
//

import SwiftUI
#if canImport(FirebaseFirestore)
import FirebaseFirestore
#endif

struct MovieClubAdminView: View {
    @State private var hasAccess = false
    @State private var password = ""
    @State private var selectedTab = 0
    
    private var adminPassword: String { AppConfig.adminPassword }
    
    var body: some View {
        NavigationView {
            if !hasAccess {
                adminLoginView
            } else {
                tabView
            }
        }
    }
    
    private var tabView: some View {
        TabView(selection: $selectedTab) {
            AdminMonthlySelectionView()
                .tabItem {
                    Label("Selections", systemImage: "film.stack")
                }
                .tag(0)
            
            AdminOscarManagementView()
                .tabItem {
                    Label("Oscars", systemImage: "trophy.fill")
                }
                .tag(1)
            
            AdminHoldingPoolView()
                .tabItem {
                    Label("Holding Pool", systemImage: "tray.full.fill")
                }
                .tag(2)
            
            AdminMonthlyHistoryView()
                .tabItem {
                    Label("History", systemImage: "calendar")
                }
                .tag(3)
        }
        .navigationTitle("Admin Panel")
        .navigationBarTitleDisplayMode(.inline)
    }
    
    private var adminLoginView: some View {
        VStack(spacing: 20) {
            Image(systemName: "lock.shield.fill")
                .font(.system(size: 60))
                .foregroundColor(AppTheme.accentColor)
            
            Text("🔐 Enter Admin Password")
                .font(.title)
                .fontWeight(.bold)
            
            SecureField("Admin Password", text: $password)
                .textFieldStyle(.roundedBorder)
                .padding(.horizontal)
            
            Button(action: handleLogin) {
                Text("Access Admin Panel")
                    .fontWeight(.semibold)
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(AppTheme.accentColor)
                    .foregroundColor(.white)
                    .cornerRadius(10)
            }
            .padding(.horizontal)
        }
        .padding()
    }
    
    private func handleLogin() {
        if password == adminPassword {
            hasAccess = true
        }
    }
}

#Preview {
    MovieClubAdminView()
}

