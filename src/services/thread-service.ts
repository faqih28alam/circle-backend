// thread-service.ts 
// src/services/thread-service.ts

import { prisma } from "../connection/client";

export const findAllThreads = async (currentUserId: number) => {
  const threads = await prisma.thread.findMany({
    include: {
      author: true, // Existing
      _count: {
        select: { 
          likes: true,    // This creates the 'likes_count' field
          replies: true   // This creates the 'replies_count' field
        }
      },
      likes: {
        where: {
          user_id: currentUserId
        }
      }
    },
    orderBy: { created_at: 'desc' }
  });

  // Map the data so the frontend gets simple 'likes_count' and 'isLiked' boolean
  return threads.map(thread => ({
    ...thread,
    likes_count: thread._count.likes,
    replies_count: thread._count.replies,
    isLiked: thread.likes.length > 0
  }));
};