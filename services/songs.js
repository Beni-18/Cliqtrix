import axios from 'axios';

const ALLOWED_GENRES = [
    "acoustic", "afrobeat", "alt-rock", "alternative", "ambient", "anime", "black-metal", "bluegrass", "blues", "bossanova", "brazil", "breakbeat", "british", "cantopop", "chicago-house", "children", "chill", "classical", "club", "comedy", "country", "dance", "dancehall", "death-metal", "deep-house", "detroit-techno", "disco", "disney", "drum-and-bass", "dub", "dubstep", "edm", "electro", "electronic", "emo", "folk", "forro", "french", "funk", "garage", "german", "gospel", "goth", "grindcore", "groove", "grunge", "guitar", "happy", "hard-rock", "hardcore", "hardstyle", "heavy-metal", "hip-hop", "holidays", "honky-tonk", "house", "idm", "indian", "indie", "indie-pop", "industrial", "iranian", "j-dance", "j-idol", "j-pop", "j-rock", "jazz", "k-pop", "kids", "latin", "latino", "malay", "mandopop", "metal", "metal-misc", "metalcore", "minimal-techno", "movies", "mpb", "new-age", "new-release", "opera", "pagode", "party", "philippines-opm", "piano", "pop", "pop-film", "post-dubstep", "power-pop", "progressive-house", "psych-rock", "punk", "punk-rock", "r-n-b", "rainy-day", "reggae", "reggaeton", "road-trip", "rock", "rock-n-roll", "rockabilly", "romance", "sad", "salsa", "samba", "sertanejo", "show-tunes", "singer-songwriter", "ska", "sleep", "songwriter", "soul", "soundtracks", "spanish", "study", "summer", "swedish", "synth-pop", "tango", "techno", "trance", "trip-hop", "work-out", "world-music"
];

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

function mapTracksToZobot(tracks, seedGenre) {
    return {
        type: "collection",
        title: `Top ${seedGenre} picks for you`,
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
}

export async function getSongRecommendations({ genre = "pop", limit = 6 }) {
    try {
        const clientId = process.env.SPOTIFY_CLIENT_ID;
        const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

        if (!clientId || !clientSecret) {
            throw new Error('Missing Spotify credentials');
        }

        const accessToken = await getAccessToken(clientId, clientSecret);

        // Validate genre
        let seedGenre = 'pop';
        if (genre && ALLOWED_GENRES.includes(genre.toLowerCase())) {
            seedGenre = genre.toLowerCase();
        }

        try {
            // Try Recommendations API
            const response = await axios.get('https://api.spotify.com/v1/recommendations', {
                params: {
                    limit: limit,
                    seed_genres: seedGenre
                },
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });

            if (response.data.tracks && response.data.tracks.length > 0) {
                return mapTracksToZobot(response.data.tracks, seedGenre);
            }
        } catch (recError) {
            console.error(`Spotify Recommendations failed for genre '${seedGenre}':`, recError.response?.data || recError.message);
            // Fallback to Search API
        }

        // Fallback: Search API
        console.log(`Falling back to Spotify Search for genre: ${seedGenre}`);
        const searchResponse = await axios.get('https://api.spotify.com/v1/search', {
            params: {
                q: `genre:${seedGenre}`,
                type: 'track',
                limit: limit
            },
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        if (searchResponse.data.tracks && searchResponse.data.tracks.items.length > 0) {
            return mapTracksToZobot(searchResponse.data.tracks.items, seedGenre);
        }

        return {
            type: "text",
            text: "Sorry, I couldn't find any songs for that genre."
        };

    } catch (error) {
        console.error('Spotify API Error:', error.response?.data || error.message);
        return {
            type: "text",
            text: "Could not fetch data."
        };
    }
}
