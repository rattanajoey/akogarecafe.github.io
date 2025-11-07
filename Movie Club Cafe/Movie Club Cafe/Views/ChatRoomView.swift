//
//  ChatRoomView.swift
//  Movie Club Cafe
//
//  Individual chat room view with messages
//

import SwiftUI
import FirebaseAuth

struct ChatRoomView: View {
    let chatRoom: ChatRoom
    @StateObject private var chatService = ChatService()
    @State private var messageText = ""
    @State private var scrollToBottom = false
    @State private var showError = false
    @State private var errorMessage = ""
    @FocusState private var isInputFocused: Bool
    
    var body: some View {
        ZStack {
            // Background gradient
            LinearGradient(
                gradient: Gradient(colors: [
                    Color(red: 0.82, green: 0.82, blue: 0.80),
                    Color(red: 0.30, green: 0.41, blue: 0.36)
                ]),
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            .ignoresSafeArea()
            
            VStack(spacing: 0) {
                // Messages List
                ScrollViewReader { proxy in
                    ScrollView {
                        LazyVStack(spacing: 12) {
                            ForEach(chatService.messages) { message in
                                MessageBubble(message: message)
                                    .id(message.id)
                            }
                        }
                        .padding()
                    }
                    .onChange(of: chatService.messages.count) { _ in
                        if let lastMessage = chatService.messages.last {
                            withAnimation {
                                proxy.scrollTo(lastMessage.id, anchor: .bottom)
                            }
                        }
                    }
                }
                
                // Message Input
                messageInputBar
            }
        }
        .navigationTitle(chatRoom.name)
        .navigationBarTitleDisplayMode(.inline)
        .onAppear {
            if let roomId = chatRoom.id {
                chatService.listenToMessages(chatRoomId: roomId)
            }
        }
        .onDisappear {
            chatService.stopListening()
        }
        .alert("Error", isPresented: $showError) {
            Button("OK", role: .cancel) { }
        } message: {
            Text(errorMessage)
        }
    }
    
    // MARK: - Message Input Bar
    
    private var messageInputBar: some View {
        HStack(spacing: 12) {
            TextField("Type a message...", text: $messageText, axis: .vertical)
                .padding(12)
                .background(Color.white)
                .cornerRadius(20)
                .focused($isInputFocused)
                .lineLimit(1...5)
            
            Button(action: sendMessage) {
                Image(systemName: "arrow.up.circle.fill")
                    .font(.system(size: 32))
                    .foregroundColor(messageText.isEmpty ? .gray : Color(red: 0.74, green: 0.15, blue: 0.18))
            }
            .disabled(messageText.isEmpty)
        }
        .padding(.horizontal)
        .padding(.vertical, 8)
        .background(Color.white.opacity(0.95))
    }
    
    // MARK: - Actions
    
    private func sendMessage() {
        guard !messageText.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty,
              let roomId = chatRoom.id else { return }
        
        let text = messageText
        messageText = ""
        
        Task {
            do {
                try await chatService.sendMessage(chatRoomId: roomId, text: text)
            } catch {
                print("Error sending message: \(error)")
                
                // Show error to user
                await MainActor.run {
                    if error.localizedDescription.contains("permission") || 
                       error.localizedDescription.contains("PERMISSION_DENIED") {
                        errorMessage = "Failed to send message: Missing or insufficient permissions."
                    } else {
                        errorMessage = "Failed to send message: \(error.localizedDescription)"
                    }
                    showError = true
                }
            }
        }
    }
}

// MARK: - Message Bubble

struct MessageBubble: View {
    let message: ChatMessage
    @State private var currentUserId = Auth.auth().currentUser?.uid
    
    private var isCurrentUser: Bool {
        message.senderId == currentUserId
    }
    
    var body: some View {
        HStack {
            if isCurrentUser {
                Spacer(minLength: 60)
            }
            
            VStack(alignment: isCurrentUser ? .trailing : .leading, spacing: 4) {
                if !isCurrentUser {
                    HStack(spacing: 6) {
                        if let photoURL = message.senderPhotoURL, let url = URL(string: photoURL) {
                            AsyncImage(url: url) { image in
                                image
                                    .resizable()
                                    .scaledToFill()
                            } placeholder: {
                                Image(systemName: "person.circle.fill")
                                    .foregroundColor(.gray)
                            }
                            .frame(width: 20, height: 20)
                            .clipShape(Circle())
                        }
                        
                        Text(message.senderName)
                            .font(.caption)
                            .fontWeight(.semibold)
                            .foregroundColor(.secondary)
                    }
                }
                
                Text(message.text)
                    .padding(12)
                    .background(isCurrentUser ?
                               Color(red: 0.74, green: 0.15, blue: 0.18) :
                               Color.white.opacity(0.9))
                    .foregroundColor(isCurrentUser ? .white : .primary)
                    .cornerRadius(16)
                
                Text(message.timestamp, style: .time)
                    .font(.caption2)
                    .foregroundColor(.gray)
            }
            
            if !isCurrentUser {
                Spacer(minLength: 60)
            }
        }
    }
}

#Preview {
    NavigationView {
        ChatRoomView(chatRoom: ChatRoom(name: "General", createdBy: "user123"))
    }
}

