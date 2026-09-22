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

        image: memory.image_url?.startsWith("indexeddb:")
            ? {
                type: "indexeddb",
                id: Number(memory.image_url.replace("indexeddb:", ""))
            }
            : memory.image_url,

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

        imageUrl: memoryData.image
            ? `indexeddb:${memoryData.image.id}`
            : null
    };

    const response = await api.post("/memories", payload);

    const mappedMemory = mapMemoryFromApi(response.data.data);

    // Convert backend response → frontend memory format
    return {
        ...response,

        data: mappedMemory
    };
}


