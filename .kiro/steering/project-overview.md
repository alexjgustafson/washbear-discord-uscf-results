# Project Overview

This is the USCF Affiliate Event Notifier — a serverless application that posts new US Chess tournament results to a Discord channel.

## How It Works

1. An EventBridge rule triggers a Lambda function every hour.
2. The Lambda fetches recent events from the US Chess ratings API for a list of subscribed affiliate IDs.
3. It checks each event against a DynamoDB table to see if it's already been posted.
4. New events are formatted into Discord-flavored markdown messages and sent via a Discord webhook.
5. Successfully posted events are recorded in DynamoDB to prevent duplicates.

## Key Concepts

- **Seed mode**: Invoked with `{ "seed": true }` to mark all current events as sent without posting to Discord. Useful for initial setup so existing events aren't blasted into the channel.
- **Rate limiting**: The handler respects Discord's rate limits (5 per 2s for small batches, 30 per 60s for large ones) by inserting delays between sends.
- **Affiliate IDs**: Comma-separated list in the `SUBSCRIBED_AFFILIATES` environment variable. These are US Chess affiliate codes (e.g. `A6033006`).

## Infrastructure

All infrastructure is defined in `template.yaml` using AWS SAM:
- Lambda function (Node.js 24.x, ESM)
- DynamoDB table (`uscf-sent-events`, on-demand billing, partition key `eventId`)
- EventBridge schedule rule (`rate(1 hour)`)
- IAM policies via SAM's `DynamoDBCrudPolicy`

## Environment Variables

| Variable | Source | Description |
|----------|--------|-------------|
| `DISCORD_WEBHOOK_URL` | CloudFormation parameter | Discord webhook endpoint |
| `SENT_EVENTS_TABLE` | `!Ref SentEventsTable` | DynamoDB table name |
| `SUBSCRIBED_AFFILIATES` | Hardcoded in template | Comma-separated affiliate IDs |
