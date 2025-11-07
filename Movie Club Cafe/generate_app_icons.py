#!/usr/bin/env python3
"""
Generate iOS App Icons from SVG
Creates all required sizes for iOS app icons
"""

import subprocess
import os
import json

# Required iOS app icon sizes
ICON_SIZES = [
    (1024, "ios-marketing", "1024x1024"),
    (180, "iphone", "60x60@3x"),
    (120, "iphone", "60x60@2x"),
    (120, "iphone", "40x40@3x"),
    (87, "iphone", "29x29@3x"),
    (80, "iphone", "40x40@2x"),
    (76, "ipad", "76x76@1x"),
    (60, "iphone", "20x20@3x"),
    (58, "iphone", "29x29@2x"),
    (40, "iphone", "20x20@2x"),
    (40, "ipad", "20x20@2x"),
    (29, "iphone", "29x29@1x"),
    (20, "iphone", "20x20@1x"),
]

def generate_icons():
    """Generate all app icon sizes from the SVG"""
    
    # Paths
    script_dir = os.path.dirname(os.path.abspath(__file__))
    svg_path = os.path.join(script_dir, "logo.svg")
    output_dir = os.path.join(script_dir, "Movie Club Cafe", "Assets.xcassets", "AppIcon.appiconset")
    
    # Create output directory if it doesn't exist
    os.makedirs(output_dir, exist_ok=True)
    
    print(f"🎬 Generating app icons from {svg_path}")
    print(f"📁 Output directory: {output_dir}")
    
    # Check if we have rsvg-convert or cairosvg
    has_rsvg = subprocess.run(["which", "rsvg-convert"], capture_output=True).returncode == 0
    has_cairosvg = subprocess.run(["which", "cairosvg"], capture_output=True).returncode == 0
    has_inkscape = subprocess.run(["which", "inkscape"], capture_output=True).returncode == 0
    
    if not (has_rsvg or has_cairosvg or has_inkscape):
        print("❌ Error: No SVG converter found!")
        print("Please install one of:")
        print("  - rsvg-convert: brew install librsvg")
        print("  - cairosvg: pip install cairosvg")
        print("  - inkscape: brew install inkscape")
        return False
    
    # Generate each size
    images_list = []
    for size, idiom, scale_name in ICON_SIZES:
        output_file = f"icon-{size}.png"
        output_path = os.path.join(output_dir, output_file)
        
        print(f"📷 Generating {output_file} ({size}x{size})...")
        
        try:
            if has_rsvg:
                cmd = [
                    "rsvg-convert",
                    "-w", str(size),
                    "-h", str(size),
                    "-o", output_path,
                    svg_path
                ]
            elif has_inkscape:
                cmd = [
                    "inkscape",
                    "--export-filename=" + output_path,
                    "--export-width=" + str(size),
                    "--export-height=" + str(size),
                    svg_path
                ]
            else:  # cairosvg
                import cairosvg
                cairosvg.svg2png(
                    url=svg_path,
                    write_to=output_path,
                    output_width=size,
                    output_height=size
                )
                cmd = None
            
            if cmd:
                result = subprocess.run(cmd, capture_output=True, text=True)
                if result.returncode != 0:
                    print(f"  ⚠️  Warning: {result.stderr}")
            
            # Add to Contents.json list
            images_list.append({
                "filename": output_file,
                "idiom": idiom,
                "scale": scale_name.split("@")[1] if "@" in scale_name else "1x",
                "size": scale_name.split("@")[0] if "@" in scale_name else f"{size}x{size}"
            })
            
            print(f"  ✅ Created {output_file}")
            
        except Exception as e:
            print(f"  ❌ Error creating {output_file}: {e}")
    
    # Create Contents.json
    contents = {
        "images": images_list,
        "info": {
            "author": "xcode",
            "version": 1
        }
    }
    
    contents_path = os.path.join(output_dir, "Contents.json")
    with open(contents_path, 'w') as f:
        json.dump(contents, f, indent=2)
    
    print(f"\n✅ Generated {len(images_list)} app icons!")
    print(f"📝 Created Contents.json")
    print("\n🎉 App icon set is ready!")
    return True

if __name__ == "__main__":
    success = generate_icons()
    exit(0 if success else 1)

