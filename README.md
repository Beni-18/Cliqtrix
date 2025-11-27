# MuseMate Webhook Backend

This is the Node.js backend for the MuseMate SalesIQ bot. It integrates with Spotify, Ticketmaster, and Google Gemini to provide music recommendations, event listings, and personality-driven responses.

## 🚀 Deployment Instructions

### 1. Create a Render Account
Go to [https://render.com](https://render.com) and create a free account.

### 2. Push to GitHub
Ensure this project is pushed to a GitHub repository.
```bash
git init
git add .
git commit -m "Initial commit"
# git remote add origin <your-repo-url>
# git push -u origin main
```

### 3. Create a Web Service
1. In the Render Dashboard, click **New +** and select **Web Service**.
2. Connect your GitHub account and select this repository.
3. Give it a name (e.g., `cliqtrix-muse`).
4. Ensure the **Runtime** is set to **Node**.
5. The **Build Command** should be `npm install`.
6. The **Start Command** should be `npm start`.

### 4. Configure Environment Variables
**CRITICAL STEP:** You must manually add the following Environment Variables in the Render Dashboard under the **Environment** tab.

| Variable Name | Description | Where to get it |
|--------------|-------------|-----------------|
| `SPOTIFY_CLIENT_ID` | Spotify App Client ID | [Spotify Developer Dashboard](https://developer.spotify.com/dashboard) |
| `SPOTIFY_CLIENT_SECRET` | Spotify App Client Secret | [Spotify Developer Dashboard](https://developer.spotify.com/dashboard) |
| `TICKETMASTER_API_KEY` | Ticketmaster Consumer Key | [Ticketmaster Developer Portal](https://developer.ticketmaster.com/) |
| `GEMINI_API_KEY` | Gemini API Key | [Google AI Studio](https://aistudio.google.com/app/apikey) |

*Note: `PORT` is automatically set by Render, so you don't need to add it.*

### 5. Deploy & Connect
1. Click **Create Web Service**.
2. Wait for the deployment to finish. You will see a green "Live" badge.
3. Copy your service URL (e.g., `https://cliqtrix-muse.onrender.com`).
4. **Webhook URL:** Your webhook endpoint is `https://<your-app-name>.onrender.com/api`.
5. Use this URL in your Zoho SalesIQ Zobot configuration.

## 🛠 Local Development

To run this locally:
1. Copy `.env.example` to `.env` (you may need to install `dotenv` if you want to load it automatically, or just export the vars in your shell).
2. Run `npm start`.
3. The server will start at `http://localhost:3000`.
