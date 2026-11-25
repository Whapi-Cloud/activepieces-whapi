# @whapicloud/piece-whapi

**Activepieces piece** for [Whapi.Cloud](https://whapi.cloud) — WhatsApp messaging automation via the Whapi HTTP API (`https://gate.whapi.cloud`).

Requires **Activepieces v0.88.2+**. The published npm package is a **self-contained runtime bundle** (not source TypeScript); Activepieces downloads and loads `src/index.js` from this package.

## What you can automate

- **Outbound:** send WhatsApp messages (text, image, video, audio, document, contact) to a phone number or chat ID.
- **Inbound / events:** start flows when Whapi posts **message** or **group** webhooks to Activepieces.
- **Lookup:** fetch a message by ID, check if a number is on WhatsApp, read channel health/status.
- **Advanced:** call any Whapi REST endpoint through the built-in **Custom API Call** action (same base URL and Bearer auth).

## Install in Activepieces

Install this piece from the npm package (registry or private mirror, depending on your deployment):

```bash
npm i @whapicloud/piece-whapi
```

In the Activepieces UI, add **Whapi** from installed pieces and create a **connection** (see below).

## Authentication

Connection type: **Whapi API** (custom auth).

| Field | Required | Description |
|--------|----------|-------------|
| **Access Token** | Yes | Channel token from [Whapi Panel](https://panel.whapi.cloud) → your channel → **Token**. |
| **Channel ID** | No | From the channel URL: `panel.whapi.cloud/channels/{channel-id}`. Used as a stable connection identifier when set. |

On save, the piece validates the token with `GET /limits` on `gate.whapi.cloud`. See [Whapi authorization docs](https://whapi.cloud/docs).

## Actions

| Action | Purpose |
|--------|---------|
| **Send Message** | `POST` to Whapi send endpoints for types: text, image, video, audio, document, contact. Recipient: phone (e.g. `447911123456`) or chat ID. Optional media URL/ID/base64, caption, typing time (0–60 s). |
| **Get Message** | `GET /messages/{message_id}` — retrieve one message by ID. |
| **Check Contact** | `POST /contacts` — check whether a phone number is registered on WhatsApp (`blocking: wait`). |
| **Check Health** | `GET /health` — channel uptime and operational status. |
| **Custom API Call** | Authenticated requests to `https://gate.whapi.cloud` for endpoints not wrapped as dedicated actions. |

## Trigger

| Trigger | Type | Description |
|---------|------|-------------|
| **Whapi Events** | Webhook | When the flow is published, registers your Activepieces webhook URL on the channel settings. Choose **Messages Events** and/or **Groups Events**. Each incoming webhook payload is emitted as one flow run. When the flow is disabled, the webhook is removed from channel settings. |

## Repository and publishing

Source and contribution: [Whapi-Cloud/activepieces-whapi](https://github.com/Whapi-Cloud/activepieces-whapi).

Build and lint in this monorepo:

```bash
bun install
npx turbo run build --filter=@whapicloud/piece-whapi
npx turbo run lint --filter=@whapicloud/piece-whapi
```

Publish (after auth/token setup):

```bash
npm run publish-piece whapi
```

## Support

- Whapi API: [https://whapi.cloud/docs](https://whapi.cloud/docs)
- Activepieces pieces: [https://www.activepieces.com/docs/build-pieces](https://www.activepieces.com/docs/build-pieces)

**Maintainer:** [@whapicloud](https://www.npmjs.com/~whapicloud) · care@whapi.cloud