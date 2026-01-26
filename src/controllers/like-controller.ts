// like-controller.ts
// src/controllers/like-controller.ts

import { Request, Response } from "express";
import { prisma } from "../connection/client";


export const toggleLike = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id; 
    const threadId = parseInt(req.params.threadId as string);

    // Use the snake_case names defined in your Prisma model
    const existingLike = await prisma.like.findUnique({
      where: { 
        user_id_thread_id: { 
          user_id: userId, 
          thread_id: threadId 
        } 
      }
    });

    if (existingLike) {
      await prisma.like.delete({ where: { id: existingLike.id } });
      res.json({ message: "Unliked", isLiked: false });
    } else {
      // Use the snake_case names here too
      await prisma.like.create({ 
        data: { user_id: userId, thread_id: threadId } 
      });
      res.json({ message: "Liked", isLiked: true });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to toggle like" });
  }
};