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
    
    private let db = Firestore.firestore()
    private var roomsListener: ListenerRegistration?
    private var messagesListener: ListenerRegistration?
    private var currentChatRoomId: String?
    
    // MARK: - Chat Room Management
    
    /// Create a new chat room
    func createChatRoom(name: String, description: String? = nil, isPublic: Bool = true) async throws -> String {
        guard let userId = Auth.auth().currentUser?.uid,
              let displayName = Auth.auth().currentUser?.displayName else {
            throw NSError(domain: "ChatService", code: 401, userInfo: [NSLocalizedDescriptionKey: "User not authenticated"])
        }
        
        let chatRoom = ChatRoom(
            name: name,
            description: description,
            createdBy: userId,
            memberIds: [userId],
            isPublic: isPublic
        )
        
        do {
            let docRef = try db.collection("ChatRooms").addDocument(from: chatRoom)
            return docRef.documentID
        } catch {
            throw error
        }
    }
    
    /// Listen to all chat rooms
    func listenToChatRooms() {
        roomsListener?.remove()
        
        roomsListener = db.collection("ChatRooms")
            .order(by: "lastMessageTimestamp", descending: true)
            .addSnapshotListener { [weak self] snapshot, error in
                guard let self = self else { return }
                
                if let error = error {
                    self.error = error.localizedDescription
                    return
                }
                
                guard let documents = snapshot?.documents else { return }
                
                self.chatRooms = documents.compactMap { document in
                    try? document.data(as: ChatRoom.self)
                }
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
                    self.error = error.localizedDescription
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
    
    // MARK: - Cleanup
    
    func stopListening() {
        roomsListener?.remove()
        messagesListener?.remove()
    }
    
    deinit {
        stopListening()
    }
}

