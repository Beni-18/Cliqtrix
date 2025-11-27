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
                type: 'collection',
                title: 'Events near you',
                items: [],
                message: 'No events found matching your criteria.'
            };
        }

        const items = events.map(event => ({
            title: event.name,
            subtitle: event.dates?.start?.localDate || 'Date TBA',
            image_url: event.images?.find(img => img.ratio === '16_9' && img.width > 600)?.url || event.images?.[0]?.url || '',
            action: {
                type: 'link',
                payload: {
                    url: event.url
                }
            }
        }));

        return {
            type: 'collection',
            title: 'Events near you',
            items: items
        };

    } catch (error) {
        console.error('Ticketmaster API Error:', error);
        return {
            error: 'ticketmaster_error',
            details: error.message
        };
    }
}
