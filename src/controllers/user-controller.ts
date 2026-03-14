// src/controllers/user-controller.ts

import { Request, Response } from "express";
import { searchUsers, getUserProfile, getUserThreads } from "../models/user-model";

// GET /api/search?q=john
export const getUser = async (req: Request, res: Response) => {
    try {
        const query = req.query.q as string;

        if (!query || query.trim() === "") {
            return res.status(400).json({
                success: false,
                message: "Search query is required. Use ?q=yoursearch",
            });
        }

        const currentUserId = (req as any).user.id;
        const users = await searchUsers(query.trim(), currentUserId);

        return res.status(200).json({ success: true, data: users });
    } catch (error) {
        console.error("Search error:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// GET /api/users/:username — get a user's profile
export const getProfile = async (req: Request, res: Response) => {
    try {
        const username = req.params.username as string;
        const currentUserId = (req as any).user.id;

        const profile = await getUserProfile(username, currentUserId);

        if (!profile) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        return res.status(200).json({ success: true, data: profile });
    } catch (error) {
        console.error("Get profile error:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// GET /api/users/:username/threads — get all threads by a user
export const getProfileThreads = async (req: Request, res: Response) => {
    try {
        const username = req.params.username as string;
        const currentUserId = (req as any).user.id;

        const threads = await getUserThreads(username, currentUserId);

        return res.status(200).json({ success: true, data: threads });
    } catch (error) {
        console.error("Get profile threads error:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};