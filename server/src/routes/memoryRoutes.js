import { Router } from "express";

import { 
    getMemories, 
    postMemory,
    postLike,
    deleteLike
} from "../controllers/memoryController.js";

import { 
    authenticate ,
    optioanlAuthenticate
} from "../middleware/authMiddleware.js";

const router = Router();

router.get("/", optioanlAuthenticate, getMemories);
router.post("/", authenticate ,postMemory);

router.post("/:memoryId/like", authenticate, postLike);
router.delete("/:memoryId/like", authenticate, deleteLike);

export default router;