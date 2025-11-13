# Custom Calendar UI Feature

## Overview

The iOS app now includes a beautiful, interactive calendar view that automatically syncs with Google Calendar to display movie showtimes. This feature provides users with a visual representation of when movies will be shown, making it easy to plan and remember viewing schedules.

## Features

### 1. **Custom Calendar UI**
- **Minimalist Apple Design**: Frosted glass effects, SF Rounded fonts, and clean spacing
- **Monthly Calendar View**: Navigate between months with smooth animations
- **Visual Indicators**: 
  - Dates with movie showings are highlighted with dots
  - Today's date has a special border
  - Selected dates show full movie details
  
### 2. **Automatic Background Syncing**
- **Silent Operation**: Calendar data syncs automatically when the app loads movies
- **Smart Syncing**: Only syncs if movies don't already have calendar data
- **No User Interaction Needed**: Works transparently in the background
- **Error Handling**: Silent failures don't disrupt the user experience

### 3. **Movie Showtime Display**
- **Date & Time**: Shows when each movie will be screened
- **Location**: Displays where the movie will be shown
- **Poster Thumbnails**: Visual identification of movies
- **Multiple Movies per Day**: Supports multiple screenings on the same date

### 4. **Enhanced Movie Cards**
- **Prominent Time Display**: Showtime highlighted in frosted glass card
- **Calendar Icon**: Visual indicator for scheduled movies
- **Clock Icon**: Time displayed prominently with larger font
- **Location Pin**: Easy-to-spot venue information

## User Experience

### Viewing the Calendar

1. Open the Movie Club tab
2. Tap the "Calendar" button in the header (next to Info and Share buttons)
3. The calendar view slides in with smooth animation
4. Navigate months using left/right arrows
5. Tap on a date with movies to see details
6. Tap "Hide Calendar" to collapse the view

### Calendar Indicators

- **Gray Circle with Accent Dots**: Dates with scheduled movies
- **Accent Color Circle**: Selected date
- **Accent Border**: Today's date (if not selected)
- **Movie Count**: Header shows total showings for the month

### Movie Details on Selected Date

When you tap a date, you'll see:
- Movie poster thumbnail (40x60)
- Movie title
- Showtime (e.g., "7:30 PM")
- Location (if available)
- All movies scheduled for that day

## Technical Implementation

### Architecture

```
MovieClubView
├── Header (with Calendar button)
├── CalendarView (collapsible)
│   ├── Month navigation
│   ├── Calendar grid (42 days)
│   └── Selected date details
└── Movie content (SelectedMoviesView, etc.)
```

### Automatic Syncing Flow

```
1. User opens Movie Club
   ↓
2. loadData() called
   ↓
3. fetchSelections() + fetchGenrePools()
   ↓
4. autoSyncCalendar() runs in background
   ↓
5. Checks if movies need calendar data
   ↓
6. Fetches Google Calendar events (silent)
   ↓
7. Matches movies to calendar events
   ↓
8. Updates Firebase with event data
   ↓
9. UI updates automatically
```

### Data Flow

```
Google Calendar API
       ↓
GoogleCalendarService.fetchCalendarEvents()
       ↓
Match movie titles to event names
       ↓
syncMovieWithCalendar()
       ↓
Update Movie model with:
  - eventDate
  - eventDescription
  - eventLocation
       ↓
Save to Firebase
       ↓
Display in UI (Calendar + Movie Cards)
```

## Files Modified/Created

### New Files
- `/Movie Club Cafe/Views/CalendarView.swift` - Custom calendar UI component

### Modified Files
- `/Movie Club Cafe/Views/MovieClubView.swift` - Added calendar toggle and auto-sync
- `/Movie Club Cafe/Views/SelectedMoviesView.swift` - Enhanced event info display
- `/Movie Club Cafe/Views/Admin/AdminMonthlySelectionView.swift` - Fixed GenrePoolCard reference

### Key Components

#### CalendarView.swift
```swift
struct CalendarView: View {
    let movies: [Movie]
    @State private var currentMonth: Date
    @State private var selectedDate: Date?
    
    // Displays:
    // - Month navigation
    // - Calendar grid with indicators
    // - Selected date movie details
}
```

#### MovieClubView.swift - Auto Sync
```swift
@MainActor private func autoSyncCalendar() async {
    // Checks if sync needed
    // Fetches calendar events silently
    // Matches movies to events
    // Updates Firebase in background
}
```

#### SelectedMoviesView.swift - Enhanced Display
```swift
// Event info - compact and prominent
VStack(alignment: .leading, spacing: 6) {
    if let eventDate = movie.eventDate {
        VStack(alignment: .leading, spacing: 4) {
            HStack {
                Image(systemName: "calendar")
                Text(formatEventDate(eventDate))
            }
            HStack {
                Image(systemName: "clock")
                Text(formatEventTime(eventDate))
                    .font(.system(size: 17, weight: .semibold))
            }
        }
        .padding(10)
        .background(
            RoundedRectangle(cornerRadius: 10)
                .fill(AppTheme.accentColor.opacity(0.3))
        )
    }
}
```

## Google Calendar Integration

### How It Works

1. **Calendar ID**: Uses the Google Calendar ID specified in `GoogleCalendarService`
2. **API Key**: Configured in the service (can be overridden with environment variable)
3. **Event Matching**: 
   - Exact match: Movie title matches calendar event name
   - Fuzzy match: At least 50% of words match
4. **Date Range**: Fetches events from start of current month to 6 months ahead

### Event Requirements

For a movie to sync with a calendar event:
- Event name should match or contain the movie title
- Event must have a start date/time
- Calendar must be accessible via the API

Example calendar event names:
- "Movie: The Shawshank Redemption"
- "The Shawshank Redemption - Movie Night"
- "Shawshank Redemption"

## Design Guidelines

### Visual Design
- **Typography**: SF Rounded for headings, system font for body
- **Spacing**: 12-24pt consistent spacing
- **Corners**: 12-16pt rounded corners throughout
- **Material**: .ultraThinMaterial for frosted glass
- **Borders**: Subtle gray borders (0.2 opacity, 1-1.5pt)

### Color Palette
- **Accent Color**: `AppTheme.accentColor` (red: #bc252d)
- **Text Primary**: `.primary` (adaptive black/white)
- **Text Secondary**: `.secondary` (adaptive gray)
- **Calendar Highlights**: Accent color with opacity variations

### Animations
- **Calendar Toggle**: Slide from top + fade
- **Month Navigation**: Spring animation (response: 0.4, damping: 0.8)
- **Date Selection**: Immediate color change

## User Benefits

1. **No Manual Work**: Calendar syncs automatically without user intervention
2. **Visual Planning**: See all movie nights at a glance
3. **Quick Reference**: Tap any date to see details
4. **Always Updated**: Background sync keeps data fresh
5. **Native Feel**: Minimalist Apple UI fits iOS design language

## Future Enhancements

Potential additions:
- [ ] Add to Apple Calendar button
- [ ] Notification reminders before showtime
- [ ] Multiple calendar support
- [ ] Calendar widget for home screen
- [ ] Sharing calendar invites
- [ ] Past events marked differently

## Troubleshooting

### Calendar Not Showing Events
- Check Google Calendar API key is valid
- Verify calendar is public or API has access
- Ensure event names match movie titles
- Check Firebase has write permissions

### Events Not Matching Movies
- Calendar event names should contain movie title
- Try exact movie title in event name
- Use format: "Movie: [Title]"
- Check date range (current month to +6 months)

### UI Not Updating
- Check network connection
- Verify Firebase rules allow reads/writes
- Try pulling down to refresh
- Restart app to force resync

## Testing

### Manual Testing Steps

1. **View Calendar**
   - Open Movie Club
   - Tap "Calendar" button
   - Verify calendar displays correctly

2. **Navigation**
   - Tap left/right arrows
   - Verify month changes
   - Check movie counts update

3. **Date Selection**
   - Tap date with movie
   - Verify movie details appear
   - Check poster, time, location display

4. **Auto-Sync**
   - Kill and restart app
   - Watch for movie times to appear
   - Verify no user prompts

5. **Movie Cards**
   - Scroll to movie with event
   - Check frosted glass card with time
   - Verify location displays

## Summary

The custom calendar UI feature provides a seamless, beautiful way for users to see when movies will be shown. With automatic background syncing, users never have to worry about manually checking or updating showtimes - the app handles it all transparently while maintaining the minimalist Apple design aesthetic.

---

**Implementation Date**: November 2025  
**Platform**: iOS (SwiftUI)  
**Dependencies**: Google Calendar API, Firebase Firestore  
**Design**: Minimalist Apple UI

