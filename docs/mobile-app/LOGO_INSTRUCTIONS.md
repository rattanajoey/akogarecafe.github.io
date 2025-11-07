# Movie Club Cafe Logo

## Design Elements

The logo combines:
- 🎬 **Film Reel** - Representing the movie club aspect
- ☕ **Coffee Cup** - Representing the café atmosphere
- 🎨 **Color Scheme** - Using the app's signature colors:
  - Background: Gradient from `#d2d2cb` to `#4d695d`
  - Accent: `#bc252d` (red)
  - Primary: `#2c2c2c` (dark gray)

## Adding to Your Xcode Project

### Option 1: Using Online Converter (Recommended)

1. Go to https://www.appicon.co/ or https://appicon.build/
2. Upload the `logo.svg` file
3. Download the generated app icons package
4. In Xcode:
   - Open `Assets.xcassets`
   - Click on `AppIcon`
   - Drag and drop all the generated images to their respective size slots

### Option 2: Using ImageMagick (Command Line)

If you have ImageMagick installed, run:

```bash
cd "Movie Club Cafe"

# Convert SVG to different sizes
convert -background none logo.svg -resize 1024x1024 icon-1024.png
convert -background none logo.svg -resize 180x180 icon-180.png
convert -background none logo.svg -resize 120x120 icon-120.png
convert -background none logo.svg -resize 167x167 icon-167.png
convert -background none logo.svg -resize 152x152 icon-152.png
convert -background none logo.svg -resize 76x76 icon-76.png
convert -background none logo.svg -resize 40x40 icon-40.png
convert -background none logo.svg -resize 60x60 icon-60.png
convert -background none logo.svg -resize 58x58 icon-58.png
convert -background none logo.svg -resize 87x87 icon-87.png
convert -background none logo.svg -resize 80x80 icon-80.png
convert -background none logo.svg -resize 29x29 icon-29.png
convert -background none logo.svg -resize 20x20 icon-20.png
```

Then add these PNG files to your Xcode project's AppIcon asset catalog.

### Option 3: Using macOS Preview

1. Open `logo.svg` in Safari
2. Take a screenshot or export as PDF
3. Open in Preview
4. Export as PNG at 1024x1024
5. Use the online converter method above with this PNG

## Required Sizes for iOS App Icons

- **1024×1024** - App Store
- **180×180** - iPhone (3x)
- **120×120** - iPhone (2x)
- **167×167** - iPad Pro
- **152×152** - iPad (2x)
- **76×76** - iPad (1x)
- **60×60** - iPhone (3x) Notification
- **40×40** - iPhone (2x) Spotlight
- **58×58** - iPhone (2x) Settings
- **87×87** - iPhone (3x) Settings
- **80×80** - iPad (2x) Spotlight
- **29×29** - iPad Settings
- **20×20** - iPad Notification

## Customization

If you want to modify the logo:
1. Edit `logo.svg` with any vector graphics editor (Figma, Adobe Illustrator, Inkscape, etc.)
2. The logo uses standard SVG elements that are widely supported
3. Key elements are clearly labeled in the SVG for easy modification

## Alternative: Use Xcode's Built-in Feature (Xcode 14+)

Starting with Xcode 14, you can use a single 1024x1024 image:

1. Generate a 1024x1024 PNG from the SVG
2. In Xcode, go to Assets.xcassets → AppIcon
3. In the Attributes Inspector (right panel), select "Single Size"
4. Drag your 1024x1024 PNG into the single slot

Xcode will automatically generate all required sizes!

## Quick Start (Easiest Method)

1. Visit https://www.appicon.co/
2. Upload `logo.svg`
3. Download the zip file
4. Unzip and drag all images to Xcode's AppIcon asset catalog
5. Done! ✅




