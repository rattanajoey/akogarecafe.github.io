//
//  FirestoreCacheService.swift
//  Movie Club Cafe
//
//  Created by Kavy Rattana on 11/7/25.
//

import Foundation
import FirebaseFirestore

/// Provides cache-first Firestore operations to minimize reads and improve offline experience
class FirestoreCacheService {
    static let shared = FirestoreCacheService()
    
    private let db: Firestore
    private let cacheExpirationMinutes: Double = 5 // How long to use cache before checking server
    
    // Track when we last fetched data
    private var lastFetchTimes: [String: Date] = [:]
    private let fetchTimeQueue = DispatchQueue(label: "com.akogarecafe.firestorecache")
    
    private init() {
        self.db = FirebaseConfig.shared.db
        print("✅ FirestoreCacheService initialized with cache-first strategy")
    }
    
    // MARK: - Cache-First Document Fetching
    
    /// Fetches a document with cache-first strategy
    /// - If cached data is recent enough, use cache only
    /// - Otherwise, fetch from server and update cache
    func getDocument<T: Decodable>(
        collection: String,
        documentId: String,
        as type: T.Type,
        cacheFirst: Bool = true,
        maxCacheAge: TimeInterval? = nil
    ) async throws -> T? {
        let cacheKey = "\(collection)/\(documentId)"
        let maxAge = maxCacheAge ?? (cacheExpirationMinutes * 60)
        
        // Check if we should try cache first
        if cacheFirst && isCacheStillFresh(for: cacheKey, maxAge: maxAge) {
            // Try cache only first
            do {
                let document = try await db.collection(collection).document(documentId)
                    .getDocument(source: .cache)
                
                if document.exists {
                    print("📦 Cache hit: \(cacheKey)")
                    return try document.data(as: T.self)
                }
            } catch {
                print("⚠️ Cache miss or expired: \(cacheKey), fetching from server")
            }
        }
        
        // Fetch from server (will also update cache)
        print("🌐 Server fetch: \(cacheKey)")
        let document = try await db.collection(collection).document(documentId)
            .getDocument(source: .server)
        
        updateLastFetchTime(for: cacheKey)
        
        if document.exists {
            return try document.data(as: T.self)
        }
        
        return nil
    }
    
    /// Fetches a document, trying cache first then falling back to server
    func getDocumentOptimistic<T: Decodable>(
        collection: String,
        documentId: String,
        as type: T.Type
    ) async throws -> T? {
        let cacheKey = "\(collection)/\(documentId)"
        
        // Always try cache first
        do {
            let cachedDoc = try await db.collection(collection).document(documentId)
                .getDocument(source: .cache)
            
            if cachedDoc.exists {
                print("📦 Optimistic cache hit: \(cacheKey)")
                
                // Silently update in background (fire and forget)
                Task {
                    try? await db.collection(collection).document(documentId)
                        .getDocument(source: .server)
                    updateLastFetchTime(for: cacheKey)
                }
                
                return try cachedDoc.data(as: T.self)
            }
        } catch {
            // Cache miss, fall through to server
        }
        
        // No cache, fetch from server
        print("🌐 Optimistic server fetch: \(cacheKey)")
        let document = try await db.collection(collection).document(documentId)
            .getDocument(source: .server)
        
        updateLastFetchTime(for: cacheKey)
        
        if document.exists {
            return try document.data(as: T.self)
        }
        
        return nil
    }
    
    // MARK: - Batch Fetching with Cache
    
    /// Fetches multiple documents efficiently using cache when possible
    func batchGetDocuments<T: Decodable>(
        collection: String,
        documentIds: [String],
        as type: T.Type,
        cacheFirst: Bool = true
    ) async throws -> [String: T] {
        var results: [String: T] = [:]
        
        // Try to fetch all from cache first if requested
        if cacheFirst {
            for docId in documentIds {
                if let cached: T = try? await getDocument(
                    collection: collection,
                    documentId: docId,
                    as: type,
                    cacheFirst: true
                ) {
                    results[docId] = cached
                }
            }
        }
        
        // If we got everything from cache, return early
        if results.count == documentIds.count {
            print("📦 Batch cache hit: \(collection) (\(documentIds.count) docs)")
            return results
        }
        
        // Fetch missing docs from server
        let missingIds = documentIds.filter { results[$0] == nil }
        print("🌐 Batch server fetch: \(collection) (\(missingIds.count)/\(documentIds.count) docs)")
        
        for docId in missingIds {
            if let doc: T = try? await getDocument(
                collection: collection,
                documentId: docId,
                as: type,
                cacheFirst: false
            ) {
                results[docId] = doc
            }
        }
        
        return results
    }
    
    // MARK: - Prefetching for Offline
    
    /// Prefetch common data on app launch to ensure offline availability
    func prefetchEssentialData() async {
        print("🔄 Prefetching essential data for offline access...")
        
        async let currentMonth = prefetchCurrentMonthSelections()
        async let genrePools = prefetchGenrePools()
        
        await currentMonth
        await genrePools
        
        print("✅ Essential data prefetched")
    }
    
    private func prefetchCurrentMonthSelections() async {
        let currentMonth = getCurrentMonth()
        _ = try? await getDocument(
            collection: "MonthlySelections",
            documentId: currentMonth,
            as: MonthlySelections.self,
            cacheFirst: false // Force server to ensure fresh cache
        )
    }
    
    private func prefetchGenrePools() async {
        _ = try? await getDocument(
            collection: "GenrePools",
            documentId: "current",
            as: GenrePools.self,
            cacheFirst: false // Force server to ensure fresh cache
        )
    }
    
    /// Prefetch last 3 months of movie selections for offline browsing
    func prefetchRecentMonths() async {
        print("🔄 Prefetching recent months...")
        
        let months = getRecentMonths(count: 3)
        
        for month in months {
            _ = try? await getDocument(
                collection: "MonthlySelections",
                documentId: month,
                as: MonthlySelections.self,
                cacheFirst: false
            )
        }
        
        print("✅ Recent months prefetched")
    }
    
    // MARK: - Cache Management
    
    private func isCacheStillFresh(for key: String, maxAge: TimeInterval) -> Bool {
        fetchTimeQueue.sync {
            if let lastFetch = lastFetchTimes[key] {
                return Date().timeIntervalSince(lastFetch) < maxAge
            }
            return false
        }
    }
    
    private func updateLastFetchTime(for key: String) {
        fetchTimeQueue.async { [weak self] in
            self?.lastFetchTimes[key] = Date()
        }
    }
    
    /// Clear cached timestamps (forces fresh fetches)
    func invalidateCache() {
        fetchTimeQueue.async { [weak self] in
            self?.lastFetchTimes.removeAll()
        }
        print("🗑️ Cache timestamps invalidated")
    }
    
    /// Clear specific collection cache
    func invalidateCollection(_ collection: String) {
        fetchTimeQueue.async { [weak self] in
            self?.lastFetchTimes = self?.lastFetchTimes.filter { !$0.key.hasPrefix(collection) } ?? [:]
        }
        print("🗑️ Cache invalidated for collection: \(collection)")
    }
    
    // MARK: - Offline Detection
    
    /// Check if we're currently offline
    func isOffline() async -> Bool {
        do {
            // Try a lightweight server request
            _ = try await db.collection("_healthCheck").document("test")
                .getDocument(source: .server)
            return false
        } catch {
            return true
        }
    }
    
    // MARK: - Helper Methods
    
    private func getCurrentMonth() -> String {
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM"
        return formatter.string(from: Date())
    }
    
    private func getRecentMonths(count: Int) -> [String] {
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM"
        
        var months: [String] = []
        let calendar = Calendar.current
        
        for i in 0..<count {
            if let date = calendar.date(byAdding: .month, value: -i, to: Date()) {
                months.append(formatter.string(from: date))
            }
        }
        
        return months
    }
}

// MARK: - Convenience Extensions

extension FirestoreCacheService {
    /// Get monthly selections with optimal caching
    func getMonthlySelections(for month: String) async throws -> MonthlySelections? {
        return try await getDocumentOptimistic(
            collection: "MonthlySelections",
            documentId: month,
            as: MonthlySelections.self
        )
    }
    
    /// Get genre pools with optimal caching
    func getGenrePools() async throws -> GenrePools? {
        return try await getDocumentOptimistic(
            collection: "GenrePools",
            documentId: "current",
            as: GenrePools.self
        )
    }
    
    /// Get user data with caching
    func getUserData(userId: String) async throws -> AppUser? {
        return try await getDocument(
            collection: "users",
            documentId: userId,
            as: AppUser.self,
            cacheFirst: true,
            maxCacheAge: 300 // 5 minutes cache for user data
        )
    }
}

// Helper function (already exists elsewhere, but included for completeness)
private func getCurrentMonth() -> String {
    let formatter = DateFormatter()
    formatter.dateFormat = "yyyy-MM"
    return formatter.string(from: Date())
}

