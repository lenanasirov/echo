import { Router } from "express";
import { getEchoCycles } from "../controllers/echoCycleController.js";

const router = Router();

router.get("/", getEchoCycles);

export default router;