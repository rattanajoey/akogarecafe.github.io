//
//  GoogleCalendarService.swift
//  Movie Club Cafe
//
//  Created by Kavy Rattana on 10/5/25.
//

import Foundation

// Calendar Event structures
struct CalendarEvent: Codable {
    let id: String
    let summary: String
    let description: String?
    let location: String?
    let start: EventDateTime
    let end: EventDateTime
    
    struct EventDateTime: Codable {
        let dateTime: String?
        let date: String?
        let timeZone: String?
    }
}

struct CalendarEventsResponse: Codable {
    let items: [CalendarEvent]?
}

class GoogleCalendarService {
    static let shared = GoogleCalendarService()
    
    // Extract calendar ID from the provided embed URL
    // URL: https://calendar.google.com/calendar/u/0/embed?src=264fe0133d1987fb2521b72fb86677f8a45c9a6604b7fc51b44ddf72a907ebdf@group.calendar.google.com
    private let calendarId = "264fe0133d1987fb2521b72fb86677f8a45c9a6604b7fc51b44ddf72a907ebdf@group.calendar.google.com"
    
    // Google Calendar API Key
    private var apiKey: String {
        // Check if API key is set in environment or config (for flexibility)
        if let key = ProcessInfo.processInfo.environment["GOOGLE_CALENDAR_API_KEY"] {
            return key
        }
        // API key for Movie Club Cafe calendar
        return "AIzaSyBnt8ySVEMgsZWnVrK2qeyv4M4VT1RhUfw"
    }
    
    private init() {}
    
    /// Fetches events from the Google Calendar
    /// - Parameters:
    ///   - timeMin: Minimum time for events (default: start of current month)
    ///   - timeMax: Maximum time for events (default: 6 months from now)
    /// - Returns: Array of calendar events
    func fetchCalendarEvents(timeMin: Date? = nil, timeMax: Date? = nil) async throws -> [CalendarEvent] {
        let baseURL = "https://www.googleapis.com/calendar/v3/calendars/\(calendarId)/events"
        
        var components = URLComponents(string: baseURL)!
        
        let formatter = ISO8601DateFormatter()
        let minTime = timeMin ?? Calendar.current.startOfMonth() ?? Date()
        let maxTime = timeMax ?? Calendar.current.date(byAdding: .month, value: 6, to: Date()) ?? Date()
        
        components.queryItems = [
            URLQueryItem(name: "key", value: apiKey),
            URLQueryItem(name: "timeMin", value: formatter.string(from: minTime)),
            URLQueryItem(name: "timeMax", value: formatter.string(from: maxTime)),
            URLQueryItem(name: "singleEvents", value: "true"),
            URLQueryItem(name: "orderBy", value: "startTime"),
            URLQueryItem(name: "maxResults", value: "50")
        ]
        
        guard let url = components.url else {
            throw CalendarError.invalidURL
        }
        
        let (data, response) = try await URLSession.shared.data(from: url)
        
        guard let httpResponse = response as? HTTPURLResponse else {
            throw CalendarError.invalidResponse
        }
        
        guard httpResponse.statusCode == 200 else {
            if httpResponse.statusCode == 403 {
                throw CalendarError.apiKeyInvalid
            }
            throw CalendarError.httpError(statusCode: httpResponse.statusCode)
        }
        
        let decoder = JSONDecoder()
        let calendarResponse = try decoder.decode(CalendarEventsResponse.self, from: data)
        
        return calendarResponse.items ?? []
    }
    
    /// Matches a movie title with calendar events
    /// - Parameter movieTitle: Title of the movie to match
    /// - Returns: Matching calendar event if found
    func findEventForMovie(_ movieTitle: String, events: [CalendarEvent]) -> CalendarEvent? {
        // Normalize movie title for comparison
        let normalizedTitle = movieTitle.lowercased().trimmingCharacters(in: .whitespacesAndNewlines)
        
        // Try exact match first
        if let exactMatch = events.first(where: { event in
            event.summary.lowercased().contains(normalizedTitle) ||
            normalizedTitle.contains(event.summary.lowercased())
        }) {
            return exactMatch
        }
        
        // Try fuzzy match - split by common separators and match words
        let titleWords = normalizedTitle.components(separatedBy: CharacterSet.alphanumerics.inverted).filter { !$0.isEmpty }
        
        return events.first { event in
            let eventWords = event.summary.lowercased().components(separatedBy: CharacterSet.alphanumerics.inverted).filter { !$0.isEmpty }
            
            // If at least 50% of words match, consider it a match
            let matchingWords = titleWords.filter { titleWord in
                eventWords.contains { eventWord in
                    eventWord.contains(titleWord) || titleWord.contains(eventWord)
                }
            }
            
            return Double(matchingWords.count) / Double(titleWords.count) >= 0.5
        }
    }
    
    /// Converts calendar event date/time to Date object
    func parseEventDate(_ eventDateTime: CalendarEvent.EventDateTime) -> Date? {
        if let dateTimeString = eventDateTime.dateTime {
            let formatter = ISO8601DateFormatter()
            return formatter.date(from: dateTimeString)
        } else if let dateString = eventDateTime.date {
            let formatter = DateFormatter()
            formatter.dateFormat = "yyyy-MM-dd"
            return formatter.date(from: dateString)
        }
        return nil
    }
    
    /// Syncs calendar events with movies in monthly selections
    /// - Parameters:
    ///   - selections: Current monthly selections
    ///   - genre: Genre to sync
    /// - Returns: Updated movie with event information
    func syncMovieWithCalendar(movie: Movie, events: [CalendarEvent]) -> Movie {
        guard let matchedEvent = findEventForMovie(movie.title, events: events),
              let eventDate = parseEventDate(matchedEvent.start) else {
            return movie
        }
        
        // Create updated movie with calendar information
        return Movie(
            title: movie.title,
            submittedBy: movie.submittedBy,
            director: movie.director,
            year: movie.year,
            posterUrl: movie.posterUrl,
            eventDate: eventDate,
            eventDescription: matchedEvent.description,
            eventLocation: matchedEvent.location
        )
    }
}

// MARK: - Helper Extensions
extension Calendar {
    func startOfMonth(for date: Date = Date()) -> Date? {
        let components = dateComponents([.year, .month], from: date)
        return self.date(from: components)
    }
}

// MARK: - Error Types
enum CalendarError: LocalizedError {
    case invalidURL
    case invalidResponse
    case httpError(statusCode: Int)
    case apiKeyInvalid
    case noEventsFound
    
    var errorDescription: String? {
        switch self {
        case .invalidURL:
            return "Invalid calendar URL"
        case .invalidResponse:
            return "Invalid response from calendar API"
        case .httpError(let code):
            return "HTTP error: \(code)"
        case .apiKeyInvalid:
            return "Invalid Google Calendar API key. Please check your configuration."
        case .noEventsFound:
            return "No calendar events found"
        }
    }
}
