import { Router } from "express";
import { getEchoCycles, postEchoCycle } from "../controllers/echoCycleController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/", getEchoCycles);
router.post("/", authenticate, postEchoCycle);

export default router;