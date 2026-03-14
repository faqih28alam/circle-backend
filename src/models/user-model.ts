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

// Get a user's profile by username
export const getUserProfile = async (username: string, currentUserId: number) => {
    const user = await prisma.user.findUnique({
        where: { username },
        select: {
            id: true,
            username: true,
            full_name: true,
            photo_profile: true,
            bio: true,
            _count: {
                select: {
                    followers: true,
                    following: true,
                    threads: true,
                },
            },
        },
    });

    if (!user) return null;

    // Check if current user is following this profile
    const isFollowing = await prisma.following.findUnique({
        where: {
            follower_id_following_id: {
                follower_id: currentUserId,
                following_id: user.id,
            },
        },
    });

    return {
        ...user,
        followersCount: user._count.followers,
        followingCount: user._count.following,
        threadsCount: user._count.threads,
        isFollowing: !!isFollowing,
        isOwnProfile: currentUserId === user.id,
    };
};

// Get all threads by a username
export const getUserThreads = async (username: string, currentUserId: number) => {
    const threads = await prisma.thread.findMany({
        where: {
            author: { username },
        },
        include: {
            author: {
                select: { id: true, username: true, full_name: true, photo_profile: true },
            },
            _count: {
                select: { likes: true, replies: true },
            },
            likes: {
                where: { user_id: currentUserId },
            },
        },
        orderBy: { created_at: "desc" },
    });

    return threads.map((thread) => ({
        ...thread,
        likes_count: thread._count.likes,
        replies_count: thread._count.replies,
        isLiked: thread.likes.length > 0,
    }));
};