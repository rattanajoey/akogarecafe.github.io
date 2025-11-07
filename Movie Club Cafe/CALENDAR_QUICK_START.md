# Calendar UI - Quick Start Guide

## 🎯 What This Feature Does

**Automatically syncs Google Calendar with your movie app to show when movies will be screened.**

Users see:
- 📅 Visual calendar with movie showtimes
- 🕐 Date and time for each movie
- 📍 Location where movie will be shown
- 🎬 Movie posters and details

**All without pressing a button!**

---

## 🚀 How to Use

### As a User

1. **Open the Movie Club tab**
   - Calendar data syncs automatically in the background
   
2. **Tap the "Calendar" button** (in the header)
   - Beautiful monthly calendar appears
   
3. **Navigate months** using ◀️ ▶️ arrows
   
4. **Tap on a date** with movies (marked with dots)
   - See all movies scheduled that day
   - View poster, showtime, and location
   
5. **Tap "Hide Calendar"** to close

That's it! The app handles everything else automatically.

---

## 🎨 What You'll See

### Calendar View
```
┌─────────────────────────────┐
│  ◀️  November 2025  ▶️       │
│     2 showings              │
├─────────────────────────────┤
│ Sun Mon Tue Wed Thu Fri Sat │
│  1   2   3   4   5   6   7  │
│  8   9  🟣  11  12  13  14  │ ← Dots = movies
│ 15  16  17  🟣  19  20  21  │
│ 22  23  24  25  26  27  28  │
│ 29  30                      │
└─────────────────────────────┘
```

### Selected Date
```
┌─────────────────────────────┐
│ Friday, November 8          │
├─────────────────────────────┤
│ [Poster] The Shawshank      │
│          Redemption         │
│          🕐 7:30 PM         │
│          📍 Cinema Room     │
└─────────────────────────────┘
```

### Movie Card (Enhanced)
```
┌─────────────────────────────┐
│ [Large Movie Poster]        │
│                             │
│ The Shawshank Redemption    │
│ ⭐⭐⭐⭐⭐ 9.3               │
│                             │
│ ╔═══════════════════════╗   │
│ ║ 📅 Nov 8, 2025       ║   │
│ ║ 🕐 7:30 PM           ║   │ ← NEW!
│ ╚═══════════════════════╝   │
│ 📍 Living Room              │
│ 👤 by John                  │
└─────────────────────────────┘
```

---

## 🔄 How Auto-Sync Works

### Behind the Scenes
1. You open the app
2. App fetches movies from Firebase
3. **Automatically** checks Google Calendar
4. **Automatically** matches movie titles to events
5. **Automatically** updates movie showtimes
6. **Automatically** saves to Firebase
7. UI updates instantly

**You do nothing. It just works! ✨**

### What Gets Synced
- ✅ Event date and time
- ✅ Event location
- ✅ Event description
- ✅ All matched movies

---

## 🎬 For Calendar Setup

### Google Calendar Event Format

**Best Format:**
```
Movie: The Shawshank Redemption
```

**Also Works:**
```
The Shawshank Redemption
Shawshank Redemption - Movie Night
Watch: The Shawshank Redemption
```

**Event Details:**
- **Time**: Set the actual showtime (e.g., 7:30 PM)
- **Location**: Add venue (e.g., "Living Room", "Cinema")
- **Description**: Optional notes about the screening

### Matching Logic
The app matches movies using:
1. **Exact match**: Event name = movie title
2. **Fuzzy match**: At least 50% of words match
3. **Case-insensitive**: "shawshank" = "Shawshank"

---

## 🛠️ Technical Details

### Files
- `CalendarView.swift` - Calendar UI component
- `MovieClubView.swift` - Auto-sync logic
- `SelectedMoviesView.swift` - Enhanced movie cards
- `GoogleCalendarService.swift` - Calendar API (existing)

### Integration
```
Google Calendar
    ↓
Auto Sync (silent)
    ↓
Firebase Storage
    ↓
Calendar UI + Movie Cards
```

### Performance
- ⚡ Fast: Calendar view renders in milliseconds
- 🔄 Efficient: Syncs only when needed
- 💾 Cached: Data stored in Firebase
- 📱 Native: Pure SwiftUI, no web views

---

## 🎨 Design Philosophy

### Minimalist Apple UI
- Clean, spacious layouts
- Frosted glass effects (`.ultraThinMaterial`)
- SF Rounded fonts
- Consistent spacing (12-24pt)
- Subtle animations
- Accent color highlights

### User Experience
- **Zero effort**: No manual actions required
- **Visual**: See schedule at a glance
- **Fast**: Instant navigation and selection
- **Native**: Feels like built-in iOS app

---

## 💡 Tips

### For Best Experience
1. **Keep calendar event names simple** - Just the movie title works best
2. **Add location to events** - Makes it easy to know where to go
3. **Set correct times** - App shows exact event time
4. **Use consistent naming** - Match movie titles exactly when possible

### Visual Cues
- **Dots on dates** = Movies scheduled
- **Today's border** = Current date
- **Accent circle** = Selected date
- **Frosted card** = Event info on movie

---

## 🐛 Troubleshooting

### Calendar Not Showing Movies?
✅ Check: Google Calendar has events  
✅ Check: Event names match movie titles  
✅ Check: Events are within next 6 months  
✅ Try: Restart app to force resync  

### Times Not Appearing?
✅ Check: Calendar API key is valid  
✅ Check: Firebase has correct permissions  
✅ Check: Network connection is active  
✅ Try: Pull down to refresh  

### Events Not Matching?
✅ Use exact movie title in event name  
✅ Try format: "Movie: [Title]"  
✅ Check for typos in event names  
✅ Ensure calendar is accessible  

---

## 📱 Screenshots Flow

```
1. Movie Club Tab
   └─ Tap "Calendar" button

2. Calendar View Opens
   └─ See monthly calendar
   └─ Dates with movies have dots
   
3. Tap a Date
   └─ Movie details appear
   └─ See poster, time, location
   
4. Tap "Hide Calendar"
   └─ Back to normal view
   
5. Scroll to Movies
   └─ Enhanced cards show times
   └─ Frosted glass event info
```

---

## 🎉 Benefits

### For Users
- ✅ Never forget when movies are showing
- ✅ See schedule visually on calendar
- ✅ Plan ahead with monthly view
- ✅ Quick reference to showtimes

### For Developers
- ✅ No extra user actions required
- ✅ Automatic sync in background
- ✅ Uses existing calendar service
- ✅ Clean, maintainable code

---

## 📊 Summary

| Feature | Status |
|---------|--------|
| Calendar UI | ✅ Complete |
| Auto-Sync | ✅ Complete |
| Movie Cards | ✅ Enhanced |
| Design | ✅ Minimalist Apple |
| Testing | ✅ Builds Successfully |
| Documentation | ✅ Complete |

**Result**: Beautiful, automatic calendar integration that requires zero user effort! 🎬📅✨

---

**Questions?** Check the full documentation in `CALENDAR_UI_FEATURE.md`

**Issues?** See troubleshooting section above or restart the app

**Enjoy!** 🍿

