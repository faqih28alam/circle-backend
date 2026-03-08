// src/routes/follow-route.ts

import express from "express";
import {
    handleGetFollowers,
    handleGetFollowing,
    handleFollowUser,
    handleUnfollowUser,
    handleGetFollowCounts,
    handleGetSuggested,
} from "../controllers/follow-controller";
import { authMiddleware } from "../middlewares/auth-middleware";

const router = express.Router();

// IMPORTANT: specific routes must come BEFORE wildcard routes like /:id
router.get("/follows/count", authMiddleware, handleGetFollowCounts);      // GET follow counts
router.get("/follows/suggested", authMiddleware, handleGetSuggested);     // GET suggested users
router.get("/follows/followers", authMiddleware, handleGetFollowers);      // GET my followers
router.get("/follows/following", authMiddleware, handleGetFollowing);      // GET who I follow
router.post("/follows/:id", authMiddleware, handleFollowUser);             // Follow a user
router.delete("/follows/:id", authMiddleware, handleUnfollowUser);         // Unfollow a user

export default router;