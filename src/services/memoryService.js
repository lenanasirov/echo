import api from "./api";

/**
 * Convert a backend memory object into the frontend memory format.
 */
function mapMemoryFromApi(memory) {
    return {
        id: memory.id,

        cycleId: memory.cycle_id,

        user: {
            id: memory.user_id,
            name: memory.user_name,
            username: memory.user_username,
            avatar: memory.user_avatar
        },

        song: memory.song_id
            ? {
                id: memory.song_id,
                title: memory.song_title,
                artist: memory.song_artist
            }
            : null,

        mood: memory.mood,
        caption: memory.caption,
        location: memory.location,

        image: memory.image_url,

        date: memory.created_at,

        likes: 0,
        likedBy: [],
        comments: []
    };
}

export async function getMemories() {
    const response = await api.get("/memories");

    return {
        ...response,

        data: response.data.data.map(mapMemoryFromApi)
    };
}

export async function createMemory(memoryData) {
    // Convert frontend memory format → backend API format
    const payload = {
        id: memoryData.id,
        userId: memoryData.user?.id,
        cycleId: memoryData.cycleId,

        songId: memoryData.song?.id ?? null,
        songTitle: memoryData.song?.title ?? null,
        songArtist: memoryData.song?.artist ?? null,

        mood: memoryData.mood ?? null,
        caption: memoryData.caption ?? null,
        location: memoryData.location ?? null,

        imageUrl: null
    };

    const response = await api.post("/memories", payload);

    const mappedMemory = mapMemoryFromApi(response.data.data);

    // Convert backend response → frontend memory format
    return {
        ...response,

        data: mappedMemory
    };
}

