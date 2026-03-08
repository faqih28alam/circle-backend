// src/controllers/user-controller.ts
import { Request, Response, NextFunction } from "express"
import { searchUsers } from "../models/user-model";

// controller to GET user by username or name
export const getUser = async (req: Request, res: Response) => {
    try {
        // Query params come from URL: /api/search?q=john
        const query = req.query.q as string;

        if (!query || query.trim() === "") {
            return res.status(400).json({
                success: false,
                message: "Search query is required. Use ?q=yoursearch",
            });
        }

        const users = await searchUsers(query.trim());

        return res.status(200).json({
            success: true,
            data: users,
        });

    } catch (error) {
        console.error("Search error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};