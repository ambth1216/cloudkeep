import { Router } from "express";

import { authenticate } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { searchQuerySchema } from "../schemas/search.schema.js";
import * as searchController from "../controllers/search.controller.js";

const router = Router();

router.use(authenticate);

router.get("/", validate(searchQuerySchema, "query"), searchController.search);

export default router;
