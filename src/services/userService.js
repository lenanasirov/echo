import api from "./api";

export function mapUserFromApi(user) {
    return {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
        streak: user.streak,
        lastStreakCycleId: user.last_streak_cycle_id,
        createdAt: user.created_at
    };
}

export async function updateUser(userData) {
    const response = await api.patch("/users/me", userData);

    return {
        ...response,
        data: mapUserFromApi(response.data.data)
    };
}