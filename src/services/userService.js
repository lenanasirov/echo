import api from "./api";

export async function getUsers() {
    const response = await api.get("/users");

    return response.data;
}

export async function createUser(userData) {
    const response = await api.post("/users", userData);

    return response.data;
}