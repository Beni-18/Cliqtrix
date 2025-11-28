export function detectIntent(text) {
    const lowerText = (text || "").toLowerCase();

    // SONGS intent
    if (["song", "songs", "music", "recommend", "pop", "rock"].some(keyword => lowerText.includes(keyword))) {
        // Extract genre if present (simple extraction for now)
        const genres = ["pop", "rock", "jazz", "classical", "hip-hop", "country", "edm"];
        const foundGenre = genres.find(g => lowerText.includes(g));

        return {
            type: "SONGS",
            genre: foundGenre || "pop"
        };
    }

    // EVENTS intent
    if (["event", "concert", "show", "near", "city"].some(keyword => lowerText.includes(keyword))) {
        // Extract city if present (simple extraction)
        // In a real app, use an NLP entity extractor or a list of major cities
        const cities = ["london", "new york", "paris", "los angeles", "tokyo", "mumbai", "delhi"];
        const foundCity = cities.find(c => lowerText.includes(c));

        return {
            type: "EVENTS",
            city: foundCity || "London", // Default to London if no city found
            keyword: "music" // Default keyword
        };
    }

    return { type: "UNKNOWN" };
}
