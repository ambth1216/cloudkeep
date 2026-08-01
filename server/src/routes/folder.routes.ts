import { Router } from "express";

import { authenticate } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import {
  createFolderSchema,
  renameFolderSchema,
} from "../schemas/folder.schema.js";
import * as folderController from "../controllers/folder.controller.js";

const router = Router();

router.use(authenticate);

router.get("/", folderController.listFolders);
router.get("/:id", folderController.getFolder);
router.post("/", validate(createFolderSchema), folderController.createFolder);
router.patch(
  "/:id/rename",
  validate(renameFolderSchema),
  folderController.renameFolder
);
router.delete("/:id", folderController.deleteFolder);
router.post("/:id/restore", folderController.restoreFolder);
router.get("/:id/breadcrumb", folderController.getBreadcrumb);

export default router;
