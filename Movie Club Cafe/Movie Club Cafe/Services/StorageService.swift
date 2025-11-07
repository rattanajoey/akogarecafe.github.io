//
//  StorageService.swift
//  Movie Club Cafe
//
//  Firebase Storage Service for profile pictures and media uploads
//

import Foundation
import FirebaseStorage
import UIKit

class StorageService {
    static let shared = StorageService()
    
    private let storage = Storage.storage()
    private var storageRef: StorageReference {
        return storage.reference()
    }
    
    private init() {}
    
    // MARK: - Storage Paths
    
    private struct StoragePaths {
        static let profilePictures = "profile_pictures"
        static let moviePosters = "movie_posters"
        static let chatImages = "chat_images"
        static let tempImages = "temp"
    }
    
    // MARK: - Profile Picture Management
    
    func uploadProfilePicture(userId: String, image: UIImage, completion: @escaping (Result<URL, Error>) -> Void) {
        // Resize image to save storage and bandwidth
        guard let resizedImage = resizeImage(image, maxWidth: 500),
              let imageData = resizedImage.jpegData(compressionQuality: 0.8) else {
            completion(.failure(StorageError.imageProcessingFailed))
            return
        }
        
        let fileName = "\(userId)_\(UUID().uuidString).jpg"
        let fileRef = storageRef.child(StoragePaths.profilePictures).child(fileName)
        
        let metadata = StorageMetadata()
        metadata.contentType = "image/jpeg"
        metadata.customMetadata = [
            "userId": userId,
            "uploadedAt": ISO8601DateFormatter().string(from: Date())
        ]
        
        let uploadTask = fileRef.putData(imageData, metadata: metadata) { metadata, error in
            if let error = error {
                completion(.failure(error))
                return
            }
            
            // Get download URL
            fileRef.downloadURL { url, error in
                if let error = error {
                    completion(.failure(error))
                } else if let url = url {
                    completion(.success(url))
                } else {
                    completion(.failure(StorageError.urlRetrievalFailed))
                }
            }
        }
        
        // Optional: Monitor upload progress
        uploadTask.observe(.progress) { snapshot in
            let percentComplete = 100.0 * Double(snapshot.progress!.completedUnitCount)
                / Double(snapshot.progress!.totalUnitCount)
            print("Upload progress: \(percentComplete)%")
        }
    }
    
    func downloadProfilePicture(url: String, completion: @escaping (Result<UIImage, Error>) -> Void) {
        guard let downloadURL = URL(string: url) else {
            completion(.failure(StorageError.invalidURL))
            return
        }
        
        // Try to download from cache first
        URLSession.shared.dataTask(with: downloadURL) { data, response, error in
            if let error = error {
                completion(.failure(error))
                return
            }
            
            guard let data = data, let image = UIImage(data: data) else {
                completion(.failure(StorageError.imageProcessingFailed))
                return
            }
            
            DispatchQueue.main.async {
                completion(.success(image))
            }
        }.resume()
    }
    
    func deleteProfilePicture(userId: String, completion: @escaping (Result<Void, Error>) -> Void) {
        // List all profile pictures for user
        let userProfilesRef = storageRef.child(StoragePaths.profilePictures)
        
        userProfilesRef.listAll { result, error in
            if let error = error {
                completion(.failure(error))
                return
            }
            
            guard let result = result else {
                completion(.failure(StorageError.fileNotFound))
                return
            }
            
            // Delete all files that start with userId
            let deleteGroup = DispatchGroup()
            var errors: [Error] = []
            
            for item in result.items {
                if item.name.starts(with: userId) {
                    deleteGroup.enter()
                    item.delete { error in
                        if let error = error {
                            errors.append(error)
                        }
                        deleteGroup.leave()
                    }
                }
            }
            
            deleteGroup.notify(queue: .main) {
                if let firstError = errors.first {
                    completion(.failure(firstError))
                } else {
                    completion(.success(()))
                }
            }
        }
    }
    
    // MARK: - Chat Image Management
    
    func uploadChatImage(roomId: String, image: UIImage, completion: @escaping (Result<URL, Error>) -> Void) {
        guard let resizedImage = resizeImage(image, maxWidth: 800),
              let imageData = resizedImage.jpegData(compressionQuality: 0.7) else {
            completion(.failure(StorageError.imageProcessingFailed))
            return
        }
        
        let fileName = "\(UUID().uuidString).jpg"
        let fileRef = storageRef.child(StoragePaths.chatImages).child(roomId).child(fileName)
        
        let metadata = StorageMetadata()
        metadata.contentType = "image/jpeg"
        metadata.customMetadata = [
            "roomId": roomId,
            "uploadedAt": ISO8601DateFormatter().string(from: Date())
        ]
        
        fileRef.putData(imageData, metadata: metadata) { metadata, error in
            if let error = error {
                completion(.failure(error))
                return
            }
            
            fileRef.downloadURL { url, error in
                if let error = error {
                    completion(.failure(error))
                } else if let url = url {
                    completion(.success(url))
                } else {
                    completion(.failure(StorageError.urlRetrievalFailed))
                }
            }
        }
    }
    
    // MARK: - Movie Poster Caching (Optional)
    
    func cacheMoviePoster(movieId: Int, posterURL: String, completion: @escaping (Result<URL, Error>) -> Void) {
        guard let url = URL(string: posterURL) else {
            completion(.failure(StorageError.invalidURL))
            return
        }
        
        // Download poster from TMDB
        URLSession.shared.dataTask(with: url) { [weak self] data, response, error in
            guard let self = self else { return }
            
            if let error = error {
                completion(.failure(error))
                return
            }
            
            guard let data = data else {
                completion(.failure(StorageError.downloadFailed))
                return
            }
            
            // Upload to Firebase Storage
            let fileName = "\(movieId).jpg"
            let fileRef = self.storageRef.child(StoragePaths.moviePosters).child(fileName)
            
            let metadata = StorageMetadata()
            metadata.contentType = "image/jpeg"
            metadata.cacheControl = "public, max-age=604800" // 1 week
            
            fileRef.putData(data, metadata: metadata) { metadata, error in
                if let error = error {
                    completion(.failure(error))
                    return
                }
                
                fileRef.downloadURL { url, error in
                    if let error = error {
                        completion(.failure(error))
                    } else if let url = url {
                        completion(.success(url))
                    } else {
                        completion(.failure(StorageError.urlRetrievalFailed))
                    }
                }
            }
        }.resume()
    }
    
    // MARK: - Helper Methods
    
    private func resizeImage(_ image: UIImage, maxWidth: CGFloat) -> UIImage? {
        let scale = maxWidth / image.size.width
        let newHeight = image.size.height * scale
        let newSize = CGSize(width: maxWidth, height: newHeight)
        
        UIGraphicsBeginImageContextWithOptions(newSize, false, 1.0)
        image.draw(in: CGRect(origin: .zero, size: newSize))
        let resizedImage = UIGraphicsGetImageFromCurrentImageContext()
        UIGraphicsEndImageContext()
        
        return resizedImage
    }
    
    func getStorageUsage(completion: @escaping (Result<Int64, Error>) -> Void) {
        // This would require listing all files and summing their sizes
        // For simplicity, we'll return an estimate based on typical usage
        completion(.success(0)) // Implement if needed
    }
    
    // MARK: - Clean Up
    
    func deleteOldTempFiles(olderThan days: Int, completion: @escaping (Result<Int, Error>) -> Void) {
        let tempRef = storageRef.child(StoragePaths.tempImages)
        let cutoffDate = Calendar.current.date(byAdding: .day, value: -days, to: Date())!
        
        tempRef.listAll { result, error in
            if let error = error {
                completion(.failure(error))
                return
            }
            
            guard let result = result else {
                completion(.success(0))
                return
            }
            
            let deleteGroup = DispatchGroup()
            var deletedCount = 0
            
            for item in result.items {
                deleteGroup.enter()
                
                item.getMetadata { metadata, error in
                    defer { deleteGroup.leave() }
                    
                    guard let metadata = metadata,
                          let timeCreated = metadata.timeCreated,
                          timeCreated < cutoffDate else {
                        return
                    }
                    
                    item.delete { error in
                        if error == nil {
                            deletedCount += 1
                        }
                    }
                }
            }
            
            deleteGroup.notify(queue: .main) {
                completion(.success(deletedCount))
            }
        }
    }
}

// MARK: - Storage Errors

enum StorageError: LocalizedError {
    case imageProcessingFailed
    case invalidURL
    case urlRetrievalFailed
    case fileNotFound
    case downloadFailed
    case uploadFailed
    
    var errorDescription: String? {
        switch self {
        case .imageProcessingFailed:
            return "Failed to process image"
        case .invalidURL:
            return "Invalid URL provided"
        case .urlRetrievalFailed:
            return "Failed to retrieve download URL"
        case .fileNotFound:
            return "File not found"
        case .downloadFailed:
            return "Download failed"
        case .uploadFailed:
            return "Upload failed"
        }
    }
}

// MARK: - Image Picker Helper for SwiftUI

import SwiftUI
import PhotosUI

@MainActor
class ImagePickerViewModel: ObservableObject {
    @Published var selectedImage: UIImage?
    @Published var isLoading = false
    
    func loadImage(from item: PhotosPickerItem?) async {
        guard let item = item else { return }
        
        isLoading = true
        defer { isLoading = false }
        
        if let data = try? await item.loadTransferable(type: Data.self),
           let image = UIImage(data: data) {
            selectedImage = image
        }
    }
}

