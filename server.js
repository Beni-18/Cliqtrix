import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { detectIntent } from './modules/intent.js';
import { getSongRecommendations } from './modules/spotify.js';
import { getEvents } from './modules/events.js';
import { wrapCard } from './modules/cards.js';

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(bodyParser.json());

app.post('/zobot', async (req, res) => {
    try {
        console.log('Incoming Payload:', JSON.stringify(req.body, null, 2));

        const text = req.body?.message?.text || "";
        const intent = detectIntent(text);
        let cardResponse;

        console.log('Detected Intent:', intent);

        switch (intent.type) {
            case 'SONGS':
                cardResponse = await getSongRecommendations({ genre: intent.genre, limit: 6 });
                break;
            case 'EVENTS':
                cardResponse = await getEvents({ keyword: intent.keyword, city: intent.city, size: 10 });
                break;
            default:
                cardResponse = {
                    type: "text",
                    text: "I can help you find music recommendations or events. Try saying 'recommend pop songs' or 'events in London'."
                };
                break;
        }

        const finalResponse = wrapCard(cardResponse);
        res.json(finalResponse);

    } catch (error) {
        console.error('Server Error:', error);
        res.json({
            status: "error",
            zobot: {
                type: "text",
                text: "Oops! Something went wrong 😕"
            }
        });
    }
});

app.listen(PORT, () => {
    console.log(`Audiva Bot Server running on port ${PORT}`);
});
