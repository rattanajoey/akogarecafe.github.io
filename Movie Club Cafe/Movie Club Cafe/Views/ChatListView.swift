//
//  ChatListView.swift
//  Movie Club Cafe
//
//  List of available chat rooms
//

import SwiftUI

struct ChatListView: View {
    @StateObject private var chatService = ChatService()
    @State private var showingNewChatRoom = false
    @State private var newRoomName = ""
    @State private var newRoomDescription = ""
    
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
            .onAppear {
                chatService.listenToChatRooms()
                chatService.listenToUnreadCount()
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
                    TextField("Description (optional)", text: $newRoomDescription)
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
                }
                
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Create") {
                        createChatRoom()
                    }
                    .disabled(newRoomName.isEmpty)
                }
            }
        }
    }
    
    // MARK: - Actions
    
    private func createChatRoom() {
        Task {
            do {
                _ = try await chatService.createChatRoom(
                    name: newRoomName,
                    description: newRoomDescription.isEmpty ? nil : newRoomDescription
                )
                showingNewChatRoom = false
                resetForm()
            } catch {
                print("Error creating chat room: \(error)")
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

