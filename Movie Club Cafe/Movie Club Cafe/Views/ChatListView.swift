//
//  ChatListView.swift
//  Movie Club Cafe
//
//  List of available chat rooms
//

import SwiftUI
import FirebaseAuth

struct ChatListView: View {
    @StateObject private var chatService = ChatService()
    @State private var showingNewChatRoom = false
    @State private var newRoomName = ""
    @State private var newRoomDescription = ""
    @State private var isCreating = false
    @State private var showError = false
    @State private var errorMessage = ""
    
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
                    ProgressView()
                        .scaleEffect(1.5)
                } else if chatService.chatRooms.isEmpty {
                    emptyStateView
                } else {
                    chatRoomsList
                }
            }
            .navigationTitle("Chat Rooms")
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button(action: { showingNewChatRoom = true }) {
                        Image(systemName: "plus.circle.fill")
                            .foregroundColor(Color(red: 0.74, green: 0.15, blue: 0.18))
                    }
                }
            }
            .sheet(isPresented: $showingNewChatRoom) {
                newChatRoomSheet
            }
            .alert("Error", isPresented: $showError) {
                Button("OK") { }
            } message: {
                Text(errorMessage)
            }
            .onAppear {
                print("🎬 ChatListView: Appeared, starting listeners")
                
                // Debug: Check authentication
                if let user = Auth.auth().currentUser {
                    print("✅ User authenticated: \(user.uid)")
                    print("   Email: \(user.email ?? "none")")
                    print("   Display Name: \(user.displayName ?? "none")")
                } else {
                    print("❌ User NOT authenticated!")
                }
                
                chatService.listenToChatRooms()
                chatService.listenToUnreadCount()
            }
            .onDisappear {
                print("👋 ChatListView: Disappeared, stopping listeners")
                chatService.stopListening()
            }
        }
    }
    
    // MARK: - Chat Rooms List
    
    private var chatRoomsList: some View {
        ScrollView {
            LazyVStack(spacing: 12) {
                ForEach(chatService.chatRooms) { room in
                    NavigationLink(destination: ChatRoomView(chatRoom: room)) {
                        ChatRoomCard(room: room)
                    }
                }
            }
            .padding()
        }
    }
    
    // MARK: - Empty State
    
    private var emptyStateView: some View {
        VStack(spacing: 20) {
            Image(systemName: "bubble.left.and.bubble.right")
                .font(.system(size: 60))
                .foregroundColor(.gray.opacity(0.5))
            
            Text("No Chat Rooms Yet")
                .font(.title2)
                .fontWeight(.bold)
            
            Text("Create a new chat room to start conversations")
                .font(.body)
                .foregroundColor(.gray)
                .multilineTextAlignment(.center)
                .padding(.horizontal)
            
            Button(action: { showingNewChatRoom = true }) {
                Label("Create Chat Room", systemImage: "plus.circle.fill")
                    .font(.headline)
                    .foregroundColor(.white)
                    .padding()
                    .background(Color(red: 0.74, green: 0.15, blue: 0.18))
                    .cornerRadius(12)
            }
        }
        .padding()
    }
    
    // MARK: - New Chat Room Sheet
    
    private var newChatRoomSheet: some View {
        NavigationView {
            Form {
                Section(header: Text("Chat Room Details")) {
                    TextField("Room Name", text: $newRoomName)
                        .autocapitalization(.words)
                    TextField("Description (optional)", text: $newRoomDescription)
                        .autocapitalization(.sentences)
                }
                
                if isCreating {
                    Section {
                        HStack {
                            Spacer()
                            ProgressView()
                                .progressViewStyle(CircularProgressViewStyle())
                            Text("Creating room...")
                                .font(.subheadline)
                                .foregroundColor(.secondary)
                                .padding(.leading, 8)
                            Spacer()
                        }
                    }
                }
            }
            .navigationTitle("New Chat Room")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") {
                        showingNewChatRoom = false
                        resetForm()
                    }
                    .disabled(isCreating)
                }
                
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Create") {
                        createChatRoom()
                    }
                    .disabled(newRoomName.isEmpty || isCreating)
                }
            }
        }
    }
    
    // MARK: - Actions
    
    private func createChatRoom() {
        isCreating = true
        
        Task {
            do {
                print("🚀 ChatListView: Creating chat room '\(newRoomName)'")
                let roomId = try await chatService.createChatRoom(
                    name: newRoomName,
                    description: newRoomDescription.isEmpty ? nil : newRoomDescription
                )
                
                await MainActor.run {
                    print("✅ ChatListView: Chat room created successfully with ID: \(roomId)")
                    isCreating = false
                    showingNewChatRoom = false
                    resetForm()
                }
            } catch {
                await MainActor.run {
                    print("❌ ChatListView: Error creating chat room: \(error.localizedDescription)")
                    isCreating = false
                    errorMessage = "Failed to create chat room: \(error.localizedDescription)"
                    showError = true
                }
            }
        }
    }
    
    private func resetForm() {
        newRoomName = ""
        newRoomDescription = ""
    }
}

// MARK: - Chat Room Card

struct ChatRoomCard: View {
    let room: ChatRoom
    
    var body: some View {
        HStack(spacing: 15) {
            // Room Icon
            ZStack {
                Circle()
                    .fill(Color(red: 0.74, green: 0.15, blue: 0.18).opacity(0.2))
                    .frame(width: 50, height: 50)
                
                Image(systemName: "bubble.left.and.bubble.right.fill")
                    .foregroundColor(Color(red: 0.74, green: 0.15, blue: 0.18))
                    .font(.title3)
            }
            
            VStack(alignment: .leading, spacing: 4) {
                Text(room.name)
                    .font(.headline)
                    .foregroundColor(.primary)
                
                if let lastMessage = room.lastMessage {
                    Text(lastMessage)
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                        .lineLimit(1)
                } else {
                    Text(room.description ?? "No messages yet")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                        .lineLimit(1)
                }
                
                if let lastMessageTimestamp = room.lastMessageTimestamp {
                    Text(lastMessageTimestamp, style: .relative)
                        .font(.caption)
                        .foregroundColor(.gray)
                }
            }
            
            Spacer()
            
            Image(systemName: "chevron.right")
                .foregroundColor(.gray)
                .font(.caption)
        }
        .padding()
        .background(Color.white.opacity(0.9))
        .cornerRadius(12)
        .shadow(color: Color.black.opacity(0.1), radius: 4, x: 0, y: 2)
    }
}

#Preview {
    ChatListView()
}

