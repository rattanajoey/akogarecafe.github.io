# 🎬☕ Movie Club Cafe - App Logo

## What Was Created

A custom logo for your Movie Club Cafe iOS app that combines:
- **Film Reel** 🎬 - Representing movies and cinema
- **Coffee Cup** ☕ - Representing the café atmosphere  
- **App Colors** 🎨 - Matching your gradient theme (#d2d2cb → #4d695d with #bc252d accents)

## Files Created

1. **`logo.svg`** - The main vector logo (scalable to any size)
2. **`generate-app-icon.sh`** - Quick script to generate the 1024x1024 app icon
3. **`generate-icons.sh`** - Full script to generate all iOS icon sizes (if needed)
4. **`LOGO_INSTRUCTIONS.md`** - Detailed instructions for different methods

## Quick Start (Recommended)

### Method 1: If you have ImageMagick

```bash
cd "Movie Club Cafe"
./generate-app-icon.sh
```

This will automatically place the icon in your Xcode project! ✨

### Method 2: Using Online Converter (No installation needed)

1. Go to **https://www.appicon.co/**
2. Upload `logo.svg`
3. Download the generated icons
4. In Xcode, go to `Assets.xcassets` → `AppIcon`
5. Drag the 1024x1024 icon to the slot

### Method 3: Manual with macOS Preview

1. Open `logo.svg` in Safari (double-click the file)
2. Right-click the image → "Save Image As" → Save as PNG
3. Open the PNG in Preview
4. Go to Tools → Adjust Size
5. Set dimensions to 1024 x 1024 pixels
6. Export as PNG
7. Drag to Xcode's AppIcon asset catalog

## Design Details

### Color Palette
- **Background Gradient**: `#d2d2cb` (light sage) → `#4d695d` (forest green)
- **Accent Red**: `#bc252d` - Used for coffee, film holes, and accents
- **Primary Dark**: `#2c2c2c` - Used for main elements

### Elements
- **Film Reel**: 8 holes around the perimeter, 6 spokes from center
- **Coffee Cup**: With steam rising and a side handle
- **Film Strip**: Decorative element connecting the two main icons
- **Rounded Corners**: 226px radius (iOS standard for app icons)

## Customizing the Logo

The `logo.svg` file can be edited with:
- **Figma** (free, web-based)
- **Adobe Illustrator**
- **Inkscape** (free, desktop)
- **Sketch**
- Any vector graphics editor

### Quick Edits
- Change colors: Find and replace the hex codes in the SVG file
- Adjust positions: Modify the `transform="translate(x, y)"` values
- Resize elements: Change the size values in the SVG elements

## What's Next?

1. ✅ Generate the app icon
2. ✅ Add to Xcode project
3. 🏃 Build and run your app
4. 📱 See your new icon on the simulator/device!

## Need Help?

- See `LOGO_INSTRUCTIONS.md` for detailed step-by-step instructions
- The logo is designed to work with iOS 17.0+ (as specified in your project)
- Xcode will automatically generate all required sizes from the 1024x1024 source

---

**Tip**: For the best quality, always start with the SVG file and generate PNGs at the exact sizes you need, rather than resizing PNGs.

Enjoy your new app icon! 🎉


