import axios from 'axios';

export async function askGemini(prompt) {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) throw new Error('Missing Gemini API Key');

        // 1. Discover Models
        let modelName = 'models/gemini-1.5-flash'; // Default
        try {
            const modelsResponse = await axios.get(`https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`);
            const models = modelsResponse.data.models || [];

            // Prefer 1.5-pro, then 1.5-flash, then any gemini
            const preferred = models.find(m => m.name.includes('gemini-1.5-pro')) ||
                models.find(m => m.name.includes('gemini-1.5-flash')) ||
                models.find(m => m.name.toLowerCase().includes('gemini'));

            if (preferred) {
                modelName = preferred.name;
            }
        } catch (modelError) {
            console.warn('Failed to list models, using default:', modelError.message);
        }

        // 2. Try generateText (older/some models)
        try {
            const response = await axios.post(
                `https://generativelanguage.googleapis.com/v1beta/${modelName}:generateText?key=${apiKey}`,
                {
                    prompt: { text: prompt },
                    maxOutputTokens: 300
                }
            );

            const text = response.data.candidates?.[0]?.output;
            if (text) return text;

        } catch (genTextError) {
            // If 404 or other error, fall through to generateContent
            if (genTextError.response?.status !== 404) {
                console.warn(`generateText failed for ${modelName}:`, genTextError.response?.data || genTextError.message);
            }
        }

        // 3. Fallback to generateContent (newer models)
        try {
            const response = await axios.post(
                `https://generativelanguage.googleapis.com/v1beta/${modelName}:generateContent?key=${apiKey}`,
                {
                    contents: [{ parts: [{ text: prompt }] }]
                }
            );

            const text = response.data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) return text;

        } catch (genContentError) {
            console.error(`generateContent failed for ${modelName}:`, genContentError.response?.data || genContentError.message);
            // Fall through to return fallback
        }

        return "Unable to generate personality right now. Please try again later.";

    } catch (error) {
        console.error('Gemini API Error:', error.response?.data || error.message);
        return "Unable to generate personality right now. Please try again later.";
    }
}
