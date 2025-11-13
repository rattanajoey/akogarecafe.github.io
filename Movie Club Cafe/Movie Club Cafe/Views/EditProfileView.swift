//
//  EditProfileView.swift
//  Movie Club Cafe
//
//  Enhanced profile editing with image upload
//

import SwiftUI
import PhotosUI

struct EditProfileView: View {
    @EnvironmentObject var authService: AuthenticationService
    @Environment(\.dismiss) var dismiss
    
    @State private var displayName: String = ""
    @State private var selectedPhoto: PhotosPickerItem?
    @State private var profileImage: UIImage?
    @State private var isUploading = false
    @State private var errorMessage: String?
    @State private var showError = false
    @State private var showSuccess = false
    
    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 24) {
                    // Profile Image Section
                    VStack(spacing: 16) {
                        ZStack(alignment: .bottomTrailing) {
                            // Current or selected image
                            if let profileImage = profileImage {
                                Image(uiImage: profileImage)
                                    .resizable()
                                    .scaledToFill()
                                    .frame(width: 120, height: 120)
                                    .clipShape(Circle())
                                    .overlay(
                                        Circle()
                                            .stroke(AppTheme.accentColor, lineWidth: 3)
                                    )
                            } else if let photoURL = authService.currentUser?.photoURL,
                                      let url = URL(string: photoURL) {
                                AsyncImage(url: url) { phase in
                                    switch phase {
                                    case .success(let image):
                                        image
                                            .resizable()
                                            .scaledToFill()
                                            .frame(width: 120, height: 120)
                                            .clipShape(Circle())
                                            .overlay(
                                                Circle()
                                                    .stroke(AppTheme.accentColor, lineWidth: 3)
                                            )
                                    case .failure(_), .empty:
                                        defaultProfileImage
                                    @unknown default:
                                        defaultProfileImage
                                    }
                                }
                            } else {
                                defaultProfileImage
                            }
                            
                            // Camera button
                            PhotosPicker(selection: $selectedPhoto,
                                       matching: .images) {
                                Image(systemName: "camera.circle.fill")
                                    .font(.system(size: 36))
                                    .foregroundStyle(AppTheme.accentColor, .white)
                                    .background(
                                        Circle()
                                            .fill(.white)
                                            .frame(width: 38, height: 38)
                                    )
                            }
                        }
                        
                        Text("Tap camera to change photo")
                            .font(.system(size: 14))
                            .foregroundColor(.secondary)
                    }
                    .padding(.top, 20)
                    
                    // Display Name Field
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Display Name")
                            .font(.system(size: 16, weight: .semibold, design: .rounded))
                            .foregroundColor(AppTheme.textPrimary)
                        
                        TextField("Enter your name", text: $displayName)
                            .font(.system(size: 16))
                            .padding(16)
                            .background(
                                RoundedRectangle(cornerRadius: 12)
                                    .fill(.ultraThinMaterial)
                            )
                            .overlay(
                                RoundedRectangle(cornerRadius: 12)
                                    .stroke(Color.gray.opacity(0.2), lineWidth: 1)
                            )
                    }
                    .padding(.horizontal, 20)
                    
                    // Email (Read-only)
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Email")
                            .font(.system(size: 16, weight: .semibold, design: .rounded))
                            .foregroundColor(AppTheme.textPrimary)
                        
                        HStack {
                            Text(authService.currentUser?.email ?? "No email")
                                .font(.system(size: 16))
                                .foregroundColor(.secondary)
                            
                            Spacer()
                            
                            Image(systemName: "lock.fill")
                                .font(.system(size: 12))
                                .foregroundColor(.secondary)
                        }
                        .padding(16)
                        .background(
                            RoundedRectangle(cornerRadius: 12)
                                .fill(.ultraThinMaterial)
                        )
                        .overlay(
                            RoundedRectangle(cornerRadius: 12)
                                .stroke(Color.gray.opacity(0.2), lineWidth: 1)
                        )
                    }
                    .padding(.horizontal, 20)
                    
                    // Save Button
                    Button(action: saveProfile) {
                        HStack(spacing: 8) {
                            if isUploading {
                                ProgressView()
                                    .progressViewStyle(CircularProgressViewStyle(tint: .white))
                                Text("Saving...")
                                    .font(.system(size: 16, weight: .semibold))
                            } else {
                                Image(systemName: "checkmark.circle.fill")
                                    .font(.system(size: 16, weight: .semibold))
                                Text("Save Changes")
                                    .font(.system(size: 16, weight: .semibold))
                            }
                        }
                        .foregroundColor(.white)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 14)
                        .background(
                            RoundedRectangle(cornerRadius: 16)
                                .fill(AppTheme.accentColor)
                        )
                    }
                    .disabled(isUploading || displayName.isEmpty)
                    .opacity(isUploading || displayName.isEmpty ? 0.5 : 1.0)
                    .padding(.horizontal, 20)
                    .padding(.top, 8)
                }
                .padding(.bottom, 40)
            }
            .background(AppTheme.backgroundGradient)
            .navigationTitle("Edit Profile")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") {
                        dismiss()
                    }
                    .foregroundColor(AppTheme.accentColor)
                }
            }
            .alert("Error", isPresented: $showError) {
                Button("OK", role: .cancel) { }
            } message: {
                Text(errorMessage ?? "An error occurred")
            }
            .alert("Success", isPresented: $showSuccess) {
                Button("OK", role: .cancel) {
                    dismiss()
                }
            } message: {
                Text("Profile updated successfully!")
            }
            .onChange(of: selectedPhoto) { oldValue, newValue in
                Task {
                    await loadSelectedPhoto()
                }
            }
            .onAppear {
                displayName = authService.currentUser?.displayName ?? ""
            }
        }
    }
    
    private var defaultProfileImage: some View {
        Image(systemName: "person.circle.fill")
            .resizable()
            .frame(width: 120, height: 120)
            .foregroundStyle(AppTheme.accentColor.opacity(0.7))
    }
    
    private func loadSelectedPhoto() async {
        guard let selectedPhoto = selectedPhoto else { return }
        
        do {
            if let data = try await selectedPhoto.loadTransferable(type: Data.self),
               let image = UIImage(data: data) {
                // Resize image to reasonable size
                let resizedImage = resizeImage(image: image, targetSize: CGSize(width: 500, height: 500))
                await MainActor.run {
                    self.profileImage = resizedImage
                }
            }
        } catch {
            await MainActor.run {
                errorMessage = "Failed to load image: \(error.localizedDescription)"
                showError = true
            }
        }
    }
    
    private func resizeImage(image: UIImage, targetSize: CGSize) -> UIImage {
        let size = image.size
        let widthRatio  = targetSize.width  / size.width
        let heightRatio = targetSize.height / size.height
        let ratio = min(widthRatio, heightRatio)
        let newSize = CGSize(width: size.width * ratio, height: size.height * ratio)
        
        let renderer = UIGraphicsImageRenderer(size: newSize)
        return renderer.image { _ in
            image.draw(in: CGRect(origin: .zero, size: newSize))
        }
    }
    
    private func saveProfile() {
        Task {
            isUploading = true
            defer { isUploading = false }
            
            do {
                // Update display name
                try await authService.updateDisplayName(displayName)
                
                // Upload image if selected
                if let profileImage = profileImage {
                    try await authService.uploadProfileImage(profileImage)
                }
                
                await MainActor.run {
                    showSuccess = true
                }
            } catch {
                await MainActor.run {
                    errorMessage = error.localizedDescription
                    showError = true
                }
            }
        }
    }
}

#Preview {
    EditProfileView()
        .environmentObject(AuthenticationService())
}

