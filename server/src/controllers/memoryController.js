import { 
    getAllMemories, 
    createMemory, 
    likeMemory, 
    unlikeMemory 
} from "../services/memoryService.js";

export async function getMemories(req, res, next) {
    try {
        const memories = await getAllMemories(req.user?.id);

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
        const memory = await createMemory({
            ...req.body, 
            userId: req.user.id
        });

        res.status(201).json({
            success: true,
            data: memory
        });
    } catch (error) {
        next(error);
    }
}

export async function postLike(req, res, next) {
    try {
        await likeMemory(req.params.memoryId, req.user.id);

        res.status(201).json({
            success: true
        });
    } catch (error) {
        next(error);
    }
}

export async function deleteLike(req, res, next) {
    try {
        await unlikeMemory(req.params.memoryId, req.user.id);

        res.status(200).json({
            success: true
        });
    } catch (error) {
        next(error);
    }
}