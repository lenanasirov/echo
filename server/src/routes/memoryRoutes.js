import { Router } from "express";
import { getMemories, postMemory } from "../controllers/memoryController.js";

const router = Router();

router.get("/", getMemories);
router.post("/", postMemory);

export default router;