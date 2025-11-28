export function detectIntent(messageText) {
    const text = (messageText || "").toLowerCase();

    if (text.includes("song") || text.includes("songs") || text.includes("music")) {
        return "suggest_song";
    }

    if (text.includes("event") || text.includes("show") || text.includes("concert")) {
        return "get_events";
    }

    if (text.includes("note") || text.includes("personality")) {
        return "your_note";
    }

    return "unknown";
}
