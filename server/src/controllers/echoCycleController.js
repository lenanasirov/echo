import { getAllEchoCycles, createEchoCycle } from "../services/echoCycleService.js";

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

export async function postEchoCycle(req, res, next) {
    try {
        const cycle = await createEchoCycle(req.body);

        res.status(201).json({
            success: true,
            data: cycle
        });
    } catch (error) {
        next(error);
    }
}