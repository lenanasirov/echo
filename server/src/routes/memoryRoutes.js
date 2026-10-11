import { Router } from "express";

import { 
    getMemories, 
    postMemory,
    patchMemory,
    removeMemory,
    postLike,
    deleteLike,
    getComments,
    postComment,
    patchComment,
    deleteComment
} from "../controllers/memoryController.js";

import { 
    authenticate ,
    optionalAuthenticate
} from "../middleware/authMiddleware.js";

import { uploadMemoryImage } from "../middleware/uploadMiddleware.js";

const router = Router();

router.get("/", optionalAuthenticate, getMemories);
router.post("/", authenticate, uploadMemoryImage, postMemory);
router.patch("/:memoryId", authenticate, uploadMemoryImage, patchMemory);
router.delete("/:memoryId", authenticate, removeMemory);

router.post("/:memoryId/like", authenticate, postLike);
router.delete("/:memoryId/like", authenticate, deleteLike);

router.get("/:memoryId/comments", getComments);
router.post("/:memoryId/comments", authenticate, postComment);
router.patch("/:memoryId/comments/:commentId", authenticate, patchComment);
router.delete("/:memoryId/comments/:commentId", authenticate, deleteComment);

export default router;