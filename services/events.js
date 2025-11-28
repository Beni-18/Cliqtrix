export async function getEvents({ keyword, city, size = 10 }) {
    try {
        const apiKey = process.env.TICKETMASTER_API_KEY;

        if (!apiKey) {
            throw new Error('Missing Ticketmaster API Key');
        }

        const params = new URLSearchParams({
            apikey: apiKey,
            size: size.toString(),
            sort: 'date,asc'
        });

        if (keyword) params.append('keyword', keyword);
        if (city) params.append('city', city);

        const response = await fetch(`https://app.ticketmaster.com/discovery/v2/events.json?${params.toString()}`);

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to fetch events: ${response.status} ${errorText}`);
        }

        const data = await response.json();
        const events = data._embedded?.events || [];

        if (events.length === 0) {
            return {
                type: "text",
                text: "No events found matching your criteria."
            };
        }

        return {
            type: "collection",
            title: "Events near you",
            items: events.map(event => {
                const chosenImageUrl = event.images?.find(img => img.ratio === '16_9' && img.width > 600)?.url || event.images?.[0]?.url || '';
                return {
                    title: event.name,
                    subtitle: event.dates?.start?.localDate || "Date TBA",
                    image_url: chosenImageUrl,
                    action: {
                        type: "link",
                        payload: { url: event.url }
                    }
                };
            })
        };

    } catch (error) {
        console.error('Ticketmaster API Error:', error);
        return {
            type: "text",
            text: "Could not fetch data."
        };
    }
}
