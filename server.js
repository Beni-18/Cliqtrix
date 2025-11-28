import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { detectIntent } from './modules/intent.js';
import { getSongRecommendations } from './modules/spotify.js';
import { getEvents } from './modules/events.js';

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(bodyParser.json());

app.post('/zobot', async (req, res) => {
    try {
        // 1. Log Incoming Request
        console.log("Zobot hit:", JSON.stringify(req.body, null, 2));

        const message = req.body?.message?.text || "";
        console.log("Message:", message);

        // 2. Detect Intent
        const intent = detectIntent(message);
        console.log("Detected intent:", intent);

        let botResponse;

        // 3. Handle Intents
        switch (intent.type) {
            case 'SONGS':
                botResponse = await getSongRecommendations({ genre: intent.genre });
                break;
            case 'EVENTS':
                botResponse = await getEvents({ keyword: intent.keyword, city: intent.city });
                break;
            default:
                botResponse = {
                    type: "text",
                    text: "I didn’t understand that yet. Try asking for songs or events!"
                };
                break;
        }

        // 4. Ensure Response Format (Auto-convert to list if needed)
        if (botResponse.type === 'collection') {
            botResponse.type = 'list';
        }

        const finalResponse = {
            status: "success",
            zobot: botResponse
        };

        // 5. Log Outgoing Response
        console.log("Sending:", JSON.stringify(finalResponse, null, 2));

        res.json(finalResponse);

    } catch (error) {
        console.error('Server Error:', error);

        // 6. Guarantee Reply
        const errorResponse = {
            status: "success",
            zobot: {
                type: "text",
                text: "Sorry! Something went wrong processing your request."
            }
        };
        console.log("Sending Error Response:", JSON.stringify(errorResponse, null, 2));
        res.json(errorResponse);
    }
});

app.listen(PORT, () => {
    console.log(`Audiva Bot Server running on port ${PORT}`);
});
