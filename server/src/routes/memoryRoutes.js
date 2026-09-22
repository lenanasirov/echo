import { Router } from "express";

import { 
    getMemories, 
    postMemory,
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

const router = Router();

router.get("/", optionalAuthenticate, getMemories);
router.post("/", authenticate ,postMemory);

router.post("/:memoryId/like", authenticate, postLike);
router.delete("/:memoryId/like", authenticate, deleteLike);

router.get("/:memoryId/comments", getComments);
router.post("/:memoryId/comments", authenticate, postComment);
router.patch("/:memoryId/comments/:commentId", authenticate, patchComment);
router.delete("/:memoryId/comments/:commentId", authenticate, deleteComment);

export default router;