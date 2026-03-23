# USCF Affiliate Event Notifier

Posts new USCF-rated chess tournament results to a Discord channel via webhook. Runs on AWS Lambda, scheduled hourly via EventBridge, with DynamoDB tracking which events have already been posted.

## Architecture

- **Lambda** — runs the notifier logic every hour
- **EventBridge Schedule** — triggers the Lambda on a `rate(1 hour)` schedule
- **DynamoDB** — stores sent event IDs to avoid duplicate posts
- **Discord Webhook** — receives formatted event messages

All infrastructure is defined in `template.yaml` (AWS SAM).

## Project Structure

| Path | Description |
|------|-------------|
| `template.yaml` | SAM template — Lambda, DynamoDB table, EventBridge rule, IAM |
| `src/index.js` | Lambda handler — orchestrates fetch, filter, send |
| `src/fetchAffiliateEvents.js` | Fetches events from the US Chess ratings API |
| `src/formatEventMessage.js` | Formats an event into a Discord message |
| `src/sendToDiscord.js` | Posts a message to Discord via webhook |
| `src/sentEvents.js` | DynamoDB read/write for tracking sent event IDs |

## Prerequisites

- [AWS SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html)
- [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html) configured with credentials
- Node.js 20+

## Deploy

### 1. Install Lambda dependencies

```sh
npm install --prefix src
```

### 2. Build

```sh
sam build
```

### 3. Deploy (first time — guided)

```sh
sam deploy --guided
```

SAM will prompt you for:

| Parameter | What to enter |
|-----------|---------------|
| Stack Name | e.g. `uscf-event-notifier` |
| AWS Region | your preferred region, e.g. `us-east-1` |
| DiscordWebhookUrl | your full Discord webhook URL |
| Confirm changes before deploy | `y` (recommended) |
| Allow SAM CLI IAM role creation | `y` |
| Save arguments to samconfig.toml | `y` (so future deploys just need `sam deploy`) |

### 4. Subsequent deploys

```sh
sam build && sam deploy
```

## Configuration

### Subscribed Affiliates

The affiliate IDs are set via the `SUBSCRIBED_AFFILIATES` environment variable in `template.yaml` (comma-separated):

```yaml
SUBSCRIBED_AFFILIATES: 'A6033006,A9630067'
```

Edit this list and redeploy to track different affiliates.

### Discord Webhook URL

Passed as a CloudFormation parameter during deploy. To update it:

```sh
sam deploy --parameter-overrides DiscordWebhookUrl=https://discord.com/api/webhooks/new/url
```

### Schedule

The EventBridge rule is set to `rate(1 hour)` in `template.yaml`. Change it to any valid [schedule expression](https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-scheduled-rule-pattern.html), e.g.:
- `rate(30 minutes)`
- `cron(0 */2 * * ? *)` (every 2 hours)

## AWS Console Steps

Most of the setup is handled by SAM, but there are a couple of things to verify or do in the console:

### Verify the deployment

1. Open the [CloudFormation console](https://console.aws.amazon.com/cloudformation)
2. Find your stack (e.g. `uscf-event-notifier`)
3. Check the status is `CREATE_COMPLETE` or `UPDATE_COMPLETE`
4. Go to the **Outputs** tab to see the Lambda ARN and DynamoDB table name

### Monitor Lambda executions

1. Open the [Lambda console](https://console.aws.amazon.com/lambda)
2. Find the function (it will be named like `uscf-event-notifier-NotifierFunction-...`)
3. Go to the **Monitor** tab to see invocation metrics
4. Click **View CloudWatch Logs** to see detailed execution logs

### Check the EventBridge schedule

1. Open the [EventBridge console](https://console.aws.amazon.com/events)
2. Go to **Rules** in the left sidebar
3. You should see a rule associated with your stack that triggers every hour
4. You can disable/enable it here if needed

### Inspect DynamoDB data

1. Open the [DynamoDB console](https://console.aws.amazon.com/dynamodb)
2. Go to **Tables** → `uscf-sent-events`
3. Click **Explore table items** to see which event IDs have been recorded

### Test the Lambda manually

1. In the Lambda console, click **Test**
2. Create a test event with any JSON (e.g. `{}`) — the handler ignores the event payload
3. Click **Test** to run it immediately and see the output

## Teardown

To remove all AWS resources:

```sh
sam delete
```

This deletes the Lambda, DynamoDB table, EventBridge rule, and all associated IAM roles.
