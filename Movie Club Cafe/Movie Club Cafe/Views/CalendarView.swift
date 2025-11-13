//
//  CalendarView.swift
//  Movie Club Cafe
//
//  Created by Kavy Rattana
//

import SwiftUI

struct CalendarView: View {
    let movies: [Movie]
    @State private var currentMonth: Date = Date()
    @State private var selectedDate: Date? = nil
    
    private let calendar = Calendar.current
    private let daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    
    var body: some View {
        VStack(spacing: 20) {
            // Header with month/year and navigation
            monthHeader
            
            // Days of week
            daysOfWeekHeader
            
            // Calendar grid
            calendarGrid
            
            // Selected date details
            if let selectedDate = selectedDate {
                selectedDateView(for: selectedDate)
            }
        }
        .padding(20)
        .background(
            RoundedRectangle(cornerRadius: 20)
                .fill(.ultraThinMaterial)
        )
        .overlay(
            RoundedRectangle(cornerRadius: 20)
                .stroke(Color.gray.opacity(0.2), lineWidth: 1.5)
        )
    }
    
    // MARK: - Month Header
    private var monthHeader: some View {
        HStack {
            Button(action: previousMonth) {
                Image(systemName: "chevron.left")
                    .font(.system(size: 18, weight: .semibold))
                    .foregroundColor(AppTheme.accentColor)
                    .frame(width: 44, height: 44)
                    .background(.ultraThinMaterial)
                    .clipShape(Circle())
            }
            
            Spacer()
            
            VStack(spacing: 4) {
                Text(monthYearString)
                    .font(.system(size: 22, weight: .bold, design: .rounded))
                    .foregroundColor(.primary)
                
                let count = moviesThisMonth.count
                if count > 0 {
                    Text("\(count) showing\(count == 1 ? "" : "s")")
                        .font(.system(size: 13, weight: .medium))
                        .foregroundColor(.secondary)
                }
            }
            
            Spacer()
            
            Button(action: nextMonth) {
                Image(systemName: "chevron.right")
                    .font(.system(size: 18, weight: .semibold))
                    .foregroundColor(AppTheme.accentColor)
                    .frame(width: 44, height: 44)
                    .background(.ultraThinMaterial)
                    .clipShape(Circle())
            }
        }
    }
    
    // MARK: - Days of Week Header
    private var daysOfWeekHeader: some View {
        HStack(spacing: 0) {
            ForEach(daysOfWeek, id: \.self) { day in
                Text(day)
                    .font(.system(size: 12, weight: .semibold))
                    .foregroundColor(.secondary)
                    .frame(maxWidth: .infinity)
            }
        }
        .padding(.vertical, 8)
    }
    
    // MARK: - Calendar Grid
    private var calendarGrid: some View {
        let days = generateDaysInMonth()
        let columns = Array(repeating: GridItem(.flexible(), spacing: 4), count: 7)
        
        return LazyVGrid(columns: columns, spacing: 8) {
            ForEach(days, id: \.self) { date in
                if let date = date {
                    dayCell(for: date)
                } else {
                    // Empty cell for padding
                    Color.clear
                        .frame(height: 50)
                }
            }
        }
    }
    
    // MARK: - Day Cell
    private func dayCell(for date: Date) -> some View {
        let hasMovie = moviesOn(date: date).count > 0
        let isSelected = selectedDate != nil && calendar.isDate(date, inSameDayAs: selectedDate!)
        let isToday = calendar.isDateInToday(date)
        
        return Button(action: {
            if hasMovie {
                selectedDate = isSelected ? nil : date
            }
        }) {
            ZStack {
                // Background
                RoundedRectangle(cornerRadius: 12)
                    .fill(isSelected ? AppTheme.accentColor : (hasMovie ? AppTheme.accentColor.opacity(0.15) : Color.clear))
                
                // Today indicator
                if isToday && !isSelected {
                    RoundedRectangle(cornerRadius: 12)
                        .strokeBorder(AppTheme.accentColor, lineWidth: 2)
                }
                
                VStack(spacing: 2) {
                    Text("\(calendar.component(.day, from: date))")
                        .font(.system(size: 16, weight: isSelected || hasMovie ? .semibold : .regular))
                        .foregroundColor(isSelected ? .white : .primary)
                    
                    // Movie indicator dots
                    if hasMovie && !isSelected {
                        HStack(spacing: 2) {
                            ForEach(0..<min(moviesOn(date: date).count, 4), id: \.self) { _ in
                                Circle()
                                    .fill(AppTheme.accentColor)
                                    .frame(width: 4, height: 4)
                            }
                        }
                    }
                }
            }
        }
        .frame(height: 50)
        .disabled(!hasMovie)
    }
    
    // MARK: - Selected Date View
    private func selectedDateView(for date: Date) -> some View {
        let movies = moviesOn(date: date)
        
        return VStack(alignment: .leading, spacing: 12) {
            Text(dateString(for: date))
                .font(.system(size: 18, weight: .bold, design: .rounded))
                .foregroundColor(.primary)
            
            ForEach(movies) { movie in
                HStack(spacing: 12) {
                    // Movie poster thumbnail
                    if let posterUrl = movie.posterUrl, let url = URL(string: "https://image.tmdb.org/t/p/w92\(posterUrl)") {
                        AsyncImage(url: url) { image in
                            image
                                .resizable()
                                .scaledToFill()
                        } placeholder: {
                            Rectangle()
                                .fill(Color.gray.opacity(0.3))
                        }
                        .frame(width: 40, height: 60)
                        .clipShape(RoundedRectangle(cornerRadius: 6))
                    }
                    
                    VStack(alignment: .leading, spacing: 4) {
                        Text(movie.title)
                            .font(.system(size: 15, weight: .semibold))
                            .foregroundColor(.primary)
                            .lineLimit(2)
                        
                        if let eventDate = movie.eventDate {
                            HStack(spacing: 6) {
                                Image(systemName: "clock")
                                    .font(.system(size: 12))
                                    .foregroundColor(.secondary)
                                Text(timeString(for: eventDate))
                                    .font(.system(size: 13, weight: .medium))
                                    .foregroundColor(.secondary)
                            }
                        }
                        
                        if let location = movie.eventLocation {
                            HStack(spacing: 6) {
                                Image(systemName: "location")
                                    .font(.system(size: 12))
                                    .foregroundColor(.secondary)
                                Text(location)
                                    .font(.system(size: 13, weight: .medium))
                                    .foregroundColor(.secondary)
                                    .lineLimit(1)
                            }
                        }
                    }
                    
                    Spacer()
                }
                .padding(12)
                .background(
                    RoundedRectangle(cornerRadius: 12)
                        .fill(Color.gray.opacity(0.1))
                )
            }
        }
        .padding(.top, 12)
    }
    
    // MARK: - Helper Functions
    private func generateDaysInMonth() -> [Date?] {
        guard let monthInterval = calendar.dateInterval(of: .month, for: currentMonth),
              let monthFirstWeek = calendar.dateInterval(of: .weekOfMonth, for: monthInterval.start) else {
            return []
        }
        
        var days: [Date?] = []
        var currentDate = monthFirstWeek.start
        
        // Generate 6 weeks (42 days) to cover all possible month layouts
        for _ in 0..<42 {
            if calendar.isDate(currentDate, equalTo: monthInterval.start, toGranularity: .month) {
                days.append(currentDate)
            } else {
                days.append(nil)
            }
            currentDate = calendar.date(byAdding: .day, value: 1, to: currentDate)!
        }
        
        return days
    }
    
    private func moviesOn(date: Date) -> [Movie] {
        movies.filter { movie in
            guard let eventDate = movie.eventDate else { return false }
            return calendar.isDate(eventDate, inSameDayAs: date)
        }
    }
    
    private var moviesThisMonth: [Movie] {
        movies.filter { movie in
            guard let eventDate = movie.eventDate else { return false }
            return calendar.isDate(eventDate, equalTo: currentMonth, toGranularity: .month)
        }
    }
    
    private var monthYearString: String {
        let formatter = DateFormatter()
        formatter.dateFormat = "MMMM yyyy"
        return formatter.string(from: currentMonth)
    }
    
    private func dateString(for date: Date) -> String {
        let formatter = DateFormatter()
        formatter.dateFormat = "EEEE, MMMM d"
        return formatter.string(from: date)
    }
    
    private func timeString(for date: Date) -> String {
        let formatter = DateFormatter()
        formatter.dateFormat = "h:mm a"
        return formatter.string(from: date)
    }
    
    private func previousMonth() {
        if let newMonth = calendar.date(byAdding: .month, value: -1, to: currentMonth) {
            currentMonth = newMonth
            selectedDate = nil
        }
    }
    
    private func nextMonth() {
        if let newMonth = calendar.date(byAdding: .month, value: 1, to: currentMonth) {
            currentMonth = newMonth
            selectedDate = nil
        }
    }
}

// MARK: - Preview
struct CalendarView_Previews: PreviewProvider {
    static var previews: some View {
        let sampleMovies = [
            Movie(
                title: "The Shawshank Redemption",
                submittedBy: "John",
                director: "Frank Darabont",
                year: "1994",
                posterUrl: "/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg",
                eventDate: Calendar.current.date(byAdding: .day, value: 5, to: Date()),
                eventDescription: "Movie night at home",
                eventLocation: "Living room"
            ),
            Movie(
                title: "The Godfather",
                submittedBy: "Jane",
                director: "Francis Ford Coppola",
                year: "1972",
                posterUrl: "/3bhkrj58Vtu7enYsRolD1fZdja1.jpg",
                eventDate: Calendar.current.date(byAdding: .day, value: 12, to: Date()),
                eventLocation: "Cinema"
            )
        ]
        
        CalendarView(movies: sampleMovies)
            .padding()
    }
}

