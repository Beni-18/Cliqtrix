export async function getSongRecommendations({ genre, limit = 10 }) {
    try {
        const clientId = process.env.SPOTIFY_CLIENT_ID;
        const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

        if (!clientId || !clientSecret) {
            throw new Error('Missing Spotify credentials');
        }

        // 1. Fetch access token
        const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic ' + Buffer.from(clientId + ':' + clientSecret).toString('base64')
            },
            body: 'grant_type=client_credentials'
        });

        if (!tokenResponse.ok) {
            const errorText = await tokenResponse.text();
            throw new Error(`Failed to fetch token: ${tokenResponse.status} ${errorText}`);
        }

        const tokenData = await tokenResponse.json();
        const accessToken = tokenData.access_token;

        // 2. Call Spotify Recommendations API
        const params = new URLSearchParams({
            limit: limit.toString(),
            seed_genres: genre || 'pop' // Default to pop if no genre provided
        });

        const recommendationsResponse = await fetch(`https://api.spotify.com/v1/recommendations?${params.toString()}`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        if (!recommendationsResponse.ok) {
            const errorText = await recommendationsResponse.text();
            throw new Error(`Failed to fetch recommendations: ${recommendationsResponse.status} ${errorText}`);
        }

        const data = await recommendationsResponse.json();

        // 3. Map response
        const items = data.tracks.map(track => ({
            title: track.name,
            subtitle: track.artists.map(artist => artist.name).join(', '),
            image_url: track.album.images[0]?.url || '',
            action: {
                type: 'link',
                payload: {
                    url: track.external_urls.spotify
                }
            }
        }));

        // 4. Return JSON
        return {
            type: 'collection',
            title: `Top ${genre || 'pop'} picks`,
            items: items
        };

    } catch (error) {
        console.error('Spotify API Error:', error);
        return {
            error: 'spotify_error',
            details: error.message
        };
    }
}
