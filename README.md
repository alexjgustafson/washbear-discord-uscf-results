# USCF Affiliate Event Notifier

Posts new USCF-rated chess tournament results to a Discord channel via webhook.

## How It Works

1. Fetches recent events for a list of USCF affiliate IDs from the [US Chess ratings API](https://ratings-api.uschess.org).
2. Filters out events that have already been posted (tracked in a local `sentEvents.json` file).
3. Sends a formatted message to Discord for each new event, with links to the event and affiliate pages on [ratings.uschess.org](https://ratings.uschess.org).
4. Respects Discord webhook rate limits (5/2s and 30/min) by dynamically adjusting the delay between messages.

## Setup

1. Clone the repo
2. Edit the `subscribedAffiliates` array in `main.js` with the USCF affiliate IDs you want to track
3. Set the `DISCORD_WEBHOOK_URL` environment variable to your Discord webhook URL

## Usage

```sh
node main.js
```

On first run, all events are treated as new. Subsequent runs will only post events that haven't been sent before.

## Project Structure

| File | Description |
|------|-------------|
| `main.js` | Entry point — fetches events, filters duplicates, sends to Discord |
| `fetchAffiliateEvents.js` | Fetches events for a given affiliate ID from the US Chess API |
| `formatEventMessage.js` | Formats an event object into a Discord message string |
| `sendToDiscord.js` | Posts a message to Discord via webhook |
| `sentEvents.json` | Auto-generated file tracking previously sent event IDs (gitignored) |
