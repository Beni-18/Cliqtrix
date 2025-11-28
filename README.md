# Zobot Webhook Backend

This is a Node.js backend for a Zoho SalesIQ Webhook Bot. It integrates with Spotify, Ticketmaster, and Gemini APIs.

## Setup

1.  Install dependencies:
    ```bash
    npm install
    ```

2.  Configure environment variables:
    Copy `.env.example` to `.env` and fill in your API keys.

3.  Start the server:
    ```bash
    npm start
    ```

## Endpoints

### POST /zobot

Handles webhook requests from Zoho SalesIQ.

**Test with curl (Zoho format):**
```bash
curl -X POST http://localhost:3000/zobot \
  -H "Content-Type: application/json" \
  -d '{"message": {"text": "Songs"}}'
```

**Test Intent: Events**
```bash
curl -X POST http://localhost:3000/zobot \
  -H "Content-Type: application/json" \
  -d '{"message": {"text": "Show me events"}}'
```

**Test Intent: Personality**
```bash
curl -X POST http://localhost:3000/zobot \
  -H "Content-Type: application/json" \
  -d '{"message": {"text": "Generate personality note"}}'
```
