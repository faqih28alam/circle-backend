// thread-controller.ts
// src/controllers/thread-controller.ts

import { Request, Response, NextFunction } from "express";
import { prisma } from "../connection/client";
import AppError from "../utils/app-error";
import { findAllThreads } from "../services/thread-service";

// controller for getting all threads
export async function getThreads(req: Request, res: Response) {
    try {
        // Use the ID from the authMiddleware
        const userId = (req as any).user.id; 
        
        // Use the service to get likes_count and isLiked
        const threads = await findAllThreads(userId);

        res.json(threads);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
}

// controller for getting a thread by id
export async function getThreadById(req: Request, res: Response) {
    try {
        const { id } = req.params;
        const thread = await prisma.thread.findUnique({
            where: { id: Number(id) },
            include: {
                author: true,
                replies: true,
            },
        });
        if (!thread) {
            res.status(404).json({ message: "Thread not found" });
            return;
        }
        res.json(thread);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
}

// controller for creating a thread
export async function createThread(req: Request, res: Response, next: NextFunction) {
    try {
        const { content } = req.body;
        
        // Check if content is valid
        if (!content || !content.trim() || content.length > 500) {
        return res.status(400).json({
            status: "error",
            message: "Invalid thread content",
        });
        }        

        const image = req.file ? req.file.filename : null;

        const thread = await prisma.thread.create({
            data: { 
                content: content.trim(), 
                image, 
                // Use the ID from your authenticated request
                author: { connect: { id: (req as any).user.id } }, 
            },
        });
        
        return res.status(201).json({
            status: "success", 
            message: "Thread created successfully", 
            data: thread,
        });
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
}

// controller for updating a thread
export async function updateThread(req: Request, res: Response) {
    try {
        const { id } = req.params;
        const { content, image } = req.body;
        const thread = await prisma.thread.update({
            where: { id: Number(id) },
            data: { content, image },
        });
        res.json(thread);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
}

// controller for deleting a thread
export async function deleteThread(req: Request, res: Response) {
    try {
        const { id } = req.params;
        const thread = await prisma.thread.delete({
            where: { id: Number(id) },
        });
        res.json(thread);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
}


