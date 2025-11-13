# Claude AI - Project Guidance

## Quick Context
You're working on **Akogare Cafe** (akogarecafe.com) - a personal website about anime, manga, music, and a collaborative Movie Club. This project has both a React web app and an iOS Swift app that share the same Firebase backend.

## Project Identity
- **Name**: Akogare Cafe (憧れカフェ - "Yearning/Admiration Cafe")
- **Owner**: Kavy Rattana
- **Purpose**: Personal website showcasing Japanese media recommendations and hosting a monthly movie club
- **Aesthetic**: Japanese/anime-inspired with warm gradients and serene design
- **Audience**: Friends, anime enthusiasts, movie club members

## What Makes This Project Special

### 1. Movie Club Feature (Core Feature)
The main attraction! Every month, members submit movies across 4 genres, and 4 movies are selected:
- **Genres**: Action (🎬), Drama (🎭), Comedy (😂), Thriller (😱)
- **Process**: Submit → Pool → Vote/Select → Watch → Discuss
- **Tech**: Firebase Firestore for data, TMDB API for movie info
- **TMDB Search**: Interactive movie search in submission form (iOS, Nov 2025)
- **Cross-platform**: Same data synced between web (React) and iOS (Swift)
- **UI**: Minimalist Apple design with frosted glass cards

### 2. Dual Platform Architecture
- **Web**: React SPA with Material-UI, deployed via GitHub Pages
- **iOS**: Native Swift app with SwiftUI, synced to same Firebase
- **Challenge**: Keep both platforms in sync without separate admin panels

### 3. Interactive Elements
Not just a static site! Includes:
- Custom mouse follower animation
- Playable Shogi (Japanese chess) game
- Animated music shelf
- Framer Motion transitions
- Modal overlays and tooltips

## Key Technical Concepts

### Firebase Structure
```
Firestore Collections:
├── MonthlySelections/{monthId}     # Selected movies (e.g., "2025-01")
│   ├── action: { title, submittedBy, recapLink? }
│   ├── drama: { ... }
│   ├── comedy: { ... }
│   └── thriller: { ... }
│
├── GenrePools/current              # Current pool of submitted movies
│   ├── action: [array of movies]
│   ├── drama: [...]
│   ├── comedy: [...]
│   └── thriller: [...]
│
└── Submissions/{monthId}/users/{nickname}  # User submissions
    ├── action: "Movie Title"
    ├── drama: "Movie Title"
    ├── comedy: "Movie Title"
    ├── thriller: "Movie Title"
    └── timestamp: Date
```

### TMDB Integration
- Searches movies by title to get poster images, ratings, trailers
- Used by both web and iOS apps
- Handles: search, movie details, poster URLs, trailer URLs
- API key should be environment variable

### Theme Consistency
**iOS uses minimalist Apple UI design (Nov 2025 redesign):**
- Background gradient: `#d2d2cb` (warm beige) → `#4d695d` (forest green)
- Accent: `#bc252d` (Japanese red)
- Typography: SF Rounded (.rounded design), system fonts
- Layout: Frosted glass cards (.ultraThinMaterial) with rounded corners (16pt)
- Spacing: Consistent 12-24pt spacing
- Borders: Subtle gray borders (opacity 0.2)
- Interactive elements: 44pt minimum tap targets
- SF Symbols for all icons

**Web maintains anime/Japanese aesthetic:**
- Same color palette
- Serif fonts (Merriweather)
- Material-UI components
- Smooth Framer Motion animations

## Common Tasks You Might Encounter

### Adding a Movie Club Feature
1. Consider if it needs both web and iOS implementation
2. Check Firebase security rules
3. Update both platforms simultaneously
4. Test data sync between platforms
5. Update documentation in `/docs/mobile-app/`

### Modifying Firebase Data
1. Update web and iOS data models simultaneously
2. Consider migration for existing data
3. Update Firebase security rules
4. Test read/write permissions
5. Document changes in relevant docs

### Styling Changes
1. Maintain anime/Japanese aesthetic
2. Keep web and iOS visually consistent
3. Test responsiveness (web) and different iOS screen sizes
4. Use existing color palette
5. Consider dark mode if needed

### API Integration
1. Use environment variables for keys
2. Implement error handling (network failures, rate limits)
3. Add loading states with Material-UI skeletons (web) or ProgressView (iOS)
4. Cache responses when appropriate
5. Consider offline functionality

## Code Patterns to Follow

### React Component Structure
```javascript
import { useState, useEffect } from 'react';
import { styled } from '@mui/material/styles';
import { Box, Typography, Button } from '@mui/material';

const StyledContainer = styled(Box)(({ theme }) => ({
  // Emotion styling here
}));

export const FeatureComponent = () => {
  const [data, setData] = useState([]);
  
  useEffect(() => {
    // Data fetching
  }, []);
  
  return (
    <StyledContainer>
      {/* Component JSX */}
    </StyledContainer>
  );
};
```

### SwiftUI View Structure (Minimalist Apple UI)
```swift
import SwiftUI
import FirebaseFirestore

struct FeatureView: View {
    @State private var data: [DataModel] = []
    
    var body: some View {
        ScrollView {
            VStack(spacing: 24) {
                // Section Header
                HStack {
                    Text("Feature Title")
                        .font(.system(size: 26, weight: .bold, design: .rounded))
                        .foregroundColor(AppTheme.textPrimary)
                    Spacer()
                }
                .padding(.horizontal, 20)
                
                // Content Cards
                VStack(spacing: 12) {
                    // Card content
                }
                .padding(16)
                .background(
                    RoundedRectangle(cornerRadius: 16)
                        .fill(.ultraThinMaterial)
                )
                .overlay(
                    RoundedRectangle(cornerRadius: 16)
                        .stroke(Color.gray.opacity(0.2), lineWidth: 1)
                )
                .padding(.horizontal, 16)
            }
        }
        .background(AppTheme.backgroundGradient)
        .task {
            await loadData()
        }
    }
    
    private func loadData() async {
        // Async data loading
    }
}
```

### Firebase Read/Write
```javascript
// Read
const docRef = doc(db, "MonthlySelections", monthId);
const docSnap = await getDoc(docRef);
const data = docSnap.data();

// Write
await setDoc(doc(db, "Submissions", monthId, "users", nickname), {
  action: actionMovie,
  drama: dramaMovie,
  comedy: comedyMovie,
  thriller: thrillerMovie,
  timestamp: serverTimestamp()
});
```

## Important Files

### Web App
- `/src/components/MovieClub/` - Movie club feature components
- `/src/config/firebase.js` - Firebase configuration
- `/src/utils/tmdb.js` - TMDB API utilities
- `/src/theme/` - Custom themes and styling
- `/src/App.js` - Main app component with routing

### iOS App
- `Movie Club Cafe/Views/` - All SwiftUI views
- `Movie Club Cafe/Services/TMDBService.swift` - TMDB integration
- `Movie Club Cafe/Config/FirebaseConfig.swift` - Firebase setup
- `Movie Club Cafe/Models/MovieModels.swift` - Data models
- `Movie Club Cafe/Theme/AppTheme.swift` - Colors and styling

### Configuration
- `.env` (web) - Environment variables (not in repo)
- `Movie Club Cafe/Config/GoogleService-Info.plist` (iOS) - Firebase config
- `firebase.js` - Firebase initialization
- `package.json` - Dependencies and scripts

### Documentation (now in /docs)
- `/docs/README.md` - Main project README
- `/docs/mobile-app/PROJECT_OVERVIEW.md` - iOS app overview
- `/docs/mobile-app/SETUP.md` - Setup instructions
- `/docs/mobile-app/AUTHENTICATION_*.md` - Auth setup guides
- `/docs/mobile-app/TROUBLESHOOTING.md` - Common issues

## Best Practices for This Project

### 1. Maintain Sync Between Platforms
When changing movie club features, update both:
- React components in `/src/components/MovieClub/`
- SwiftUI views in `Movie Club Cafe/Views/`
- Data models in both platforms
- API services in both platforms

### 2. Preserve the Aesthetic
**iOS (Minimalist Apple UI):**
- Clean, spacious layouts with ample whitespace
- SF Rounded fonts for modern feel
- Frosted glass cards (.ultraThinMaterial)
- Smooth, subtle animations
- 44pt tap targets for accessibility
- Consistent 16pt rounded corners
- Minimal shadows (opacity 0.1-0.3)

**Web (Japanese-inspired):**
- Warm, inviting, Japanese-inspired design
- Use soft gradients, not harsh contrasts
- Serif fonts for headers
- Smooth animations (not jarring)
- Card-based layouts with subtle shadows
- Maintain the color palette

### 3. Error Handling
Always provide user feedback:
- Loading states (skeletons, spinners)
- Error messages (friendly, specific)
- Success confirmations (toasts, alerts)
- Network failure fallbacks

### 4. Performance
- Lazy load images
- Use React Query for caching
- Optimize Firebase queries (specific fields, limits)
- Debounce user inputs (search, forms)
- Use AsyncImage in SwiftUI

### 5. Documentation
- Update docs when changing features
- Document Firebase structure changes
- Keep setup guides current
- Add comments for complex logic

## Debugging Tips

### Firebase Issues
1. Check Firebase console for data structure
2. Verify security rules
3. Test read/write permissions
4. Check for typos in collection/document names
5. Use Firebase Emulator for testing

### TMDB Issues
1. Verify API key is valid
2. Check rate limits (40 requests/10 seconds)
3. Handle missing data (not all movies have trailers)
4. Log API responses for debugging
5. Use fallback for missing posters

### Sync Issues (Web ↔ iOS)
1. Verify both use same collection names
2. Check data model compatibility
3. Test timestamp handling
4. Ensure both handle missing fields gracefully
5. Check for platform-specific bugs

## Git Workflow
- **Current Branch**: `mobile-app` (based on user info)
- **Main Branch**: `main` - web deployment
- **Mobile Branch**: `mobile-app` - iOS development
- Commit messages should be descriptive
- Test before committing
- Use `npm run deploy` to deploy web changes

## Environment Setup

### Web Development
```bash
npm install
npm start  # Runs on localhost:3000
npm run build  # Production build
npm run deploy  # Deploy to GitHub Pages
```

### iOS Development
1. Open `Movie Club Cafe/Movie Club Cafe.xcodeproj` in Xcode
2. Add `GoogleService-Info.plist` to Config folder
3. Update Firebase config in `FirebaseConfig.swift`
4. Build and run on simulator or device

## Security Considerations
- Never commit API keys or Firebase credentials
- Use environment variables for secrets
- Configure Firebase security rules properly
- Validate user input (especially in submission forms)
- Password for movie submission: "thunderbolts" (currently hardcoded)

## Recent Major Updates (November 2025)

### iOS App Redesign - Minimalist Apple UI
Complete visual overhaul of the iOS app:
- ✅ **Header**: Circular frosted glass buttons, larger title (38pt)
- ✅ **Carousel**: Genre emoji indicators, cleaner month selector
- ✅ **Submission Form**: Interactive TMDB search with posters and ratings
- ✅ **Genre/Holding Pools**: Frosted glass cards with emojis
- ✅ **Submission List**: Clean user cards with timestamps
- ✅ **Typography**: SF Rounded throughout for modern feel
- ✅ **Consistency**: All views use same card style

### Key Features Added
- **TMDB Search in Submission Form**: Users can now search movies with live results
- **Genre Emojis**: Visual indicators throughout (🎬 🎭 😂 😱)
- **Frosted Glass Cards**: Modern Apple-style UI elements
- **Better Empty States**: Icons and helpful messages

## Future Enhancement Ideas
If the user asks for new features, consider:
- ✅ User authentication (Firebase Auth) - COMPLETED
- ✅ Movie search integration - COMPLETED (iOS)
- Push notifications for new movie selections
- In-app movie ratings and reviews
- Discussion/comment system
- Watchlist/favorites
- Calendar integration for movie nights
- Dark mode support (system adaptive)
- Social media sharing
- Admin panel for easier movie selection
- Analytics for popular genres/movies
- Web version of TMDB search

## Communication Style
When responding to the user:
- Be enthusiastic about the project's unique features
- Acknowledge the dual-platform complexity
- Provide code examples in both React and Swift when relevant
- Consider both web and iOS implications
- Reference existing patterns in the codebase
- Suggest improvements that align with the aesthetic
- Be mindful of Firebase costs (optimize queries)
- Keep explanations clear and actionable

## Key Reminders
1. ✅ This is a PERSONAL PROJECT - prioritize user experience over enterprise patterns
2. ✅ DESIGN MATTERS - iOS uses minimalist Apple UI, web uses anime aesthetic
3. ✅ TWO PLATFORMS - changes often need both web and iOS updates
4. ✅ SHARED BACKEND - Firebase is the source of truth for both platforms
5. ✅ MOVIE CLUB is the PRIMARY feature - protect and enhance it
6. ✅ Documentation is in `/docs` - keep it updated
7. ✅ iOS REDESIGN COMPLETE (Nov 2025) - maintain the minimalist Apple UI style

---

## Quick Reference Commands

### Web
```bash
npm start          # Start dev server
npm run build      # Build for production
npm run deploy     # Deploy to GitHub Pages
npm test           # Run tests
```

### Git
```bash
git status         # Check current state
git add .          # Stage changes
git commit -m ""   # Commit changes
git push           # Push to remote
```

### Firebase (if Firebase CLI is installed)
```bash
firebase login              # Login
firebase deploy --only firestore:rules  # Deploy security rules
firebase emulators:start    # Start local emulators
```

---

## Design Philosophy

### iOS (November 2025 Redesign)
The iOS app now follows Apple's Human Interface Guidelines with a minimalist approach:
- **Clarity**: Clean typography, ample whitespace, focused content
- **Deference**: Frosted glass allows content to shine
- **Depth**: Subtle shadows and layering create hierarchy
- **Consistency**: Same card style, spacing, and interaction patterns throughout

### Web
Maintains the original warm, Japanese-inspired aesthetic that gives the site its personality.

## Final Thoughts
This is a creative, personal project with thoughtful design and dual-platform architecture. The Movie Club feature is the heart of the project, bringing friends together through shared movie experiences.

**Recent Achievement**: The iOS app received a complete visual overhaul (Nov 2025) with a modern, minimalist Apple UI design. The app is now more intuitive, accessible, and visually stunning while maintaining full feature parity.

When making changes:
- **iOS**: Maintain the minimalist Apple UI aesthetic (frosted glass, SF Rounded, clean layouts)
- **Web**: Preserve the anime/Japanese aesthetic (warm colors, serif fonts, smooth animations)
- Keep both platforms in sync for features and data
- Prioritize user experience and accessibility
- Document your changes
- Test thoroughly on both platforms

Happy coding! 🎬✨📱

