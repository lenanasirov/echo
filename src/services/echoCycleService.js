import api from "./api";

/** 
 * Convert a backend cycle object into the frontend cycle format. 
 */
function mapCycleFromApi(cycle) {
    return {
        id: cycle.id,
        startedAt: cycle.started_at,
        endsAt: cycle.ends_at,
        previousCycleId: cycle.previous_cycle_id
    };
}

export async function getEchoCycles() {
    const response = await api.get("/echo-cycles");

    return {
        ...response,
        data: response.data.data.map(mapCycleFromApi)
    };
}

export async function createEchoCycle(cycleData) {
    const payload = {
        id: cycleData.id,
        startedAt: cycleData.startedAt,
        endsAt: cycleData.endsAt,
        previousCycleId: cycleData.previousCycleId ?? null
    };

    const response = await api.post("/echo-cycles", payload);

    return {
        ...response,        
        data: response.data.data
    }
}