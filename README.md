# Akogare Cafe (憧れカフェ)

[![Website](https://img.shields.io/badge/website-akogarecafe.com-bc252d)](https://akogarecafe.com)
[![React](https://img.shields.io/badge/React-18.3+-61dafb)](https://reactjs.org/)
[![Swift](https://img.shields.io/badge/Swift-SwiftUI-orange)](https://developer.apple.com/swift/)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore-ffca28)](https://firebase.google.com/)

A personal website celebrating Japanese media (anime, manga, music) and hosting a collaborative Movie Club. Features both a React web app and a native iOS app that share the same Firebase backend.

## 🌟 Features

- **Movie Club** 🎬 - Monthly movie selections and submissions across 4 genres
- **Music Recommendations** 🎵 - Curated Japanese music with an animated shelf
- **Interactive Shogi** ♟️ - Play Japanese chess in your browser
- **Portfolio** 💼 - Personal projects showcase
- **iOS App** 📱 - Native Swift app for Movie Club features

## 🚀 Quick Start

### Web Development
```bash
npm install
npm start      # Run development server at localhost:3000
npm run build  # Build for production
npm run deploy # Deploy to GitHub Pages
```

### iOS Development
1. Open `Movie Club Cafe/Movie Club Cafe.xcodeproj` in Xcode
2. Add your Firebase configuration
3. Build and run on simulator or device

## 📖 Documentation

All documentation has been moved to the `/docs` directory:

- **[Main Documentation](docs/README.md)** - Original project README
- **[Mobile App Overview](docs/mobile-app/PROJECT_OVERVIEW.md)** - iOS app architecture
- **[Setup Guide](docs/mobile-app/SETUP.md)** - How to set up the project
- **[Claude AI Guide](docs/CLAUDE.md)** - Comprehensive guide for AI assistants

### Mobile App Docs
- [Authentication Setup](docs/mobile-app/FIREBASE_AUTH_SETUP.md)
- [Google Calendar Setup](docs/mobile-app/GOOGLE_CALENDAR_SETUP.md)
- [Troubleshooting](docs/mobile-app/TROUBLESHOOTING.md)
- [Project Structure](docs/mobile-app/PROJECT_STRUCTURE.md)

## 🛠️ Tech Stack

### Web App
- **Framework**: React 18.3+ with React Router v7
- **UI**: Material-UI v6, Emotion, Framer Motion
- **Backend**: Firebase (Firestore, Auth)
- **APIs**: TMDB (The Movie Database)
- **State**: React Query (TanStack Query)

### Mobile App
- **Language**: Swift with SwiftUI
- **Backend**: Firebase (shared with web)
- **APIs**: TMDB
- **Location**: `/Movie Club Cafe` directory

## 🎨 Design

The site features a warm, Japanese-inspired aesthetic:
- Gradient background: `#d2d2cb` → `#4d695d`
- Accent color: `#bc252d`
- Serif typography
- Card-based layouts with smooth animations

## 🔑 Environment Variables

Create a `.env` file in the root directory:

```bash
REACT_APP_FIREBASE_API_KEY=your_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_domain
REACT_APP_FIREBASE_PROJECT_ID=your_project
REACT_APP_TMDB_API_KEY=your_tmdb_key
```

## 📁 Project Structure

```
├── src/                      # React web app source
│   ├── components/          # React components
│   │   ├── MovieClub/      # Movie club feature
│   │   ├── Music/          # Music recommendations
│   │   └── Shogi/          # Shogi game
│   ├── config/             # Firebase config
│   └── theme/              # Custom themes
│
├── Movie Club Cafe/         # iOS Swift app
│   ├── Views/              # SwiftUI views
│   ├── Models/             # Data models
│   ├── Services/           # API services
│   └── Config/             # Firebase config
│
├── docs/                    # Documentation
│   ├── mobile-app/         # iOS app docs
│   ├── CLAUDE.md           # AI assistant guide
│   └── README.md           # Original README
│
└── public/                  # Static assets
```

## 🎬 Movie Club Feature

The centerpiece of the project! Every month:
1. Members submit movies across 4 genres (Action, Drama, Comedy, Thriller)
2. Movies are pooled and selected
3. Members watch together
4. Synced between web and iOS via Firebase

## 🤝 Contributing

This is a personal project, but suggestions are welcome! Please check the documentation in `/docs` before contributing.

## 📄 License

Private project. All rights reserved.

## 🔗 Links

- **Website**: [akogarecafe.com](https://akogarecafe.com)
- **TMDB**: [The Movie Database](https://www.themoviedb.org/)
- **Firebase**: [firebase.google.com](https://firebase.google.com/)

---

Built with ❤️ by Kavy Rattana

For detailed documentation, see the [/docs](docs/) directory.

