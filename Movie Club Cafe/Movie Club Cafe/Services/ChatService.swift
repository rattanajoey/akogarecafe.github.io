//
//  ChatService.swift
//  Movie Club Cafe
//
//  Real-time chat service with Firestore
//

import Foundation
import FirebaseFirestore
import FirebaseAuth
import Combine

class ChatService: ObservableObject {
    @Published var chatRooms: [ChatRoom] = []
    @Published var messages: [ChatMessage] = []
    @Published var unreadCount: Int = 0
    @Published var isLoading = false
    @Published var error: String?
    @Published var onlineUsers: [UserStatus] = []
    
    private let db = Firestore.firestore()
    private var roomsListener: ListenerRegistration?
    private var messagesListener: ListenerRegistration?
    private var onlineUsersListener: ListenerRegistration?
    private var currentChatRoomId: String?
    
    // Single chat room ID for all users
    static let mainChatRoomId = "main-chat-room"
    
    // MARK: - Chat Room Management
    
    /// Ensure the main chat room exists
    func ensureMainChatRoomExists() async throws {
        let chatRoomRef = db.collection("ChatRooms").document(ChatService.mainChatRoomId)
        
        do {
            let snapshot = try await chatRoomRef.getDocument()
            
            if !snapshot.exists {
                print("📝 ChatService: Creating main chat room")
                
                // Create the main chat room
                let chatRoomData: [String: Any] = [
                    "name": "Movie Club Chat",
                    "description": "Chat with all Movie Club members!",
                    "createdAt": Timestamp(date: Date()),
                    "createdBy": "system",
                    "lastMessage": NSNull(),
                    "lastMessageTimestamp": NSNull(),
                    "memberIds": [],
                    "isPublic": true
                ]
                
                try await chatRoomRef.setData(chatRoomData)
                print("✅ ChatService: Main chat room created")
            } else {
                print("✅ ChatService: Main chat room already exists")
            }
        } catch {
            print("❌ ChatService: Error ensuring main chat room: \(error.localizedDescription)")
            throw error
        }
    }
    
    /// Create a new chat room
    func createChatRoom(name: String, description: String? = nil) async throws -> String {
        guard let userId = Auth.auth().currentUser?.uid else {
            throw NSError(domain: "ChatService", code: 401, userInfo: [NSLocalizedDescriptionKey: "User not authenticated"])
        }
        
        print("📝 ChatService: Creating chat room '\(name)'")
        
        let chatRoomData: [String: Any] = [
            "name": name,
            "description": description ?? "",
            "createdAt": Timestamp(date: Date()),
            "createdBy": userId,
            "lastMessage": NSNull(),
            "lastMessageTimestamp": NSNull(),
            "memberIds": [userId],
            "isPublic": true
        ]
        
        do {
            let docRef = try await db.collection("ChatRooms").addDocument(data: chatRoomData)
            print("✅ ChatService: Chat room created with ID: \(docRef.documentID)")
            return docRef.documentID
        } catch {
            print("❌ ChatService: Error creating chat room: \(error.localizedDescription)")
            throw error
        }
    }
    
    /// Listen to all chat rooms
    func listenToChatRooms() {
        roomsListener?.remove()
        
        print("👂 ChatService: Starting to listen to chat rooms")
        
        // Order by createdAt instead of lastMessageTimestamp to show newly created rooms
        roomsListener = db.collection("ChatRooms")
            .order(by: "createdAt", descending: true)
            .addSnapshotListener { [weak self] snapshot, error in
                guard let self = self else { return }
                
                if let error = error {
                    print("❌ ChatService: Error listening to chat rooms: \(error.localizedDescription)")
                    self.error = error.localizedDescription
                    return
                }
                
                guard let documents = snapshot?.documents else {
                    print("⚠️ ChatService: No documents found")
                    return
                }
                
                print("📥 ChatService: Received \(documents.count) chat rooms")
                
                self.chatRooms = documents.compactMap { document in
                    do {
                        let room = try document.data(as: ChatRoom.self)
                        print("✅ ChatService: Decoded room: \(room.name)")
                        return room
                    } catch {
                        print("❌ ChatService: Error decoding room: \(error.localizedDescription)")
                        print("Document data: \(document.data())")
                        return nil
                    }
                }
                
                print("✅ ChatService: Successfully loaded \(self.chatRooms.count) chat rooms")
            }
    }
    
    /// Listen to messages in a specific chat room
    func listenToMessages(chatRoomId: String) {
        messagesListener?.remove()
        currentChatRoomId = chatRoomId
        
        isLoading = true
        
        messagesListener = db.collection("ChatRooms")
            .document(chatRoomId)
            .collection("Messages")
            .order(by: "timestamp", descending: false)
            .addSnapshotListener { [weak self] snapshot, error in
                guard let self = self else { return }
                
                self.isLoading = false
                
                if let error = error {
                    print("❌ ChatService: Error listening to messages: \(error.localizedDescription)")
                    
                    // Provide helpful error message for permissions
                    if error.localizedDescription.contains("permission") || 
                       error.localizedDescription.contains("PERMISSION_DENIED") {
                        self.error = "Missing or insufficient permissions. Please ensure Firebase Security Rules are deployed."
                    } else {
                        self.error = error.localizedDescription
                    }
                    return
                }
                
                guard let documents = snapshot?.documents else { return }
                
                self.messages = documents.compactMap { document in
                    try? document.data(as: ChatMessage.self)
                }
                
                // Mark messages as read
                self.markMessagesAsRead(chatRoomId: chatRoomId)
            }
    }
    
    // MARK: - Send Message
    
    /// Send a message to a chat room
    func sendMessage(chatRoomId: String, text: String, type: ChatMessage.MessageType = .text) async throws {
        guard let userId = Auth.auth().currentUser?.uid,
              let displayName = Auth.auth().currentUser?.displayName else {
            throw NSError(domain: "ChatService", code: 401, userInfo: [NSLocalizedDescriptionKey: "User not authenticated"])
        }
        
        let photoURL = Auth.auth().currentUser?.photoURL?.absoluteString
        
        let message = ChatMessage(
            senderId: userId,
            senderName: displayName,
            senderPhotoURL: photoURL,
            text: text,
            type: type
        )
        
        // Add message to chat room
        try db.collection("ChatRooms")
            .document(chatRoomId)
            .collection("Messages")
            .addDocument(from: message)
        
        // Update chat room's last message
        try await db.collection("ChatRooms")
            .document(chatRoomId)
            .updateData([
                "lastMessage": text,
                "lastMessageTimestamp": FieldValue.serverTimestamp()
            ])
    }
    
    // MARK: - Mark as Read
    
    private func markMessagesAsRead(chatRoomId: String) {
        guard let userId = Auth.auth().currentUser?.uid else { return }
        
        let unreadMessages = messages.filter { !$0.isRead && $0.senderId != userId }
        
        for message in unreadMessages {
            guard let messageId = message.id else { continue }
            
            db.collection("ChatRooms")
                .document(chatRoomId)
                .collection("Messages")
                .document(messageId)
                .updateData(["isRead": true])
        }
    }
    
    // MARK: - Get Unread Count
    
    func listenToUnreadCount() {
        guard let userId = Auth.auth().currentUser?.uid else { return }
        
        // Listen to all messages where user is not the sender and message is unread
        db.collectionGroup("Messages")
            .whereField("isRead", isEqualTo: false)
            .addSnapshotListener { [weak self] snapshot, error in
                guard let self = self else { return }
                
                if let error = error {
                    print("Error listening to unread count: \(error)")
                    return
                }
                
                let unreadMessages = snapshot?.documents.compactMap { document in
                    try? document.data(as: ChatMessage.self)
                }.filter { $0.senderId != userId } ?? []
                
                self.unreadCount = unreadMessages.count
            }
    }
    
    // MARK: - Online Users Management
    
    /// Mark user as online in chat
    func markUserOnline() async throws {
        guard let userId = Auth.auth().currentUser?.uid else { return }
        
        let displayName = Auth.auth().currentUser?.displayName ?? "Anonymous"
        let photoURL = Auth.auth().currentUser?.photoURL?.absoluteString
        
        let userStatus = UserStatus(
            userId: userId,
            displayName: displayName,
            photoURL: photoURL,
            isOnline: true
        )
        
        do {
            try db.collection("ChatRooms")
                .document(ChatService.mainChatRoomId)
                .collection("OnlineUsers")
                .document(userId)
                .setData(from: userStatus)
            
            print("✅ ChatService: Marked user \(displayName) as online")
        } catch {
            print("❌ ChatService: Error marking user online: \(error.localizedDescription)")
            throw error
        }
    }
    
    /// Mark user as offline in chat
    func markUserOffline() async {
        guard let userId = Auth.auth().currentUser?.uid else { return }
        
        do {
            try await db.collection("ChatRooms")
                .document(ChatService.mainChatRoomId)
                .collection("OnlineUsers")
                .document(userId)
                .delete()
            
            print("✅ ChatService: Marked user as offline")
        } catch {
            print("❌ ChatService: Error marking user offline: \(error.localizedDescription)")
        }
    }
    
    /// Listen to online users in the chat
    func listenToOnlineUsers() {
        onlineUsersListener?.remove()
        
        print("👥 ChatService: Starting to listen to online users")
        
        onlineUsersListener = db.collection("ChatRooms")
            .document(ChatService.mainChatRoomId)
            .collection("OnlineUsers")
            .addSnapshotListener { [weak self] snapshot, error in
                guard let self = self else { return }
                
                if let error = error {
                    print("❌ ChatService: Error listening to online users: \(error.localizedDescription)")
                    return
                }
                
                guard let documents = snapshot?.documents else {
                    print("⚠️ ChatService: No online users found")
                    self.onlineUsers = []
                    return
                }
                
                self.onlineUsers = documents.compactMap { document in
                    try? document.data(as: UserStatus.self)
                }
                
                print("👥 ChatService: \(self.onlineUsers.count) users online")
            }
    }
    
    // MARK: - Cleanup
    
    func stopListening() {
        roomsListener?.remove()
        messagesListener?.remove()
        onlineUsersListener?.remove()
    }
    
    deinit {
        stopListening()
    }
}

