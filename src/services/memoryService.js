import api from "./api";

export async function getMemories() {
    const response = await api.get("/memories");

    return response.data;
}

export async function createMemory(memoryData) {
    const response = await api.post("/memories", memoryData);

    return response.data;
}