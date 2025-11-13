//
//  AnalyticsService.swift
//  Movie Club Cafe
//
//  Firebase Analytics Service for tracking user behavior and engagement
//

import Foundation
import FirebaseAnalytics

class AnalyticsService {
    static let shared = AnalyticsService()
    
    private init() {}
    
    // MARK: - Screen View Tracking
    
    func logScreenView(screenName: String, screenClass: String? = nil) {
        Analytics.logEvent(AnalyticsEventScreenView, parameters: [
            AnalyticsParameterScreenName: screenName,
            AnalyticsParameterScreenClass: screenClass ?? screenName
        ])
    }
    
    // MARK: - Movie Events
    
    func logMovieViewed(movieId: String, movieTitle: String, genre: String, source: String) {
        Analytics.logEvent("movie_viewed", parameters: [
            "movie_id": movieId,
            "movie_title": movieTitle,
            "genre": genre,
            "source": source // "monthly_selection", "genre_pool", "search"
        ])
    }
    
    func logMovieSubmitted(movieId: Int, movieTitle: String, genre: String, nickname: String) {
        Analytics.logEvent("movie_submitted", parameters: [
            "movie_id": movieId,
            "movie_title": movieTitle,
            "genre": genre,
            "nickname": nickname
        ])
    }
    
    func logMovieTrailerOpened(movieId: Int, movieTitle: String, genre: String) {
        Analytics.logEvent("trailer_opened", parameters: [
            "movie_id": movieId,
            "movie_title": movieTitle,
            "genre": genre
        ])
    }
    
    func logMovieShared(movieId: Int, movieTitle: String, shareMethod: String) {
        Analytics.logEvent(AnalyticsEventShare, parameters: [
            "movie_id": movieId,
            "movie_title": movieTitle,
            "share_method": shareMethod // "link", "image"
        ])
    }
    
    // MARK: - Genre Pool Events
    
    func logGenrePoolViewed(genre: String, poolSize: Int) {
        Analytics.logEvent("genre_pool_viewed", parameters: [
            "genre": genre,
            "pool_size": poolSize
        ])
    }
    
    func logGenrePoolSearched(genre: String, query: String) {
        Analytics.logEvent(AnalyticsEventSearch, parameters: [
            "search_term": query,
            "genre": genre,
            "search_type": "genre_pool"
        ])
    }
    
    // MARK: - Watchlist Events
    
    func logMovieAddedToWatchlist(movieId: Int, movieTitle: String) {
        Analytics.logEvent("watchlist_add", parameters: [
            "movie_id": movieId,
            "movie_title": movieTitle
        ])
    }
    
    func logMovieRemovedFromWatchlist(movieId: Int, movieTitle: String) {
        Analytics.logEvent("watchlist_remove", parameters: [
            "movie_id": movieId,
            "movie_title": movieTitle
        ])
    }
    
    func logWatchlistViewed(itemCount: Int) {
        Analytics.logEvent("watchlist_viewed", parameters: [
            "item_count": itemCount
        ])
    }
    
    // MARK: - Chat Events
    
    func logChatMessageSent(roomId: String, messageLength: Int) {
        Analytics.logEvent("chat_message_sent", parameters: [
            "room_id": roomId,
            "message_length": messageLength
        ])
    }
    
    func logChatRoomOpened(roomId: String, roomName: String) {
        Analytics.logEvent("chat_room_opened", parameters: [
            "room_id": roomId,
            "room_name": roomName
        ])
    }
    
    // MARK: - User Events
    
    func logUserSignIn(method: String) {
        Analytics.logEvent(AnalyticsEventLogin, parameters: [
            AnalyticsParameterMethod: method // "google", "apple", "anonymous"
        ])
    }
    
    func logUserSignOut() {
        Analytics.logEvent("sign_out", parameters: [:])
    }
    
    func logUserProfileViewed() {
        Analytics.logEvent("profile_viewed", parameters: [:])
    }
    
    func logNicknameChanged(newNickname: String) {
        Analytics.logEvent("nickname_changed", parameters: [
            "nickname_length": newNickname.count
        ])
    }
    
    func logProfilePictureUploaded() {
        Analytics.logEvent("profile_picture_uploaded", parameters: [:])
    }
    
    // MARK: - Admin Events
    
    func logAdminActionPerformed(action: String, details: [String: Any] = [:]) {
        var parameters = details
        parameters["action"] = action
        Analytics.logEvent("admin_action", parameters: parameters)
    }
    
    func logMonthlySelectionUpdated(monthId: String, genre: String) {
        Analytics.logEvent("monthly_selection_updated", parameters: [
            "month_id": monthId,
            "genre": genre
        ])
    }
    
    // MARK: - Calendar Events
    
    func logCalendarEventCreated(movieTitle: String) {
        Analytics.logEvent("calendar_event_created", parameters: [
            "movie_title": movieTitle
        ])
    }
    
    func logCalendarViewed() {
        Analytics.logEvent("calendar_viewed", parameters: [:])
    }
    
    // MARK: - Engagement Events
    
    func logMonthChanged(monthId: String) {
        Analytics.logEvent("month_changed", parameters: [
            "month_id": monthId
        ])
    }
    
    func logFilterApplied(filterType: String, filterValue: String) {
        Analytics.logEvent("filter_applied", parameters: [
            "filter_type": filterType,
            "filter_value": filterValue
        ])
    }
    
    func logFeatureUsed(featureName: String) {
        Analytics.logEvent("feature_used", parameters: [
            "feature_name": featureName
        ])
    }
    
    // MARK: - Error Tracking
    
    func logError(errorName: String, errorMessage: String, context: String) {
        Analytics.logEvent("app_error", parameters: [
            "error_name": errorName,
            "error_message": errorMessage,
            "context": context
        ])
    }
    
    // MARK: - Performance Events
    
    func logAPICall(endpoint: String, duration: TimeInterval, success: Bool) {
        Analytics.logEvent("api_call", parameters: [
            "endpoint": endpoint,
            "duration_ms": Int(duration * 1000),
            "success": success
        ])
    }
    
    // MARK: - User Properties
    
    func setUserProperty(name: String, value: String?) {
        Analytics.setUserProperty(value, forName: name)
    }
    
    func setUserId(_ userId: String?) {
        Analytics.setUserID(userId)
    }
}

// MARK: - Analytics Event Names (for consistency)

extension AnalyticsService {
    struct EventNames {
        static let movieViewed = "movie_viewed"
        static let movieSubmitted = "movie_submitted"
        static let trailerOpened = "trailer_opened"
        static let genrePoolViewed = "genre_pool_viewed"
        static let chatMessageSent = "chat_message_sent"
        static let watchlistAdd = "watchlist_add"
        static let watchlistRemove = "watchlist_remove"
        static let adminAction = "admin_action"
        static let calendarEventCreated = "calendar_event_created"
    }
    
    struct UserProperties {
        static let nickname = "nickname"
        static let isAdmin = "is_admin"
        static let totalMoviesSubmitted = "total_movies_submitted"
        static let favGenre = "favorite_genre"
    }
}

