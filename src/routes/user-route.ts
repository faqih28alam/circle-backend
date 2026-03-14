// src/routes/user-route.ts

import express from "express";
import { getUser, getProfile, getProfileThreads } from "../controllers/user-controller";
import { authMiddleware } from "../middlewares/auth-middleware";

const router = express.Router();

router.get("/search", authMiddleware, getUser);                                  // GET /api/search?q=
router.get("/users/:username", authMiddleware, getProfile);                      // GET /api/users/:username
router.get("/users/:username/threads", authMiddleware, getProfileThreads);       // GET /api/users/:username/threads

export default router;