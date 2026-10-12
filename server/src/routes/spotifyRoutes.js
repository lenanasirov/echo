import { Router } from "express";
import { searchTracks } from "../controllers/spotifyController.js";

const router = Router();

router.get("/search", searchTracks);

export default router;