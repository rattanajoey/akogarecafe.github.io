//
//  MainChatView.swift
//  Movie Club Cafe
//
//  Single central chat room for all users
//

import SwiftUI
import FirebaseAuth

struct MainChatView: View {
    @StateObject private var chatService = ChatService()
    @State private var messageText = ""
    @FocusState private var isInputFocused: Bool
    @State private var showError = false
    @State private var errorMessage = ""
    @State private var showOnlineUsers = false
    
    var body: some View {
        NavigationView {
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
                
                if chatService.isLoading {
                    VStack(spacing: 20) {
                        ProgressView()
                            .scaleEffect(1.5)
                        Text("Loading chat...")
                            .font(.headline)
                            .foregroundColor(.secondary)
                    }
                } else {
                    VStack(spacing: 0) {
                        // Messages List
                        ScrollViewReader { proxy in
                            ScrollView {
                                LazyVStack(spacing: 12) {
                                    // Welcome message
                                    if chatService.messages.isEmpty {
                                        VStack(spacing: 12) {
                                            Image(systemName: "bubble.left.and.bubble.right.fill")
                                                .font(.system(size: 50))
                                                .foregroundColor(Color(red: 0.74, green: 0.15, blue: 0.18))
                                                .padding(.top, 40)
                                            
                                            Text("Welcome to Movie Club Chat!")
                                                .font(.title2)
                                                .fontWeight(.bold)
                                            
                                            Text("Start a conversation with fellow movie lovers")
                                                .font(.body)
                                                .foregroundColor(.secondary)
                                                .multilineTextAlignment(.center)
                                                .padding(.horizontal)
                                        }
                                        .frame(maxWidth: .infinity)
                                        .padding()
                                    }
                                    
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
            }
            .navigationTitle("Movie Club Chat")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button(action: { showOnlineUsers = true }) {
                        HStack(spacing: 6) {
                            ZStack {
                                Image(systemName: "person.2.fill")
                                    .font(.body)
                                
                                // Green dot indicator
                                if chatService.onlineUsers.count > 0 {
                                    Circle()
                                        .fill(Color.green)
                                        .frame(width: 8, height: 8)
                                        .offset(x: 10, y: -8)
                                }
                            }
                            
                            Text("\(chatService.onlineUsers.count)")
                                .font(.subheadline)
                                .fontWeight(.semibold)
                        }
                        .foregroundColor(Color(red: 0.74, green: 0.15, blue: 0.18))
                        .padding(.horizontal, 12)
                        .padding(.vertical, 6)
                        .background(Color(red: 0.74, green: 0.15, blue: 0.18).opacity(0.1))
                        .cornerRadius(20)
                    }
                }
            }
            .sheet(isPresented: $showOnlineUsers) {
                OnlineUsersView(chatService: chatService)
            }
            .alert("Error", isPresented: $showError) {
                Button("OK") { }
            } message: {
                Text(errorMessage)
            }
            .onAppear {
                setupChat()
            }
            .onDisappear {
                // Mark user as offline when leaving chat
                Task {
                    await chatService.markUserOffline()
                }
                chatService.stopListening()
            }
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
    
    private func setupChat() {
        print("🎬 MainChatView: Setting up chat")
        
        // Debug: Check authentication
        if let user = Auth.auth().currentUser {
            print("✅ User authenticated: \(user.uid)")
            print("   Email: \(user.email ?? "none")")
            print("   Display Name: \(user.displayName ?? "none")")
        } else {
            print("❌ User NOT authenticated!")
            errorMessage = "You must be signed in to use chat"
            showError = true
            return
        }
        
        // Ensure main chat room exists, then start listening
        Task {
            do {
                try await chatService.ensureMainChatRoomExists()
                
                // Mark user as online
                try await chatService.markUserOnline()
                
                // Start listeners
                chatService.listenToMessages(chatRoomId: ChatService.mainChatRoomId)
                chatService.listenToOnlineUsers()
            } catch {
                await MainActor.run {
                    print("❌ Error setting up chat: \(error.localizedDescription)")
                    
                    // Provide more helpful error message for permissions issue
                    if error.localizedDescription.contains("permission") || 
                       error.localizedDescription.contains("PERMISSION_DENIED") {
                        errorMessage = "Failed to load chat: Missing or insufficient permissions.\n\nPlease ensure Firebase Security Rules are deployed. See DEPLOY_FIREBASE_RULES.md for instructions."
                    } else {
                        errorMessage = "Failed to load chat: \(error.localizedDescription)"
                    }
                    
                    showError = true
                }
            }
        }
    }
    
    private func sendMessage() {
        guard !messageText.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty else { return }
        
        let text = messageText
        messageText = ""
        
        Task {
            do {
                try await chatService.sendMessage(
                    chatRoomId: ChatService.mainChatRoomId,
                    text: text
                )
            } catch {
                await MainActor.run {
                    print("❌ Error sending message: \(error.localizedDescription)")
                    // Restore the message text if send failed
                    messageText = text
                    errorMessage = "Failed to send message: \(error.localizedDescription)"
                    showError = true
                }
            }
        }
    }
}

// MARK: - Array Extension for Unique Elements

extension Array where Element: Hashable {
    func unique() -> [Element] {
        var seen = Set<Element>()
        return filter { seen.insert($0).inserted }
    }
}

#Preview {
    MainChatView()
}

