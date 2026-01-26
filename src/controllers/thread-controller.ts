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

// controller for getting a thread by id (Detail) -> GET /api/v1/thread/:id
export async function getThreadById(req: Request, res: Response) {
    try {
        const { id } = req.params;
        const userId = (req as any).user.id;
        // Use the ID from the authMiddleware
        const thread = await prisma.thread.findUnique({
            where: { id: Number(id) },
            include: {
                author: {
                    select: { id: true, username: true, full_name: true, photo_profile: true }
                },
                likes: {
                    where: { user_id: userId } // Check if the CURRENT user liked it
                },
                _count: {
                    select: { likes: true, replies: true }
                },
            },
        });
        // Check if thread exists
        if (!thread) return res.status(404).json({ message: "Thread not found" });
        // Send back the thread
        return res.status(200).json({
            code: 200,
            status: "success",
            message: "Get Data Thread Successfully",
            data: {
                id: thread.id,
                content: thread.content,
                image: thread.image,
                created_at: thread.created_at,
                author: thread.author,
                likes_count: thread._count.likes,
                replies_count: thread._count.replies,
                isLiked: thread.likes.length > 0 
            }
        });

    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
}

// Controller for getting replies of a thread GET /api/v1/thread/:id/replies
export async function getThreadReplies(req: Request, res: Response) {

    try {
        const { id } = req.params;
        const limit = Number(req.query.limit) || 25;

        // query for getting replies
        const replies = await prisma.reply.findMany({
            where: { thread_id: Number(id) },
            take: limit,
            include: {
                author: {
                    select: { id: true, username: true, full_name: true, photo_profile: true }
                }
            },
            orderBy: { created_at: 'desc' }
        });

        return res.status(200).json({
            code: 200,
            status: "success",
            message: "Get Replies Successfully",
            data: { replies }
        });

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
                image: req.file ? req.file.filename : null, 
                // Use the ID from your authenticated request
                author: { connect: { id: (req as any).user.id } }, 
            },
            include: { author: true }, // IMPORTANT: Include author for the WebSocket
        });

        const io = req.app.get("io");
        // Notify all clients that a new thread was created
        io.emit("newThread", thread);        
        
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

// controller for add Replies
export async function createReply(req: Request, res: Response) {
    try {
        const { content, thread_id } = req.body;
        const userId = (req as any).user.id;

        if (!content || !content.trim()) {
            return res.status(400).json({ message: "Reply content is required" });
        }

        // We use a transaction to ensure both operations succeed or fail together
        const result = await prisma.$transaction(async (tx) => {
            //  Create the reply
            const newReply = await tx.reply.create({
                data: {
                    content: content.trim(),
                    image: req.file ? req.file.filename : null,
                    thread: { connect: { id: Number(thread_id) } },
                    author: { connect: { id: userId } }
                },
                include: {
                    author: {
                        select: { id: true, username: true, full_name: true, photo_profile: true }
                    }
                }
            });

            // Increment the reply counter on the main thread
            await tx.thread.update({
                where: { id: Number(thread_id) },
                data: {
                    number_of_replies: { increment: 1 }
                }
            });

            return newReply;
        });

        return res.status(201).json({
            status: "success",
            message: "Reply created successfully",
            data: result
        });
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
}


