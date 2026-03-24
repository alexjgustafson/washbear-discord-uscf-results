# Build & Deploy

## Prerequisites

- AWS SAM CLI installed
- AWS CLI configured with valid credentials
- Node.js 20+

## Commands

### Install dependencies

```sh
npm install --prefix src
```

### Build

```sh
sam build
```

This outputs the build artifact to `.aws-sam/build/`.

### Deploy

```sh
sam deploy
```

Uses settings from `samconfig.toml`. For first-time setup or to change parameters:

```sh
sam deploy --guided
```

### Update the Discord webhook URL without redeploying code

```sh
sam deploy --parameter-overrides DiscordWebhookUrl=<new-url>
```

### Tear down all resources

```sh
sam delete
```

## Deployment Notes

- The stack name and S3 prefix are defined in `samconfig.toml` — edit there if you need to change them.
- `confirm_changeset = true` means SAM will show you what's changing and ask for confirmation before applying.
- The `DiscordWebhookUrl` parameter is marked `NoEcho: true` in the template so it won't appear in CloudFormation console outputs or logs.
- Dependencies live in `src/node_modules` and are packaged by SAM from the `src/` directory. There is no root-level `node_modules`.

## Testing Locally

There is no local test harness or test suite. To test:

1. Deploy the stack.
2. Invoke the Lambda manually from the AWS console with `{}` as the test event (or `{ "seed": true }` for seed mode).
3. Check CloudWatch Logs for output.

## SAM Template Changes

When modifying `template.yaml`:
- Run `sam validate` to check for syntax errors before deploying.
- Run `sam build` before `sam deploy` — SAM deploys from the `.aws-sam/build/` directory, not directly from `src/`.
