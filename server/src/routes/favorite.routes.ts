import { Router } from "express";

import { authenticate } from "../middleware/auth.js";
import * as favoriteController from "../controllers/favorite.controller.js";

const router = Router();

router.use(authenticate);

router.get("/", favoriteController.listFavorites);
router.post("/", favoriteController.toggleFavorite);
router.delete("/:id", favoriteController.removeFavorite);

export default router;
