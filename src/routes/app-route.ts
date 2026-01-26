// app-route.ts 
// src/routes/app-route.ts

import express from "express";
import {
  createThread,
  getThreads,
  getThreadById,
  updateThread,
  deleteThread,
} from "../controllers/thread-controller";
import { toggleLike } from "../controllers/like-controller";
import { upload } from "../utils/multer";
import { authMiddleware } from "../middlewares/auth-middleware";

const router = express.Router();

// Thread Routes
router.get("/threads", authMiddleware, getThreads);
router.post("/thread", authMiddleware, upload.single("image"), createThread);

router.get("/thread/:id", authMiddleware, getThreadById);
router.put("/thread/:id", authMiddleware, upload.single("image"), updateThread);
router.delete("/thread/:id", authMiddleware, deleteThread);

// Like Routes
router.post("/like/:threadId", authMiddleware, toggleLike);

export default router;