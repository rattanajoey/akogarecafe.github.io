# Codot dashboard monitoring

The owner's dot (Codot) can review aggregate reports through the existing
**Dashboard GPT** chat. A daily heartbeat in that chat performs the reads and
evaluates useful changes; it does not publish content or change the projects.
Local checks require this Mac online, its login Keychain unlocked after restart,
and the ChatGPT desktop app running. This is not an always-on cloud monitor.
The current tool cannot open the app's own Codot controls, so the schedule is
attached to this chat rather than directly assigned inside Codot's conversation.

## Read-only access

`codotAnalytics` is a separate HTTPS reader in `ac-movie-club`, in the existing
isolated analytics codebase. It accepts only `POST {"days": 1|7|28}` and returns
explicitly selected aggregate fields from the same reporting service used by
the dashboard. It cannot accept publishing, billing, customer-list, connection
management or arbitrary provider queries. Invalid or anonymous calls fail
before provider access. Provider credentials never reach the reader.

A random 256-bit capability is stored in the Mac's login Keychain under
`com.akogare.analytics.codot / aggregate-reader`. Only its SHA-256 hash, enabled
flag, read-only scope and 90-day expiration are stored in `codotReader` inside
the existing private Firebase configuration. No Google account or Firebase app
identity is created for this capability, so it cannot sign in to the other apps.
This is narrower than giving the monitor an ordinary Firebase user session.

The function retrieves the current reader registry from Secret Manager before
every request, including cached report responses. An administrator can revoke
it immediately by saving a new configuration version with
`codotReader.enabled = false`; no function deployment is needed. Rotate the
Keychain value and stored hash together. Never print the Keychain value or put
it in a URL, command argument, browser storage, source file or automation prompt.
The local helper alerts when fewer than 14 days remain before expiry.

Normal workspace readers continue to use Firebase ID tokens. Their live user
record is checked on every request for disabled identities, revoked sessions
and removed viewer claims, before accessing the report cache.

## Running checks

Run `node scripts/codot-monitor.mjs` from this checkout. It retrieves the
dashboard-only key internally and saves private aggregate snapshots under
`/Users/rattanajoey/Documents/Codex/Private/akogare-monitor/`. The directory is
private to the local user; report files use mode 0600. It keeps the latest
successful report, a review file and up to 90 daily snapshots. It does not
overwrite successful reports on failure. A normal second run on the same UTC
date reuses the saved snapshot; `--refresh` is for a deliberate manual recheck.

`scripts/codot-keychain.py get` is only an internal helper: its output is a
credential. Do not run it in a tool that displays stdout. It needs local
Keychain access, and the monitoring command needs network access. Do not fall
back to the developer's Firebase administrator credentials if reader access
fails. Report the blocker instead.

## Coverage and interpretation

The reader includes all 14 source cards across Cafe, Watch Club, PinDo,
CineClub and the Etsy studio shop. Available numbers include YouTube activity,
subscribers and estimated revenue; current Instagram totals; website/CineClub
iOS usage; product-account totals; finalized organic Pinterest reports;
Patreon membership and lifetime support; Stripe payment activity; and Etsy
orders, item sales, buyer refunds and processing fees. Availability is reported
per field. PinDo iOS and App Store sales/downloads are not connected.

Every source keeps its actual fetch timestamp, returned-through date and
comparison span. Yesterday is a completed calendar day, not a rolling 24-hour
window. YouTube can lag 48–72 hours. Pinterest excludes unfinished reporting
days. Instagram period Insights remain unavailable. PinDo web history begins
October 17, 2026; recorded social history begins October 25 (X October 26).
Missing observations are not backfilled. Rounded YouTube subscriber counts
must not replace native subscriber gains/losses.

X stays a dated manual snapshot with **no paid API access or background X
requests**. Repeated dashboard checks preserve its original observation time.

Keep currencies and reporting bases separate. Patreon lifetime support is not
period income; Stripe activity and Etsy sales are not business profit. Foreign
Etsy processing fees preserve their original currency and include a separately
labelled approximate USD value with the ECB reference rate and rate date.
Unavailable or stale exchange rates remain unknown.

## Suggestions and notifications

Check yesterday for operational context and compare 7 and 28 days for trends.
On Mondays review the weekly pattern and recommend at most three specific,
low-cost experiments. Explain the evidence, dates, baseline, uncertainty and
how to measure each experiment. Aggregate channel reports do not establish
which individual video, post or product caused a change; do not invent that
attribution or recommend a specific upload from these reports alone.

Treat changes as candidates for review, not automatic conclusions. The helper
screens for substantial absolute differences and percentage changes; the
agent must still consider small samples, incomplete spans, seasonality and
provider delays. Missing values are unknown, never zero. Do not combine
incompatible audiences, revenue bases or currencies. Stay quiet for unchanged
or non-actionable findings. Notify for meaningful changes, broken connections,
useful new recommendations or required owner action. Deduplicate repeated
alerts and suggestions using the local review history.

Monitoring grants no authority to purchase API credits, expand permissions,
publish, edit billing, send messages to other people or implement its own
recommendations. Those remain separate user decisions.
