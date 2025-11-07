#!/bin/bash

# Movie Club Cafe - Quick App Icon Generator
# Generates a single 1024x1024 icon for modern Xcode projects

set -e

echo "🎬 Movie Club Cafe - Generating App Icon..."

# Check if ImageMagick is installed
if ! command -v convert &> /dev/null; then
    echo "❌ ImageMagick is not installed."
    echo ""
    echo "Install it with:"
    echo "  brew install imagemagick"
    echo ""
    echo "Alternatively:"
    echo "  1. Open logo.svg in Safari"
    echo "  2. Save as PDF or take screenshot at high resolution"
    echo "  3. Use https://www.appicon.co/ to convert"
    echo ""
    exit 1
fi

# Generate the 1024x1024 icon
OUTPUT_FILE="Movie Club Cafe/Assets.xcassets/AppIcon.appiconset/icon-1024.png"

echo "🎨 Generating 1024x1024 app icon..."
convert -background none logo.svg -resize 1024x1024 "$OUTPUT_FILE"

echo "✅ App icon generated successfully!"
echo "📍 Location: $OUTPUT_FILE"
echo ""
echo "Next steps:"
echo "1. Open the Xcode project"
echo "2. The icon should already be in place!"
echo "3. Build and run to see your new app icon 🎉"
echo ""




