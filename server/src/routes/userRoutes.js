import { Router } from "express";
import { getUsers, postUser, patchUser } from "../controllers/userController.js";

const router = Router();

router.get("/", getUsers);
router.post("/", postUser);
router.patch("/:id", patchUser);

export default router;