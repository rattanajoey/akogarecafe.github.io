#!/bin/bash

# Movie Club Cafe - App Icon Generator
# This script converts the logo.svg to all required iOS app icon sizes

set -e

echo "🎬 Movie Club Cafe - Generating App Icons..."

# Check if ImageMagick is installed
if ! command -v convert &> /dev/null; then
    echo "❌ ImageMagick is not installed."
    echo "Install it with: brew install imagemagick"
    echo ""
    echo "Alternatively, use an online converter:"
    echo "👉 https://www.appicon.co/"
    exit 1
fi

# Create output directory
OUTPUT_DIR="AppIcons"
mkdir -p "$OUTPUT_DIR"

echo "📁 Output directory: $OUTPUT_DIR"

# Generate all required sizes
echo "🎨 Generating icons..."

# App Store
convert -background none logo.svg -resize 1024x1024 "$OUTPUT_DIR/icon-1024.png"
echo "  ✓ 1024x1024 (App Store)"

# iPhone
convert -background none logo.svg -resize 180x180 "$OUTPUT_DIR/icon-180.png"
echo "  ✓ 180x180 (iPhone 3x)"

convert -background none logo.svg -resize 120x120 "$OUTPUT_DIR/icon-120.png"
echo "  ✓ 120x120 (iPhone 2x)"

convert -background none logo.svg -resize 60x60 "$OUTPUT_DIR/icon-60.png"
echo "  ✓ 60x60 (iPhone Notification)"

# iPad
convert -background none logo.svg -resize 167x167 "$OUTPUT_DIR/icon-167.png"
echo "  ✓ 167x167 (iPad Pro)"

convert -background none logo.svg -resize 152x152 "$OUTPUT_DIR/icon-152.png"
echo "  ✓ 152x152 (iPad 2x)"

convert -background none logo.svg -resize 76x76 "$OUTPUT_DIR/icon-76.png"
echo "  ✓ 76x76 (iPad 1x)"

# Spotlight
convert -background none logo.svg -resize 80x80 "$OUTPUT_DIR/icon-80.png"
echo "  ✓ 80x80 (iPad Spotlight 2x)"

convert -background none logo.svg -resize 40x40 "$OUTPUT_DIR/icon-40.png"
echo "  ✓ 40x40 (iPad Spotlight 1x)"

# Settings
convert -background none logo.svg -resize 87x87 "$OUTPUT_DIR/icon-87.png"
echo "  ✓ 87x87 (iPhone Settings 3x)"

convert -background none logo.svg -resize 58x58 "$OUTPUT_DIR/icon-58.png"
echo "  ✓ 58x58 (iPhone Settings 2x)"

convert -background none logo.svg -resize 29x29 "$OUTPUT_DIR/icon-29.png"
echo "  ✓ 29x29 (Settings 1x)"

# Notification
convert -background none logo.svg -resize 20x20 "$OUTPUT_DIR/icon-20.png"
echo "  ✓ 20x20 (Notification 1x)"

echo ""
echo "✅ All icons generated successfully!"
echo ""
echo "📍 Next steps:"
echo "1. Open Xcode"
echo "2. Go to Assets.xcassets → AppIcon"
echo "3. Drag and drop the icons from the $OUTPUT_DIR folder"
echo "4. Match each icon to its corresponding size slot"
echo ""
echo "OR (Xcode 14+):"
echo "1. In Xcode AppIcon, select 'Single Size' in Attributes Inspector"
echo "2. Drag icon-1024.png to the single slot"
echo ""


