import { getAllEchoCycles } from "../services/echoCycleService.js";

export async function getEchoCycles(req, res, next) {
    try {
        const cycles = await getAllEchoCycles();

        res.status(200).json({
            success: true,
            data: cycles
        });
    } catch (error) {
        next(error);
    }
}