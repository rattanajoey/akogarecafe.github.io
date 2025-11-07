//
//  ChatModels.swift
//  Movie Club Cafe
//
//  Real-time chat messaging models
//

import Foundation
import FirebaseFirestore

// MARK: - Chat Message
struct ChatMessage: Identifiable, Codable, Equatable {
    @DocumentID var id: String?
    let senderId: String
    let senderName: String
    let senderPhotoURL: String?
    let text: String
    let timestamp: Date
    let isRead: Bool
    let type: MessageType
    
    enum MessageType: String, Codable {
        case text
        case system
        case movieRecommendation
    }
    
    init(senderId: String, senderName: String, senderPhotoURL: String? = nil, text: String, timestamp: Date = Date(), isRead: Bool = false, type: MessageType = .text) {
        self.senderId = senderId
        self.senderName = senderName
        self.senderPhotoURL = senderPhotoURL
        self.text = text
        self.timestamp = timestamp
        self.isRead = isRead
        self.type = type
    }
    
    static func == (lhs: ChatMessage, rhs: ChatMessage) -> Bool {
        lhs.id == rhs.id
    }
}

// MARK: - Chat Room
struct ChatRoom: Identifiable, Codable {
    @DocumentID var id: String?
    let name: String
    let description: String?
    let createdAt: Date
    let createdBy: String
    let lastMessage: String?
    let lastMessageTimestamp: Date?
    let memberIds: [String]
    let isPublic: Bool
    
    init(name: String, description: String? = nil, createdBy: String, memberIds: [String] = [], isPublic: Bool = true) {
        self.name = name
        self.description = description
        self.createdAt = Date()
        self.createdBy = createdBy
        self.lastMessage = nil
        self.lastMessageTimestamp = nil
        self.memberIds = memberIds
        self.isPublic = isPublic
    }
}

// MARK: - Notification Models
struct AppNotification: Identifiable, Codable, Equatable {
    @DocumentID var id: String?
    let title: String
    let body: String
    let type: NotificationType
    let timestamp: Date
    let senderId: String?
    let senderName: String?
    let isRead: Bool
    let actionUrl: String?
    let metadata: [String: String]?
    
    enum NotificationType: String, Codable {
        case movieUpdate = "movie_update"
        case adminAnnouncement = "admin_announcement"
        case newSubmission = "new_submission"
        case monthlySelection = "monthly_selection"
        case chatMention = "chat_mention"
        case oscarVoting = "oscar_voting"
        case general = "general"
    }
    
    init(title: String, body: String, type: NotificationType, senderId: String? = nil, senderName: String? = nil, isRead: Bool = false, actionUrl: String? = nil, metadata: [String: String]? = nil) {
        self.title = title
        self.body = body
        self.type = type
        self.timestamp = Date()
        self.senderId = senderId
        self.senderName = senderName
        self.isRead = isRead
        self.actionUrl = actionUrl
        self.metadata = metadata
    }
    
    static func == (lhs: AppNotification, rhs: AppNotification) -> Bool {
        lhs.id == rhs.id
    }
}

// MARK: - User Status
struct UserStatus: Codable {
    let userId: String
    let displayName: String
    let photoURL: String?
    let isOnline: Bool
    let lastSeen: Date
    
    init(userId: String, displayName: String, photoURL: String? = nil, isOnline: Bool = false) {
        self.userId = userId
        self.displayName = displayName
        self.photoURL = photoURL
        self.isOnline = isOnline
        self.lastSeen = Date()
    }
}

