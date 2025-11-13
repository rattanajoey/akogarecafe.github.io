//
//  ChatDebugView.swift
//  Movie Club Cafe
//
//  Debug view to diagnose chat issues
//

import SwiftUI
import FirebaseAuth
import FirebaseFirestore

struct ChatDebugView: View {
    @State private var debugInfo: [String] = []
    @State private var isLoading = false
    
    var body: some View {
        NavigationView {
            List {
                Section(header: Text("Debug Information")) {
                    ForEach(debugInfo, id: \.self) { info in
                        Text(info)
                            .font(.system(.caption, design: .monospaced))
                    }
                }
                
                Section {
                    Button("Run Diagnostics") {
                        runDiagnostics()
                    }
                    .disabled(isLoading)
                    
                    if isLoading {
                        ProgressView()
                    }
                }
                
                Section {
                    Button("Create Test Chat Room") {
                        createTestChatRoom()
                    }
                    .disabled(isLoading)
                }
            }
            .navigationTitle("Chat Diagnostics")
        }
    }
    
    func runDiagnostics() {
        isLoading = true
        debugInfo = ["🔍 Running diagnostics..."]
        
        // Check 1: Authentication
        if let user = Auth.auth().currentUser {
            debugInfo.append("✅ User authenticated")
            debugInfo.append("   UID: \(user.uid)")
            debugInfo.append("   Email: \(user.email ?? "none")")
            debugInfo.append("   Display Name: \(user.displayName ?? "none")")
        } else {
            debugInfo.append("❌ User NOT authenticated")
            isLoading = false
            return
        }
        
        // Check 2: Firestore connection
        let db = Firestore.firestore()
        debugInfo.append("✅ Firestore instance created")
        
        // Check 3: Try to read ChatRooms collection
        Task {
            do {
                let snapshot = try await db.collection("ChatRooms").getDocuments()
                await MainActor.run {
                    debugInfo.append("✅ ChatRooms collection accessible")
                    debugInfo.append("   Found \(snapshot.documents.count) rooms")
                    
                    for (index, doc) in snapshot.documents.prefix(3).enumerated() {
                        debugInfo.append("   Room \(index + 1): \(doc.documentID)")
                        debugInfo.append("   Data: \(doc.data())")
                    }
                }
            } catch {
                await MainActor.run {
                    debugInfo.append("❌ Error reading ChatRooms: \(error.localizedDescription)")
                    
                    // Check if it's a permissions error
                    if error.localizedDescription.contains("permission") || error.localizedDescription.contains("PERMISSION_DENIED") {
                        debugInfo.append("⚠️ PERMISSION DENIED - Firebase rules not updated!")
                        debugInfo.append("   Go to Firebase Console → Firestore → Rules")
                        debugInfo.append("   Copy rules from FIREBASE_SECURITY_RULES.txt")
                    }
                }
            }
            
            // Check 4: Try to create a test document
            await testWrite(db: db)
            
            await MainActor.run {
                isLoading = false
            }
        }
    }
    
    func testWrite(db: Firestore) async {
        do {
            debugInfo.append("\n📝 Testing write permissions...")
            
            let testData: [String: Any] = [
                "name": "Test Room - \(Date().timeIntervalSince1970)",
                "description": "Debug test",
                "createdAt": Timestamp(date: Date()),
                "createdBy": Auth.auth().currentUser?.uid ?? "unknown",
                "lastMessage": NSNull(),
                "lastMessageTimestamp": NSNull(),
                "memberIds": [Auth.auth().currentUser?.uid ?? "unknown"],
                "isPublic": true
            ]
            
            let docRef = try await db.collection("ChatRooms").addDocument(data: testData)
            
            await MainActor.run {
                debugInfo.append("✅ Successfully created test room!")
                debugInfo.append("   Document ID: \(docRef.documentID)")
            }
            
            // Try to delete the test document
            try await docRef.delete()
            await MainActor.run {
                debugInfo.append("✅ Cleaned up test document")
            }
            
        } catch {
            await MainActor.run {
                debugInfo.append("❌ Write test failed: \(error.localizedDescription)")
                
                let errorString = error.localizedDescription.lowercased()
                if errorString.contains("permission") {
                    debugInfo.append("⚠️ PERMISSIONS ERROR!")
                    debugInfo.append("   Solution: Update Firebase Security Rules")
                    debugInfo.append("   1. Go to Firebase Console")
                    debugInfo.append("   2. Firestore Database → Rules")
                    debugInfo.append("   3. Paste rules from FIREBASE_SECURITY_RULES.txt")
                    debugInfo.append("   4. Click Publish")
                }
            }
        }
    }
    
    func createTestChatRoom() {
        isLoading = true
        debugInfo.append("\n🚀 Creating test chat room...")
        
        let chatService = ChatService()
        
        Task {
            do {
                let roomId = try await chatService.createChatRoom(
                    name: "Test Room \(Int(Date().timeIntervalSince1970))",
                    description: "Created from debug view"
                )
                
                await MainActor.run {
                    debugInfo.append("✅ Chat room created successfully!")
                    debugInfo.append("   Room ID: \(roomId)")
                    isLoading = false
                }
            } catch {
                await MainActor.run {
                    debugInfo.append("❌ Failed to create chat room:")
                    debugInfo.append("   \(error.localizedDescription)")
                    isLoading = false
                }
            }
        }
    }
}

#Preview {
    ChatDebugView()
}

