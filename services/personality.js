import { askGemini } from './geminiApi.js';

export async function buildPersonality(input) {
    try {
        const prompt = `
      Return only valid JSON with keys: personality_name, description, playlist: [ {title, artist, reason} ], artists: [string, string, string] based on user answers:
      ${JSON.stringify(input)}
    `;

        const rawText = await askGemini(prompt);

        // Clean up potential markdown code blocks if Gemini wraps the JSON
        const jsonString = rawText.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim();

        try {
            const parsed = JSON.parse(jsonString);
            return {
                full: parsed.description,
                zobot: {
                    type: "text",
                    text: `Personality: ${parsed.personality_name}\n\n${parsed.description}`
                }
            };
        } catch (parseError) {
            console.warn('Failed to parse Gemini response as JSON:', parseError);
            return {
                full: rawText,
                zobot: {
                    type: "text",
                    text: rawText
                }
            };
        }

    } catch (error) {
        console.error('Personality Service Error:', error);
        return {
            error: 'personality_error',
            details: error.message
        };
    }
}
