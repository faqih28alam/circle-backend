// src/controllers/follow-controller.ts

import { Request, Response } from "express";
import {
    getFollowers,
    getFollowing,
    followUser,
    unfollowUser,
} from "../models/follow-model";
import { string } from "joi";

// GET /api/follows/followers — get followers of logged-in user
export const handleGetFollowers = async (req: Request, res: Response) => {
    try {
        const currentUserId = (req as any).user.id;
        const followers = await getFollowers(currentUserId, currentUserId);

        return res.status(200).json({ success: true, data: followers });
    } catch (error) {
        console.error("Get followers error:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// GET /api/follows/following — get users that logged-in user is following
export const handleGetFollowing = async (req: Request, res: Response) => {
    try {
        const currentUserId = (req as any).user.id;
        const following = await getFollowing(currentUserId, currentUserId);

        return res.status(200).json({ success: true, data: following });
    } catch (error) {
        console.error("Get following error:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// POST /api/follows/:id — follow a user
export const handleFollowUser = async (req: Request, res: Response) => {
    try {
        const currentUserId = (req as any).user.id;
        const targetId = parseInt(req.params.id as string);

        if (isNaN(targetId)) {
            return res.status(400).json({ success: false, message: "Invalid user ID" });
        }

        await followUser(currentUserId, targetId);

        return res.status(201).json({ success: true, message: "Followed successfully" });
    } catch (error: any) {
        if (error.code === "P2002") {
            // Prisma unique constraint — already following
            return res.status(400).json({ success: false, message: "Already following this user" });
        }
        console.error("Follow error:", error);
        return res.status(500).json({ success: false, message: error.message || "Internal server error" });
    }
};

// DELETE /api/follows/:id — unfollow a user
export const handleUnfollowUser = async (req: Request, res: Response) => {
    try {
        const currentUserId = (req as any).user.id;
        const targetId = parseInt(req.params.id as string);

        if (isNaN(targetId)) {
            return res.status(400).json({ success: false, message: "Invalid user ID" });
        }

        await unfollowUser(currentUserId, targetId);

        return res.status(200).json({ success: true, message: "Unfollowed successfully" });
    } catch (error) {
        console.error("Unfollow error:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};