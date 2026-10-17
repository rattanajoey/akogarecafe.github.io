# Studio analytics

Open https://akogarecafe.com/dashboard (the GitHub Pages entry redirects to the existing hash router). The exact `akogarecafe.com` domain is authorized for Firebase Google sign-in, alongside the existing movieclub domain; the original domains were preserved.

Google workspace sign-in continues in the same tab at `https://ac-movie-club.firebaseapp.com/#/dashboard`. The dashboard is also hosted there, with its existing Firebase `authDomain` matching the page origin. This avoids the stalled cross-window callback observed in Chrome and the cross-origin storage dependency of redirect sign-in. The app handles `getRedirectResult` on return; it does not pass tokens through URLs. Both hosts call the same protected reporting function. Email/password login remains available on the cafe host.

The public site contains an empty dashboard shell. All shared reports require a Firebase ID token. The `projectAnalytics` callable checks the verified email against `allowedEmails` in the `AKOGARE_ANALYTICS_CONNECTIONS` Secret Manager secret, or a trusted `dashboardViewer` custom claim, before fetching or returning cached data. A legacy Gmail account with an unverified Firebase primary email must instead have a fresh Google sign-in: the function checks the token's Google subject against the server-side Google provider identity and its exact invited Gmail address. An unverified email or password sign-in alone never grants access. A Firestore user document cannot grant dashboard access. Only the owner's two existing Google accounts were initially allowlisted. Add invited readers deliberately through the secret or a server-admin custom claim; never broaden this to all authenticated accounts.

Provider credentials are stored only in that Firebase secret. No provider tokens, member records, private report snapshots or service-account keys belong in Git or static assets. Browser reporting OAuth uses a separate Firebase auth instance, so selecting a YouTube Brand Account does not replace the workspace login. Its transient redirect state uses tab-session storage and is cleared immediately on return, including the secondary Firebase session. The resulting Google access token and reports stay in memory and clear at sign-out, account change or page reload. Google reporting uses the same-tab redirect flow as workspace sign-in; another reporting redirect also ends previous in-memory reporting connections. A Google Analytics token can be reused for the website and iOS source selectors during that page session. Persistent reporting across visits still requires server-side provider authorization.

## Sources and current capabilities

- Akogare Cafe YouTube `UCP77ij2ue_xEz2f5TmH0Rbw`: saved owner connection; live subscriber, lifetime-view and public-video totals.
- Watch Club YouTube `UC6MT4WM8saZSk4B4pt4aFwA`: saved owner connection; the same current totals.
- CineClub Cafe YouTube `UCpilsdPRmwBxCTLxCZmBXDg`: public current totals through the existing read-only YouTube connection. It has no saved owner-analytics authorization yet.
- Cafe Instagram `@akogarecafe`: existing Facebook Login connection; live follower and media totals.
- Watch Club Instagram `@akogarewatchclub`: existing direct Instagram Login connection; live follower and media totals. Its app-scoped Graph ID differs from its Instagram user ID.
- PinDo website: https://pindo.akogarecafe.com.
- CineClub Cafe website: https://movieclub.akogarecafe.com.
- PinDo Pinterest: https://www.pinterest.com/akogarecafestudio/. The account is identified; a browser login is not an API reporting grant.
- Website and iOS activity: select the actual GA4 property and its web/iOS data stream after read-only Google consent. The data report filters both stream ID and platform. Totals use a separate aggregate request so unique active users are not summed across days.
- The Firebase-linked `ac-movie-club` property and its existing web/iOS streams are identified in private configuration. The server attempts read-only reporting with its existing application identity; if Analytics does not authorize it, the owner can use Google consent in the source dialog. Cafe and CineClub web reports additionally filter hostname, because both websites share the Firebase web stream; this prevents the same traffic appearing twice.
- Product account totals: the existing CineClub Firebase project and PinDo service account provide aggregate registered accounts and accounts whose last sign-in is in the selected period. Individual user records never leave the function. Sign-ins are not DAU/MAU or installs.

The saved YouTube tokens have `youtube.readonly` but do not have `yt-analytics.readonly`. The saved Instagram tokens lack Insights permission. These connections are intentionally marked **Limited access**. Their current totals must not be represented as views or growth in the selected period. Google reporting consent can be supplied from each source's setup dialog. Longer-lived owner reporting requires a new offline read-only authorization, stored server-side after consent. Never silently widen publishing tokens.

Pinterest API reporting remains unconnected. The provider adapter supports the exact studio account when its `access_token` is deliberately added to the secret. App Store Connect download, sales and proceeds reports are not implemented or connected. GA4 iOS activity is independent of App Store reports. PinDo's iOS card is prepared for an actual iOS stream; do not imply a released iOS app exists merely because the dashboard has a card.

## Reporting semantics

Dates cover 7, 28 or 90 completed UTC calendar dates, ending yesterday. Providers apply their own property/reporting timezone to those dates; cross-provider day boundaries may differ. YouTube and Instagram content views are separate from Pinterest impressions, website sessions, iOS active users and lifetime totals. Missing values remain null/unknown; true zero remains zero. Coverage labels identify partial totals. Audience counts are a sum of channel followers/subscribers, not deduplicated people. Comparisons appear only with complete current and previous coverage. The backend has a five-minute, authorized-workspace cache. The page refreshes while visible, independently retains errors, and clearly marks retained data stale on failure. A date/account change clears old period data.

CSV exports contain only the visible sources' available metrics and are generated on an explicit click. Snapshot metrics have blank period dates. No private export is uploaded to the repository.

## Server deployment

`firebase.analytics.json` defines an isolated `akogare-analytics` codebase. Deploy only that codebase to `ac-movie-club`; do not deploy/delete the existing club functions. Runtime: Node 22, first generation, us-central1, maximum three instances, 60-second timeout. The caller endpoint is fixed in `src/components/Dashboard/api.js`.

Install server libraries with `npm ci --prefix analytics-functions`, test with `npm test --prefix analytics-functions`, and deploy with `firebase deploy --config firebase.analytics.json --only functions:akogare-analytics --project ac-movie-club --non-interactive`. Secrets are configured separately with the supported Firebase CLI stdin mechanism; never put their values in command arguments or tracked files.

The site's normal `main` branch workflow tests and publishes the client to GitHub Pages. Publish the same tested build to the secure workspace with `firebase deploy --config firebase.analytics.json --only hosting --project ac-movie-club --non-interactive`. The Firebase hosting site had no deployed public app before this dashboard. Its pages have an `X-Robots-Tag: noindex, nofollow` header. Changing server source also requires the separate Firebase functions deployment above. A Git push alone does not update the function or Firebase-hosted client.
