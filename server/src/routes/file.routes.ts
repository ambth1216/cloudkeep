import { Router } from "express";

import { authenticate } from "../middleware/auth.js";
import { uploadLimiter } from "../middleware/rateLimiter.js";
import { upload } from "../middleware/upload.js";
import { validate } from "../middleware/validate.js";
import { renameFileSchema, moveFileSchema, copyFileSchema } from "../schemas/file.schema.js";
import * as fileController from "../controllers/file.controller.js";

const router = Router();

router.use(authenticate);

// List & get
router.get("/", fileController.listFiles);
router.get("/trash", fileController.listTrashedFiles);
router.get("/:id", fileController.getFile);

// Upload
router.post(
  "/upload",
  uploadLimiter,
  upload.single("file"),
  fileController.uploadFile
);

// Download
router.get("/:id/download", fileController.downloadFile);

// Rename
router.patch(
  "/:id/rename",
  validate(renameFileSchema),
  fileController.renameFile
);

// Delete / Restore
router.delete("/:id", fileController.deleteFile);
router.post("/:id/restore", fileController.restoreFile);
router.delete("/:id/permanent", fileController.permanentDeleteFile);

// Move / Copy
router.post("/:id/move", validate(moveFileSchema), fileController.moveFile);
router.post("/:id/copy", validate(copyFileSchema), fileController.copyFile);

export default router;
