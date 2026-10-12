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

        song: memory.song_title || memory.song_artist || memory.spotify_track_id
        ? {
            id: memory.spotify_track_id ?? null,
            title: memory.song_title,
            artist: memory.song_artist,
            albumArtUrl: memory.song_album_art_url ?? null
        }
        : null,

        mood: memory.mood,
        caption: memory.caption,
        location: memory.location,

        image: memory.image_url || null,

        createdAt: memory.created_at,

        likes: memory.like_count,
        likedByCurrentUser: Boolean(memory.liked_by_current_user),
        commentCount: memory.comment_count,
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

export async function likeMemory(memoryId) {
    return api.post(`/memories/${memoryId}/like`);
}

export async function unlikeMemory(memoryId) {
    return api.delete(`/memories/${memoryId}/like`);
}

export async function getMemoryComments(memoryId) {
    const response = await api.get(`/memories/${memoryId}/comments`);

    return {
        ...response,
        data: response.data.data.map((comment) => ({
            id: comment.id,
            memoryId: comment.memory_id,
            user: {
                id: comment.user_id,
                name: comment.user_name,
                username: comment.user_username,
                avatar: comment.user_avatar
            },
            content: comment.content,
            createdAt: comment.created_at
        }))
    };
}

export async function createMemoryComment(memoryId, content) {
    const response = await api.post(
        `/memories/${memoryId}/comments`, 
        { content }
    );

    const comment = response.data.data;

    return {
        ...response,
        data: {
            id: comment.id,
            memoryId: comment.memory_id,
            user: {
                id: comment.user_id,
                name: comment.user_name,
                username: comment.user_username,
                avatar: comment.user_avatar
            },
            content: comment.content,
            createdAt: comment.created_at
        }
    };
}

export async function updateMemoryComment(
    memoryId, 
    commentId, 
    content
) {
    const response = await api.patch(
        `/memories/${memoryId}/comments/${commentId}`, 
        { content }
    );

    const comment = response.data.data;

    return {
        ...response,
        data: {
            id: comment.id,
            memoryId: comment.memory_id,
            user: {
                id: comment.user_id,
                name: comment.user_name,
                username: comment.user_username,
                avatar: comment.user_avatar
            },
            content: comment.content,
            createdAt: comment.created_at
        }
    };
}

export async function deleteMemoryComment(
    memoryId, 
    commentId
) {
    await api.delete(
        `/memories/${memoryId}/comments/${commentId}`
    );
}

export async function createMemory(memoryData) {
    const formData = new FormData();
    formData.append("id", memoryData.id);
    formData.append("cycleId", memoryData.cycleId);

    if (memoryData.song?.id != null) {
        formData.append("spotifyTrackId", memoryData.song.id);
    }

    formData.append("songTitle", memoryData.song?.title ?? "");
    formData.append("songArtist", memoryData.song?.artist ?? "");
    formData.append("songAlbumArtUrl", memoryData.song?.albumArtUrl ?? "");

    formData.append("mood", memoryData.mood ?? "");
    formData.append("caption", memoryData.caption ?? "");
    formData.append("location", memoryData.location ?? "");

    if(memoryData.imageFile){
        formData.append("image", memoryData.imageFile);
    }

    const response = await api.post("/memories", formData);
    const mappedMemory = mapMemoryFromApi(response.data.data);

    return {...response, data: mappedMemory};
}

export async function updateMemory(memoryId, memoryData) {
    const formData = new FormData();

    if (memoryData.song?.id != null) {
        formData.append("spotifyTrackId", memoryData.song.id);
    } else {
        formData.append("spotifyTrackId", "");
    }

    formData.append("songTitle", memoryData.song?.title ?? "");
    formData.append("songArtist", memoryData.song?.artist ?? "");
    formData.append("songAlbumArtUrl", memoryData.song?.albumArtUrl ?? "");
    
    formData.append("mood", memoryData.mood ?? "");
    formData.append("caption", memoryData.caption ?? "");

    if(memoryData.imageFile){
        formData.append("image", memoryData.imageFile);
    }
    
    const response = await api.patch(
        `/memories/${memoryId}`,
        formData
    );

    const mappedMemory = mapMemoryFromApi(response.data.data);

    return {...response, data: mappedMemory};
}

export async function deleteMemory(memoryId) {
    const response = await api.delete(
        `/memories/${memoryId}`
    );

    return {
        response
    };
}


