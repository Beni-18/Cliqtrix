export async function getSongRecommendations({ genre, limit = 10 }) {
    try {
        const clientId = process.env.SPOTIFY_CLIENT_ID;
        const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

        if (!clientId || !clientSecret) {
            throw new Error('Missing Spotify credentials');
        }

        // 1. Validate Genre
        // Official Spotify Seed Genres
        const ALLOWED_GENRES = [
            "acoustic", "afrobeat", "alt-rock", "alternative", "ambient", "anime", "black-metal", "bluegrass", "blues", "bossanova", "brazil", "breakbeat", "british", "cantopop", "chicago-house", "children", "chill", "classical", "club", "comedy", "country", "dance", "dancehall", "death-metal", "deep-house", "detroit-techno", "disco", "disney", "drum-and-bass", "dub", "dubstep", "edm", "electro", "electronic", "emo", "folk", "forro", "french", "funk", "garage", "german", "gospel", "goth", "grindcore", "groove", "grunge", "guitar", "happy", "hard-rock", "hardcore", "hardstyle", "heavy-metal", "hip-hop", "holidays", "honky-tonk", "house", "idm", "indian", "indie", "indie-pop", "industrial", "iranian", "j-dance", "j-idol", "j-pop", "j-rock", "jazz", "k-pop", "kids", "latin", "latino", "malay", "mandopop", "metal", "metal-misc", "metalcore", "minimal-techno", "movies", "mpb", "new-age", "new-release", "opera", "pagode", "party", "philippines-opm", "piano", "pop", "pop-film", "post-dubstep", "power-pop", "progressive-house", "psych-rock", "punk", "punk-rock", "r-n-b", "rainy-day", "reggae", "reggaeton", "road-trip", "rock", "rock-n-roll", "rockabilly", "romance", "sad", "salsa", "samba", "sertanejo", "show-tunes", "singer-songwriter", "ska", "sleep", "songwriter", "soul", "soundtracks", "spanish", "study", "summer", "swedish", "synth-pop", "tango", "techno", "trance", "trip-hop", "work-out", "world-music"
        ];

        let seedGenre = 'pop'; // Default fallback
        if (genre && ALLOWED_GENRES.includes(genre.toLowerCase())) {
            seedGenre = genre.toLowerCase();
        }

        // 2. Fetch access token
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

        // 3. Call Spotify Recommendations API
        const params = new URLSearchParams({
            limit: limit.toString(),
            seed_genres: seedGenre
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

        // 4. Map response
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

        // 5. Return JSON
        return {
            type: 'collection',
            title: `Top ${seedGenre} picks`,
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
