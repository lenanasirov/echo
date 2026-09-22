import { 
    getAllMemories, 
    createMemory, 
    updateMemory,
    likeMemory,
    unlikeMemory,
    getMemoryComments,
    createMemoryComment,
    updateMemoryComment,
    deleteMemoryComment
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

export async function patchMemory(req, res, next) {
    try {
        const { memoryId } = req.params;
        const {
            songId,
            songTitle,
            songArtist,
            mood,
            caption,
            imageUrl
        } = req.body;

        const memory = await updateMemory({
            memoryId,
            userId: req.user.id,
            songId,
            songTitle,
            songArtist,
            mood,
            caption,
            imageUrl
        });

        res.status(200).json({
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

export async function getComments(req, res, next) {
    try {
        const comments = await getMemoryComments(req.params.memoryId);

        res.status(200).json({
            success: true,
            data: comments
        });
    } catch (error) {
        next(error);
    }
}

export async function postComment(req, res, next) {
    try {
        const comment = await createMemoryComment({
            memoryId: req.params.memoryId,
            userId: req.user.id,
            content: req.body.content
        });

        res.status(201).json({
            success: true,
            data: comment
        });
    } catch (error) {
        next(error);
    }
}

export async function patchComment(req, res, next) {
    try {
        const comment = await updateMemoryComment({
            memoryId: req.params.memoryId,
            commentId: req.params.commentId,
            userId: req.user.id,
            content: req.body.content
        });

        res.status(200).json({
            success: true,
            data: comment
        });
    } catch (error) {
        next(error);
    }
}

export async function deleteComment(req, res, next) {
    try {
        await deleteMemoryComment({
            memoryId: req.params.memoryId,
            commentId: req.params.commentId,
            userId: req.user.id
        });

        res.status(200).json({
            success: true
        });
    } catch (error) {
        next(error);
    }
}