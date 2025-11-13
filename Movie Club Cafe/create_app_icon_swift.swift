#!/usr/bin/env swift

import Foundation
import AppKit

// Create app icon programmatically
func createAppIcon(size: CGFloat, outputPath: String) {
    let image = NSImage(size: NSSize(width: size, height: size))
    
    image.lockFocus()
    
    // Background gradient
    let gradient = NSGradient(colors: [
        NSColor(red: 0.824, green: 0.824, blue: 0.796, alpha: 1.0), // #d2d2cb
        NSColor(red: 0.302, green: 0.412, blue: 0.365, alpha: 1.0)  // #4d695d
    ])
    gradient?.draw(in: NSRect(x: 0, y: 0, width: size, height: size), angle: -90)
    
    let accentColor = NSColor(red: 0.737, green: 0.145, blue: 0.176, alpha: 1.0) // #bc252d
    let darkColor = NSColor(red: 0.173, green: 0.173, blue: 0.173, alpha: 1.0) // #2c2c2c
    
    // Film reel
    let filmReelCenter = NSPoint(x: size * 0.5, y: size * 0.65)
    let filmReelRadius = size * 0.15
    
    // Outer ring
    let outerRing = NSBezierPath()
    outerRing.appendArc(withCenter: filmReelCenter, radius: filmReelRadius, startAngle: 0, endAngle: 360)
    outerRing.lineWidth = size * 0.024
    darkColor.setStroke()
    outerRing.stroke()
    
    accentColor.setStroke()
    outerRing.lineWidth = size * 0.008
    outerRing.stroke()
    
    // Inner hub
    let innerHub = NSBezierPath()
    innerHub.appendArc(withCenter: filmReelCenter, radius: size * 0.05, startAngle: 0, endAngle: 360)
    darkColor.setFill()
    innerHub.fill()
    
    accentColor.setStroke()
    innerHub.lineWidth = size * 0.004
    innerHub.stroke()
    
    // Film holes
    let holeRadius = size * 0.015
    let angles: [CGFloat] = [0, 45, 90, 135, 180, 225, 270, 315]
    for angle in angles {
        let radian = angle * .pi / 180
        let x = filmReelCenter.x + filmReelRadius * cos(radian)
        let y = filmReelCenter.y + filmReelRadius * sin(radian)
        let hole = NSBezierPath()
        hole.appendArc(withCenter: NSPoint(x: x, y: y), radius: holeRadius, startAngle: 0, endAngle: 360)
        accentColor.setFill()
        hole.fill()
    }
    
    // Coffee cup
    let cupCenter = NSPoint(x: size * 0.5, y: size * 0.28)
    let cupPath = NSBezierPath()
    cupPath.move(to: NSPoint(x: cupCenter.x - size * 0.12, y: cupCenter.y + size * 0.08))
    cupPath.line(to: NSPoint(x: cupCenter.x - size * 0.10, y: cupCenter.y - size * 0.08))
    cupPath.line(to: NSPoint(x: cupCenter.x + size * 0.10, y: cupCenter.y - size * 0.08))
    cupPath.line(to: NSPoint(x: cupCenter.x + size * 0.12, y: cupCenter.y + size * 0.08))
    cupPath.close()
    darkColor.setFill()
    cupPath.fill()
    accentColor.setStroke()
    cupPath.lineWidth = size * 0.008
    cupPath.stroke()
    
    // Coffee surface (ellipse)
    let coffeeSurface = NSBezierPath()
    let coffeeRect = NSRect(
        x: cupCenter.x - size * 0.12,
        y: cupCenter.y + size * 0.06,
        width: size * 0.24,
        height: size * 0.04
    )
    coffeeSurface.appendOval(in: coffeeRect)
    accentColor.setFill()
    coffeeSurface.fill()
    
    // Steam
    let steamPath1 = NSBezierPath()
    steamPath1.move(to: NSPoint(x: cupCenter.x - size * 0.06, y: cupCenter.y + size * 0.10))
    steamPath1.curve(
        to: NSPoint(x: cupCenter.x - size * 0.06, y: cupCenter.y + size * 0.16),
        controlPoint1: NSPoint(x: cupCenter.x - size * 0.07, y: cupCenter.y + size * 0.14),
        controlPoint2: NSPoint(x: cupCenter.x - size * 0.07, y: cupCenter.y + size * 0.14)
    )
    NSColor(white: 0.9, alpha: 0.7).setStroke()
    steamPath1.lineWidth = size * 0.006
    steamPath1.lineCapStyle = .round
    steamPath1.stroke()
    
    let steamPath2 = NSBezierPath()
    steamPath2.move(to: NSPoint(x: cupCenter.x, y: cupCenter.y + size * 0.10))
    steamPath2.curve(
        to: NSPoint(x: cupCenter.x, y: cupCenter.y + size * 0.18),
        controlPoint1: NSPoint(x: cupCenter.x - size * 0.01, y: cupCenter.y + size * 0.15),
        controlPoint2: NSPoint(x: cupCenter.x - size * 0.01, y: cupCenter.y + size * 0.15)
    )
    steamPath2.lineWidth = size * 0.006
    steamPath2.lineCapStyle = .round
    steamPath2.stroke()
    
    let steamPath3 = NSBezierPath()
    steamPath3.move(to: NSPoint(x: cupCenter.x + size * 0.06, y: cupCenter.y + size * 0.10))
    steamPath3.curve(
        to: NSPoint(x: cupCenter.x + size * 0.06, y: cupCenter.y + size * 0.16),
        controlPoint1: NSPoint(x: cupCenter.x + size * 0.05, y: cupCenter.y + size * 0.14),
        controlPoint2: NSPoint(x: cupCenter.x + size * 0.05, y: cupCenter.y + size * 0.14)
    )
    steamPath3.lineWidth = size * 0.006
    steamPath3.lineCapStyle = .round
    steamPath3.stroke()
    
    image.unlockFocus()
    
    // Save as PNG
    if let tiffData = image.tiffRepresentation,
       let bitmapImage = NSBitmapImageRep(data: tiffData),
       let pngData = bitmapImage.representation(using: .png, properties: [:]) {
        try? pngData.write(to: URL(fileURLWithPath: outputPath))
    }
}

// Generate all required sizes
let sizes: [(Int, String, String)] = [
    (1024, "ios-marketing", "icon-1024.png"),
    (180, "iphone", "icon-180.png"),
    (167, "ipad", "icon-167.png"),
    (152, "ipad", "icon-152.png"),
    (120, "iphone", "icon-120.png"),
    (87, "iphone", "icon-87.png"),
    (80, "iphone", "icon-80.png"),
    (76, "ipad", "icon-76.png"),
    (60, "iphone", "icon-60.png"),
    (58, "iphone", "icon-58.png"),
    (40, "iphone", "icon-40.png"),
    (29, "iphone", "icon-29.png"),
    (20, "iphone", "icon-20.png"),
]

let outputDir = "Movie Club Cafe/Assets.xcassets/AppIcon.appiconset"
try? FileManager.default.createDirectory(atPath: outputDir, withIntermediateDirectories: true, attributes: nil)

print("🎬 Generating app icons...")
for (size, _, filename) in sizes {
    let path = "\(outputDir)/\(filename)"
    createAppIcon(size: CGFloat(size), outputPath: path)
    print("✅ Created \(filename)")
}

print("\n🎉 All app icons generated!")

