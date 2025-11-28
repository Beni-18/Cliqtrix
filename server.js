import express from 'express';
import cors from 'cors';
import * as songs from './services/songs.js';
import * as events from './services/events.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('MuseMate Webhook Running');
});

app.post('/zobot', async (req, res) => {
    try {
        const message = req.body.message?.text?.toLowerCase() || '';
        let response;

        if (message.includes('song') || message.includes('music')) {
            response = await songs.getSongRecommendations({ genre: 'pop' }); // Default to pop for now, could extract genre
        } else if (message.includes('event') || message.includes('show')) {
            response = await events.getEvents({ city: 'London' }); // Default to London for now, could extract city
        } else {
            response = {
                type: "text",
                text: "I can help you with songs or events."
            };
        }

        res.json({
            status: "success",
            zobot: response
        });

    } catch (error) {
        console.error('Error processing request:', error);
        res.json({
            status: "error",
            zobot: { type: "text", text: "Something went wrong." }
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
