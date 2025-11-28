export function detectIntent(text) {
    const lowerText = (text || "").toLowerCase();

    // SONGS intent
    if (lowerText.includes("song") || lowerText.includes("music")) {
        // Extract genre if present
        const genres = ["pop", "rock", "jazz", "classical", "hip-hop", "country", "edm"];
        const foundGenre = genres.find(g => lowerText.includes(g));

        return {
            type: "SONGS",
            genre: foundGenre || "pop"
        };
    }

    // EVENTS intent
    if (lowerText.includes("event") || lowerText.includes("nearby")) {
        // Extract city if present
        const cities = ["london", "new york", "paris", "los angeles", "tokyo", "mumbai", "delhi"];
        const foundCity = cities.find(c => lowerText.includes(c));

        return {
            type: "EVENTS",
            city: foundCity || "London",
            keyword: "music"
        };
    }

    return { type: "UNKNOWN" };
}
