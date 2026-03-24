# Coding Conventions

## Language & Runtime

- Node.js 24.x with native ESM (`"type": "module"` in package.json)
- All imports use explicit `.js` file extensions: `import { foo } from './foo.js'`
- No TypeScript, no transpilation, no bundler — plain JavaScript shipped directly to Lambda

## Module Style

- One export per file, each file has a single responsibility:
  - `fetchAffiliateEvents.js` — API calls to US Chess
  - `formatEventMessage.js` — pure formatting logic
  - `sendToDiscord.js` — Discord webhook HTTP calls
  - `sentEvents.js` — DynamoDB read/write for deduplication
  - `index.js` — Lambda handler, orchestration only
- Named exports only (no default exports)

## Dependencies

- Only two dependencies: `@aws-sdk/client-dynamodb` and `@aws-sdk/lib-dynamodb`
- Use the native `fetch` API (available in Node.js 24.x) for HTTP calls — no axios, node-fetch, or similar
- Keep dependencies minimal. Avoid adding libraries for things the runtime already provides.

## Error Handling

- `sendToDiscord` returns `true`/`false` to indicate success — the handler uses this to decide whether to mark an event as sent
- Errors are logged with `console.log` / `console.error` (CloudWatch picks these up)
- No try/catch wrapping at the handler level — unhandled errors propagate to Lambda's built-in error reporting

## Formatting

- 4-space indentation
- Single quotes for strings in JS, single quotes for YAML string values
- No semicolons (the codebase omits them consistently)
- camelCase for variables and functions
- UPPER_SNAKE_CASE for environment variable references and constants derived from `process.env`

## AWS SDK Usage

- DynamoDB client is initialized at module scope (reused across invocations via Lambda container reuse)
- Use `DynamoDBDocumentClient` for simplified marshalling — don't use raw `DynamoDBClient` commands directly
- Table names come from environment variables, never hardcoded
