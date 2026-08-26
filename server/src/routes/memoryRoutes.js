import { Router } from "express";
import { getMemories } from "../controllers/memoryController.js";

const router = Router();

router.get("/", getMemories);

export default router;