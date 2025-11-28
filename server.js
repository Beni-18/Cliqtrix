import express from 'express';
import cors from 'cors';
import { detectIntent } from './utils/intent.js';
import * as spotify from './services/spotify.js';
import * as ticketmaster from './services/ticketmaster.js';
import * as personality from './services/personality.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('MuseMate Webhook Running');
});

app.post('/zobot', async (req, res) => {
    try {
        const text = req.body?.message?.text || "";
        const intent = detectIntent(text);
        let botResponse;

        switch (intent) {
            case 'suggest_song':
                botResponse = await spotify.getSongRecommendations({ genre: 'pop', limit: 5 });
                break;
            case 'get_events':
                botResponse = await ticketmaster.getEvents({ city: 'London', size: 5 });
                break;
            case 'your_note':
                botResponse = await personality.buildPersonality({ text });
                break;
            default:
                botResponse = {
                    type: "text",
                    text: "I can help you with songs, events, or generating a personality note. Try asking for 'songs' or 'events'."
                };
                break;
        }

        res.json({
            status: "success",
            zobot: botResponse
        });

    } catch (error) {
        console.error('Zobot Handler Error:', error);
        res.json({
            status: "success", // Return success to Zoho even on error to avoid widget errors
            zobot: {
                type: "text",
                text: "Something went wrong processing your request."
            }
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
