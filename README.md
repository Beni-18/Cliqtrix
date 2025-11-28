# Audiva Bot Backend

This is the Node.js backend for the Audiva Bot, designed for Zoho SalesIQ.

## Deployment on Render

1.  Create a new Web Service on Render.
2.  Connect your repository.
3.  Set the Build Command to `npm install`.
4.  Set the Start Command to `node server.js`.
5.  Add the Environment Variables from `.env.example`.

## Zoho Webhook Setup

1.  Go to Zoho SalesIQ -> Settings -> Zobot.
2.  Create a new bot or edit an existing one.
3.  Choose "Webhook" as the platform.
4.  Enter your Render URL + `/zobot` (e.g., `https://your-app.onrender.com/zobot`).
5.  Enable "Text" input.

## Test Payload

```json
{
  "message": {
    "text": "Recommend pop songs"
  }
}
```

## Expected Response

```json
{
  "status": "success",
  "zobot": {
    "type": "collection",
    "title": "Top pop picks",
    "items": [...]
  }
}
```
