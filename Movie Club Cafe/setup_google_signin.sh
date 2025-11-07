#!/bin/bash

# Google Sign In Setup Script for Movie Club Cafe
# This script helps configure Google Sign In for the iOS app

echo "🔧 Google Sign In Setup for Movie Club Cafe"
echo "==========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get the directory of this script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_DIR="$SCRIPT_DIR"

echo "📁 Project Directory: $PROJECT_DIR"
echo ""

# Step 1: Check if GoogleService-Info.plist exists
echo "Step 1: Checking GoogleService-Info.plist..."
if [ -f "$PROJECT_DIR/Movie Club Cafe/Config/GoogleService-Info.plist" ]; then
    echo -e "${GREEN}✅ GoogleService-Info.plist found${NC}"
    
    # Extract CLIENT_ID and REVERSED_CLIENT_ID
    CLIENT_ID=$(plutil -extract CLIENT_ID raw "$PROJECT_DIR/Movie Club Cafe/Config/GoogleService-Info.plist" 2>/dev/null)
    REVERSED_CLIENT_ID=$(plutil -extract REVERSED_CLIENT_ID raw "$PROJECT_DIR/Movie Club Cafe/Config/GoogleService-Info.plist" 2>/dev/null)
    
    echo "   Client ID: $CLIENT_ID"
    echo "   Reversed Client ID: $REVERSED_CLIENT_ID"
else
    echo -e "${RED}❌ GoogleService-Info.plist not found${NC}"
    exit 1
fi
echo ""

# Step 2: Instructions to add GoogleSignIn package
echo "Step 2: Add GoogleSignIn Swift Package"
echo -e "${YELLOW}⚠️  You need to do this manually in Xcode:${NC}"
echo ""
echo "1. Open Xcode:"
echo "   open \"$PROJECT_DIR/Movie Club Cafe.xcodeproj\""
echo ""
echo "2. In Xcode:"
echo "   - Select the project in the navigator (top item)"
echo "   - Select 'Movie Club Cafe' target"
echo "   - Go to 'Package Dependencies' tab"
echo "   - Click the '+' button"
echo "   - Search for: https://github.com/google/GoogleSignIn-iOS"
echo "   - Select version: Up to Next Major (7.0.0 or later)"
echo "   - Click 'Add Package'"
echo "   - Check 'GoogleSignIn' and 'GoogleSignInSwift'"
echo "   - Click 'Add Package' again"
echo ""
echo -e "${BLUE}Press Enter when you've added the package...${NC}"
read

# Step 3: Add URL Scheme
echo ""
echo "Step 3: Add URL Scheme for Google Sign In"
echo -e "${YELLOW}⚠️  You need to do this manually in Xcode:${NC}"
echo ""
echo "1. In Xcode (if not still open):"
echo "   - Select the project → Target → Info tab"
echo "   - Expand 'URL Types' section"
echo "   - Click '+' to add a new URL Type"
echo ""
echo "2. Fill in these values:"
echo "   URL Schemes: $REVERSED_CLIENT_ID"
echo "   Identifier: com.google.signin"
echo "   Role: Editor"
echo ""
echo -e "${BLUE}Press Enter when you've added the URL scheme...${NC}"
read

# Step 4: Add Apple Sign In Capability
echo ""
echo "Step 4: Add Sign in with Apple Capability"
echo -e "${YELLOW}⚠️  You need to do this manually in Xcode:${NC}"
echo ""
echo "1. In Xcode:"
echo "   - Select the project → Target"
echo "   - Go to 'Signing & Capabilities' tab"
echo "   - Click '+ Capability'"
echo "   - Search for 'Sign in with Apple'"
echo "   - Click to add it"
echo ""
echo -e "${BLUE}Press Enter when you've added the capability...${NC}"
read

# Step 5: Test the setup
echo ""
echo "Step 5: Build the project"
echo "Building to verify everything compiles..."
echo ""

cd "$PROJECT_DIR"
xcodebuild \
    -project "Movie Club Cafe.xcodeproj" \
    -scheme "Movie Club Cafe" \
    -sdk iphonesimulator \
    -configuration Debug \
    build \
    CODE_SIGN_IDENTITY="" \
    CODE_SIGNING_REQUIRED=NO \
    2>&1 | grep -E "(error:|warning:|BUILD SUCCEEDED|BUILD FAILED)" | head -20

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ Build completed!${NC}"
else
    echo ""
    echo -e "${RED}❌ Build had issues - check the output above${NC}"
fi

# Summary
echo ""
echo "========================================="
echo "🎉 Setup Complete!"
echo "========================================="
echo ""
echo "Next steps:"
echo "1. Run the app in Xcode"
echo "2. Test Apple Sign In button"
echo "3. Test Google Sign In button"
echo ""
echo "Troubleshooting:"
echo "- If Google Sign In doesn't work, verify the URL scheme matches exactly"
echo "- If Apple Sign In doesn't work, check the capability was added correctly"
echo "- Check the console for any error messages"
echo ""
echo "For more details, see: GOOGLE_APPLE_AUTH_SETUP.md"
echo ""

