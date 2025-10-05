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

class FirebaseConfig {
    static let shared = FirebaseConfig()
    
    private init() {}
    
    func configure() {
        // Configure Firebase using GoogleService-Info.plist
        // The plist file should be in the Config/ folder
        FirebaseApp.configure()
    }
    
    var db: Firestore {
        return Firestore.firestore()
    }
    
    var auth: Auth {
        return Auth.auth()
    }
}

