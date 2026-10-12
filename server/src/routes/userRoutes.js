import { Router } from "express";
import { patchUser } from "../controllers/userController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = Router();

router.patch("/me", authenticate, patchUser);

export default router;