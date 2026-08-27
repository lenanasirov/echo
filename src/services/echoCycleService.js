import api from "./api";

export async function getEchoCycles() {
    const response = await api.get("/echo-cycles");

    return response.data;
}

export async function createEchoCycle(cycleData) {
    const response = await api.post("/echo-cycles", cycleData);

    return response.data;
}