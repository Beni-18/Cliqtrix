import axios from 'axios';

async function getAccessToken(clientId, clientSecret) {
    const response = await axios.post('https://accounts.spotify.com/api/token',
        'grant_type=client_credentials', {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + Buffer.from(clientId + ':' + clientSecret).toString('base64')
        }
    });
    return response.data.access_token;
}

export async function getSongRecommendations({ genre = "pop", limit = 6 }) {
    try {
        const clientId = process.env.SPOTIFY_CLIENT_ID;
        const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

        if (!clientId || !clientSecret) {
            throw new Error('Missing Spotify credentials');
        }

        const accessToken = await getAccessToken(clientId, clientSecret);
        let tracks = [];

        try {
            // Try Recommendations API
            const response = await axios.get('https://api.spotify.com/v1/recommendations', {
                params: {
                    limit: limit,
                    seed_genres: genre
                },
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            tracks = response.data.tracks || [];
        } catch (recError) {
            console.error(`Spotify Recommendations failed, falling back to search:`, recError.message);
        }

        // Fallback to Search API if no tracks
        if (tracks.length === 0) {
            const searchResponse = await axios.get('https://api.spotify.com/v1/search', {
                params: {
                    q: `genre:${genre}`,
                    type: 'track',
                    limit: limit
                },
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            tracks = searchResponse.data.tracks?.items || [];
        }

        if (tracks.length === 0) {
            return {
                type: "text",
                text: `Sorry, I couldn't find any ${genre} songs right now.`
            };
        }

        return {
            type: "list",
            title: `Recommended songs`,
            items: tracks.map(track => ({
                title: track.name,
                subtitle: track.artists.map(a => a.name).join(", "),
                image_url: track.album.images[0]?.url || "",
                action: {
                    type: "link",
                    payload: { url: track.external_urls.spotify }
                }
            }))
        };

    } catch (error) {
        console.error('Spotify API Error:', error.response?.data || error.message);
        return {
            type: "text",
            text: "Could not fetch music recommendations."
        };
    }
}
