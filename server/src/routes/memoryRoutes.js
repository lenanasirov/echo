import { Router } from "express";
import { getMemories, postMemory } from "../controllers/memoryController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/", getMemories);
router.post("/", authenticate ,postMemory);

export default router;