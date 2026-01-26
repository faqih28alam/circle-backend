// app-route.ts 
// src/routes/app-route.ts

import express from "express";
import {
  createThread,
  getThreads,
  getThreadById,
  getThreadReplies,
  updateThread,
  deleteThread,
  createReply
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
router.get("/thread/:id/replies", authMiddleware, getThreadReplies);
// Reply Routes
router.post("/reply", authMiddleware, upload.single("image"), createReply);
// Like Routes
router.post("/like/:threadId", authMiddleware, toggleLike);

export default router;