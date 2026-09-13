import { Router } from "express";
import { getUsers, postUser, patchUser } from "../controllers/userController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/", getUsers);
router.post("/", postUser);
router.patch("/me", authenticate, patchUser);

export default router;