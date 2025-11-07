# Google Calendar Integration Setup

This guide will help you set up the Google Calendar API integration for the Movie Club Cafe app.

## Prerequisites

- A Google Cloud Console account
- Access to the Google Calendar you want to sync with

## Step 1: Create a Google Cloud Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Note down your project ID

## Step 2: Enable the Google Calendar API

1. In the Google Cloud Console, navigate to **APIs & Services** > **Library**
2. Search for "Google Calendar API"
3. Click on "Google Calendar API" and click **Enable**

## Step 3: Create API Credentials

1. Navigate to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **API Key**
3. Copy the API key that's generated
4. (Recommended) Click **Restrict Key** to limit usage:
   - Under "API restrictions", select "Restrict key"
   - Select "Google Calendar API" from the dropdown
   - Under "Application restrictions", you can restrict by iOS apps and add your bundle identifier: `com.example.Movie-Club-Cafe` (or your actual bundle ID)

## Step 4: Configure Calendar Access

### Making Your Calendar Public (for read-only access):

1. Open Google Calendar in your web browser
2. Find the calendar you want to share (the one in your URL: `264fe0133d1987fb2521b72fb86677f8a45c9a6604b7fc51b44ddf72a907ebdf@group.calendar.google.com`)
3. Click the three dots next to the calendar name
4. Select **Settings and sharing**
5. Scroll to **Access permissions for events**
6. Check the box **Make available to public**
7. Keep the permission as "See all event details"

## Step 5: Add API Key to Your App

### Option 1: Environment Variable (Recommended for local development)

1. In Xcode, select your scheme (Product > Scheme > Edit Scheme...)
2. Select "Run" in the left sidebar
3. Go to the "Arguments" tab
4. Under "Environment Variables", click the "+" button
5. Add:
   - Name: `GOOGLE_CALENDAR_API_KEY`
   - Value: Your API key from Step 3

### Option 2: Hardcode in Source (Not recommended for public repositories)

1. Open `Movie Club Cafe/Services/GoogleCalendarService.swift`
2. Find the line:
   ```swift
   return "YOUR_GOOGLE_CALENDAR_API_KEY"
   ```
3. Replace `YOUR_GOOGLE_CALENDAR_API_KEY` with your actual API key
4. ⚠️ **Warning**: Don't commit this change to public repositories

### Option 3: Use a Config File (Recommended for production)

1. Create a new file `Movie Club Cafe/Config/GoogleCalendarConfig.plist`
2. Add the following content:
   ```xml
   <?xml version="1.0" encoding="UTF-8"?>
   <!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
   <plist version="1.0">
   <dict>
       <key>API_KEY</key>
       <string>YOUR_API_KEY_HERE</string>
   </dict>
   </plist>
   ```
3. Add this file to `.gitignore`
4. Update the `GoogleCalendarService.swift` to read from this file

## Step 6: Test the Integration

1. Build and run the app
2. Navigate to the Movie Club screen
3. Click the "Sync Calendar" button in the header
4. You should see a success message if movies are matched with calendar events

## Troubleshooting

### Error: "Invalid Google Calendar API key"

- Double-check that you copied the API key correctly
- Ensure the Google Calendar API is enabled in your Google Cloud Console
- If you restricted the API key, make sure it allows the Google Calendar API

### Error: "No events found in calendar"

- Make sure the calendar is public and has events
- Check that the date range of events matches the current month or future months
- Verify the calendar ID in `GoogleCalendarService.swift` matches your calendar

### No matching events found

- Ensure the movie titles in your Firebase database match (or are similar to) the event names in your calendar
- The matching algorithm looks for:
  - Exact matches (case-insensitive)
  - Fuzzy matches (at least 50% of words in the title must match)
- Try renaming calendar events to match movie titles more closely

## Calendar Event Naming Best Practices

To ensure proper matching:

1. Use the full movie title in the calendar event summary
2. Format: `Movie: [Title]` (e.g., "Movie: The Shawshank Redemption")
3. Include relevant details in the event description
4. Set the correct time zone (America/Los_Angeles as specified in your calendar)

## How It Works

1. The app fetches events from your Google Calendar via the REST API
2. It compares movie titles from your Firebase database with calendar event names
3. When a match is found, it syncs:
   - Event date and time
   - Event description
   - Event location
4. This data is saved back to Firebase and displayed in the app

## Security Best Practices

- Never commit API keys to version control
- Use environment variables or secure configuration files
- Consider implementing OAuth 2.0 for production apps
- Regularly rotate your API keys
- Monitor API usage in the Google Cloud Console

## Additional Resources

- [Google Calendar API Documentation](https://developers.google.com/calendar)
- [Google Cloud Console](https://console.cloud.google.com/)
- [API Key Best Practices](https://cloud.google.com/docs/authentication/api-keys)
