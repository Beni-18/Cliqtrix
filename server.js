import express from 'express';
import cors from 'cors';
import * as spotifyApi from './services/spotifyApi.js';
import * as ticketmasterApi from './services/ticketmasterApi.js';
import * as geminiApi from './services/geminiApi.js';
import * as personality from './services/personality.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('MuseMate Webhook Running');
});

app.post('/api', async (req, res) => {
    const { action, payload } = req.body;

    try {
        let result;
        switch (action) {
            case 'suggest_song':
                result = await spotifyApi.getSongRecommendations({ genre: payload?.genre || payload?.mood, limit: payload?.limit });
                break;
            case 'get_events':
                result = await ticketmasterApi.getEvents({ keyword: payload?.keyword, city: payload?.city || payload?.location, size: payload?.size });
                break;
            case 'your_note':
                result = await personality.buildPersonality(payload);
                break;
            default:
                return res.status(400).json({ error: 'unknown_action' });
        }

        if (result.error) {
            // Service reported an error, return 502 Bad Gateway or similar, but keep JSON format
            return res.status(502).json(result);
        }

        res.json(result);
    } catch (error) {
        console.error('Error processing request:', error);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
