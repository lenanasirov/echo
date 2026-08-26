import { getAllMemories } from "../services/memoryService.js";

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