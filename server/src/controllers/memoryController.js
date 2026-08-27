import { getAllMemories, createMemory } from "../services/memoryService.js";

export async function getMemories(req, res, next) {
    try {
        const memories = await getAllMemories();

        res.status(200).json({
            success: true,
            data: memories
        });
    } catch (error) {
        next(error);
    }
}

export async function postMemory(req, res, next) {
    try {
        const memory = await createMemory(req.body);

        res.status(201).json({
            success: true,
            data: memory
        });
    } catch (error) {
        next(error);
    }
}