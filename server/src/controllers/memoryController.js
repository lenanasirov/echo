import { 
    getAllMemories, 
    createMemory, 
    updateMemory,
    deleteMemory,
    likeMemory,
    unlikeMemory,
    getMemoryComments,
    createMemoryComment,
    updateMemoryComment,
    deleteMemoryComment
} from "../services/memoryService.js";

import { 
    uploadImage,
    deleteImage
} from "../services/cloudinaryService.js";

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
    let uploadedImage = null;

    try {
        let imageUrl = null;
        let imagePublicId = null;

        if (req.file) {
            uploadedImage = await uploadImage(req.file, {
                folder: "echo/memories"
            });

            imageUrl = uploadedImage.url;
            imagePublicId = uploadedImage.publicId;
        }

        const memory = await createMemory({
            ...req.body, 
            imageUrl,
            imagePublicId,
            userId: req.user.id
        });

        res.status(201).json({
            success: true,
            data: memory
        });
    } catch (error) {
        if (uploadedImage?.publicId) {
            try {
                await deleteImage(uploadedImage.publicId);
            } catch (cleanupError) {
                console.error(
                    "Failed to clean up Cloudinary image after memory creation failed:", 
                    cleanupError
                );
            }
        }

        next(error);
    }
}

export async function patchMemory(req, res, next) {
    let uploadedImage = null;

    try {
        const { memoryId } = req.params;

        const {
            songId,
            songTitle,
            songArtist,
            mood,
            caption
        } = req.body;

        let imageUrl;
        let imagePublicId;

        if (req.file) {
            uploadedImage = await uploadImage(req.file, {
                folder: "echo/memories"
            });

            imageUrl = uploadedImage.url;
            imagePublicId = uploadedImage.publicId;
        }

        const result = await updateMemory({
            memoryId,
            userId: req.user.id,
            songId,
            songTitle,
            songArtist,
            mood,
            caption,
            imageUrl,
            imagePublicId
        });

        if (result.previousImagePublicId) {
            try {
                const cleanupResult = await deleteImage(
                    result.previousImagePublicId
                );

                console.log(
                    "Previous Cloudinary image cleanup result:", 
                    cleanupResult
                );
            } catch (cleanupError) {
                console.error(
                    "Failed to clean up previous Cloudinary image after memory update:", 
                    cleanupError
                );
            }
        }

        res.status(200).json({
            success: true,
            data: result.memory
        });
    } catch (error) {
        if (uploadedImage?.publicId) {
            try {
                const cleanupResult = await deleteImage(
                    uploadedImage.publicId
                );

                console.log(
                    "New Cloudinary image cleanup result:", 
                    cleanupResult
                );
            } catch (cleanupError) {
                console.error(
                    "Failed to clean up new Cloudinary image after memory update failed:", 
                    cleanupError
                );
            }
        }
        next(error);
    }
}

export async function removeMemory(req, res, next) {
    try {
        const { memoryId } = req.params;

        const result = await deleteMemory({
            memoryId,
            userId: req.user.id
        });

        if (result.imagePublicId) {
            try {
                const cleanupResult = await deleteImage(
                    result.imagePublicId
                );

                console.log(
                    "Deleted Cloudinary image cleanup result:", 
                    cleanupResult
                );
            } catch (cleanupError) {
                console.error(
                    "Failed to clean up Cloudinary image after memory deletion:", 
                    cleanupError
                );
            }
        }

        res.status(200).json({
            success: true,
            message: "Memory deleted successfully."
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

