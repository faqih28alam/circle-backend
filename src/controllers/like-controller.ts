// like-controller.ts
// src/controllers/like-controller.ts

import { Request, Response } from "express";
import { prisma } from "../connection/client";

export const toggleLike = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id; 
    const threadId = parseInt(req.params.threadId as string);

    // Use the snake_case names defined in Prisma model
    const existingLike = await prisma.like.findUnique({
      where: { 
        user_id_thread_id: { 
          user_id: userId, 
          thread_id: threadId 
        } 
      }
    });
    // logic to toggle like & Unliked
    if (existingLike) {
      await prisma.like.delete({ where: { id: existingLike.id } });
      res.json({ message: "Unliked", isLiked: false });
    } else {
      // Use the snake_case names here too
      await prisma.like.create({ 
        data: { user_id: userId, thread_id: threadId } 
      });
      // res.json({ message: "Liked", isLiked: true });
    }
    
    // After Database update, get the new total count of likes
    const threadWithCount = await prisma.thread.findUnique({ 
      where: { id: threadId }, 
      include: { 
        _count: { select: { likes: true } } 
      } 
    });

    const io = req.app.get("io");
    // Broadcast to everyone: "This thread now has X likes"
    io.emit("updateLike", {
      threadId: threadId,
      newLikeCount: threadWithCount?._count.likes || 0
    });

    res.status(200).json({ message: "Like toggled successfully", isLiked: true });
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to toggle like" });
  }
};