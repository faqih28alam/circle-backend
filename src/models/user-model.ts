// src/models/user-model.ts

import { prisma } from "../connection/client";

// Search users by username OR full_name (partial match, case-insensitive)
export const searchUsers = async (query: string, currentUserId: number) => {
    const results = await prisma.user.findMany({
        where: {
            OR: [
                { username: { contains: query, mode: "insensitive" } },
                { full_name: { contains: query, mode: "insensitive" } },
            ],
        },
        select: {
            id: true,
            username: true,
            full_name: true,
            photo_profile: true,
            bio: true,
        },
        take: 20,
    });

    // Check which users the current logged-in user is already following
    const followingRecords = await prisma.following.findMany({
        where: {
            follower_id: currentUserId,
            following_id: { in: results.map((u) => u.id) },
        },
        select: { following_id: true },
    });

    const followingSet = new Set(followingRecords.map((f) => f.following_id));

    return results.map((user) => ({
        ...user,
        isFollowing: followingSet.has(user.id),
    }));
};