import axios from 'axios';

export async function buildPersonality(userPayload) {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) throw new Error('Missing Gemini API Key');

        const prompt = `Generate a short, fun personality description based on this user data: ${JSON.stringify(userPayload)}`;

        // 1. Discover Models
        let modelName = 'models/gemini-1.5-flash'; // Default
        try {
            const modelsResponse = await axios.get(`https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`);
            const models = modelsResponse.data.models || [];

            const preferred = models.find(m => m.name.includes('gemini-1.5-pro')) ||
                models.find(m => m.name.includes('gemini-1.5-flash')) ||
                models.find(m => m.name.toLowerCase().includes('gemini'));

            if (preferred) {
                modelName = preferred.name;
            }
        } catch (modelError) {
            console.warn('Failed to list models, using default:', modelError.message);
        }

        // 2. Generate Content
        try {
            const response = await axios.post(
                `https://generativelanguage.googleapis.com/v1beta/${modelName}:generateContent?key=${apiKey}`,
                {
                    contents: [{ parts: [{ text: prompt }] }]
                }
            );

            const text = response.data.candidates?.[0]?.content?.parts?.[0]?.text;

            if (text) {
                return {
                    type: "text",
                    text: text
                };
            }

        } catch (genError) {
            console.error(`Gemini generation failed:`, genError.response?.data || genError.message);
        }

        return {
            type: "text",
            text: "I couldn't generate a personality for you right now."
        };

    } catch (error) {
        console.error('Personality Service Error:', error);
        return {
            type: "text",
            text: "Error generating personality."
        };
    }
}
