//
//  DeepLinkService.swift
//  Movie Club Cafe
//
//  Created for deep linking support
//

import Foundation
import SwiftUI
import Combine

enum DeepLinkDestination: Equatable {
    case movieDetail(monthId: String, genre: String, movieTitle: String, tmdbId: Int?)
    case monthlySelection(monthId: String)
    case genrePool(genre: String)
    case home
}

class DeepLinkService: ObservableObject {
    static let shared = DeepLinkService()
    
    @Published var activeLink: DeepLinkDestination?
    
    // URL Scheme: movieclubcafe://
    // Universal Link: https://akogarecafe.com/movie-club/
    
    private init() {}
    
    /// Generate a shareable deep link for a movie
    /// - Parameters:
    ///   - movieTitle: The title of the movie
    ///   - monthId: The month ID (e.g., "2025-11")
    ///   - genre: The genre (action, drama, comedy, thriller)
    ///   - tmdbId: Optional TMDB ID for direct lookup
    /// - Returns: A URL that can be shared
    func generateMovieShareURL(movieTitle: String, monthId: String, genre: String, tmdbId: Int? = nil) -> URL? {
        var components = URLComponents()
        components.scheme = "https"
        components.host = "akogarecafe.com"
        components.path = "/movie-club/movie"
        
        var queryItems: [URLQueryItem] = [
            URLQueryItem(name: "title", value: movieTitle),
            URLQueryItem(name: "month", value: monthId),
            URLQueryItem(name: "genre", value: genre)
        ]
        
        if let tmdbId = tmdbId {
            queryItems.append(URLQueryItem(name: "tmdbId", value: String(tmdbId)))
        }
        
        components.queryItems = queryItems
        
        return components.url
    }
    
    /// Generate a URL scheme-based deep link (for fallback)
    func generateMovieSchemeURL(movieTitle: String, monthId: String, genre: String, tmdbId: Int? = nil) -> URL? {
        var components = URLComponents()
        components.scheme = "movieclubcafe"
        components.host = "movie"
        
        var queryItems: [URLQueryItem] = [
            URLQueryItem(name: "title", value: movieTitle),
            URLQueryItem(name: "month", value: monthId),
            URLQueryItem(name: "genre", value: genre)
        ]
        
        if let tmdbId = tmdbId {
            queryItems.append(URLQueryItem(name: "tmdbId", value: String(tmdbId)))
        }
        
        components.queryItems = queryItems
        
        return components.url
    }
    
    /// Parse an incoming deep link URL
    func handleURL(_ url: URL) -> Bool {
        // Handle both universal links and URL schemes
        if url.scheme == "movieclubcafe" {
            return handleSchemeURL(url)
        } else if url.host == "akogarecafe.com" {
            return handleUniversalLink(url)
        }
        return false
    }
    
    private func handleSchemeURL(_ url: URL) -> Bool {
        guard let components = URLComponents(url: url, resolvingAgainstBaseURL: false) else {
            return false
        }
        
        let host = url.host
        
        switch host {
        case "movie":
            return handleMovieLink(from: components)
        case "month":
            if let monthId = components.queryItems?.first(where: { $0.name == "id" })?.value {
                DispatchQueue.main.async {
                    self.activeLink = .monthlySelection(monthId: monthId)
                }
                return true
            }
        case "pool":
            if let genre = components.queryItems?.first(where: { $0.name == "genre" })?.value {
                DispatchQueue.main.async {
                    self.activeLink = .genrePool(genre: genre)
                }
                return true
            }
        default:
            break
        }
        
        return false
    }
    
    private func handleUniversalLink(_ url: URL) -> Bool {
        guard let components = URLComponents(url: url, resolvingAgainstBaseURL: false) else {
            return false
        }
        
        let path = url.path
        
        if path.contains("/movie-club/movie") {
            return handleMovieLink(from: components)
        } else if path.contains("/movie-club/month") {
            if let monthId = components.queryItems?.first(where: { $0.name == "id" })?.value {
                DispatchQueue.main.async {
                    self.activeLink = .monthlySelection(monthId: monthId)
                }
                return true
            }
        }
        
        return false
    }
    
    private func handleMovieLink(from components: URLComponents) -> Bool {
        guard let queryItems = components.queryItems else { return false }
        
        let title = queryItems.first(where: { $0.name == "title" })?.value
        let monthId = queryItems.first(where: { $0.name == "month" })?.value
        let genre = queryItems.first(where: { $0.name == "genre" })?.value
        let tmdbIdString = queryItems.first(where: { $0.name == "tmdbId" })?.value
        let tmdbId = tmdbIdString != nil ? Int(tmdbIdString!) : nil
        
        if let title = title, let monthId = monthId, let genre = genre {
            DispatchQueue.main.async {
                self.activeLink = .movieDetail(
                    monthId: monthId,
                    genre: genre,
                    movieTitle: title,
                    tmdbId: tmdbId
                )
            }
            return true
        }
        
        return false
    }
    
    /// Create a share sheet with movie details (using universal links)
    func createShareSheet(movieTitle: String, monthId: String, genre: String, tmdbId: Int? = nil, message: String? = nil) -> UIActivityViewController? {
        guard let url = generateMovieShareURL(movieTitle: movieTitle, monthId: monthId, genre: genre, tmdbId: tmdbId) else {
            return nil
        }
        
        var itemsToShare: [Any] = []
        
        // Add custom message
        let shareMessage = message ?? "Check out \"\(movieTitle)\" on Movie Club Cafe! 🎬"
        itemsToShare.append(shareMessage)
        itemsToShare.append(url)
        
        let activityVC = UIActivityViewController(activityItems: itemsToShare, applicationActivities: nil)
        
        // Exclude some activities if desired
        activityVC.excludedActivityTypes = [
            .addToReadingList,
            .assignToContact,
            .saveToCameraRoll
        ]
        
        return activityVC
    }
    
    /// Clear the active deep link
    func clearActiveLink() {
        activeLink = nil
    }
}

// MARK: - SwiftUI Helper View Modifier

extension View {
    func handleDeepLinks() -> some View {
        self.modifier(DeepLinkHandlerModifier())
    }
}

struct DeepLinkHandlerModifier: ViewModifier {
    @ObservedObject var deepLinkService = DeepLinkService.shared
    
    func body(content: Content) -> some View {
        content
            .onOpenURL { url in
                _ = deepLinkService.handleURL(url)
            }
    }
}

// MARK: - Share Button Helper View

struct ShareButton: View {
    let movieTitle: String
    let monthId: String
    let genre: String
    let tmdbId: Int?
    let style: ShareButtonStyle
    
    @State private var showShareSheet = false
    
    enum ShareButtonStyle {
        case icon
        case iconWithText
        case textOnly
    }
    
    init(movieTitle: String, monthId: String, genre: String, tmdbId: Int? = nil, style: ShareButtonStyle = .icon) {
        self.movieTitle = movieTitle
        self.monthId = monthId
        self.genre = genre
        self.tmdbId = tmdbId
        self.style = style
    }
    
    var body: some View {
        Button(action: {
            showShareSheet = true
        }) {
            switch style {
            case .icon:
                Image(systemName: "square.and.arrow.up")
                    .font(.system(size: 20, weight: .medium))
            case .iconWithText:
                HStack(spacing: 8) {
                    Image(systemName: "square.and.arrow.up")
                        .font(.system(size: 16, weight: .medium))
                    Text("Share")
                        .font(.system(size: 15, weight: .semibold))
                }
            case .textOnly:
                Text("Share Movie")
                    .font(.system(size: 17, weight: .semibold))
            }
        }
        .sheet(isPresented: $showShareSheet) {
            if let activityVC = DeepLinkService.shared.createShareSheet(
                movieTitle: movieTitle,
                monthId: monthId,
                genre: genre,
                tmdbId: tmdbId
            ) {
                ActivityViewController(activityViewController: activityVC)
            }
        }
    }
}

// MARK: - UIActivityViewController Wrapper

struct ActivityViewController: UIViewControllerRepresentable {
    let activityViewController: UIActivityViewController
    
    func makeUIViewController(context: Context) -> UIActivityViewController {
        return activityViewController
    }
    
    func updateUIViewController(_ uiViewController: UIActivityViewController, context: Context) {
        // No update needed
    }
}

