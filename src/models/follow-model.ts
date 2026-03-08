// src/models/follow-model.ts

import { prisma } from "../connection/client";

const userSelect = {
    id: true,
    username: true,
    full_name: true,
    photo_profile: true,
    bio: true,
};

// Get all followers of a user (people who follow ME)
export const getFollowers = async (userId: number, currentUserId: number) => {
    const followers = await prisma.following.findMany({
        where: { following_id: userId },
        include: {
            follower: { select: userSelect },
        },
    });

    // For each follower, check if the current logged-in user is already following them
    const followerIds = followers.map((f) => f.follower_id);
    const alreadyFollowing = await prisma.following.findMany({
        where: {
            follower_id: currentUserId,
            following_id: { in: followerIds },
        },
        select: { following_id: true },
    });

    const followingSet = new Set(alreadyFollowing.map((f) => f.following_id));

    return followers.map((f) => ({
        ...f.follower,
        isFollowing: followingSet.has(f.follower_id),
    }));
};

// Get all users that a user is following (people I follow)
export const getFollowing = async (userId: number, currentUserId: number) => {
    const following = await prisma.following.findMany({
        where: { follower_id: userId },
        include: {
            following: { select: userSelect },
        },
    });

    // For each following, check if the current logged-in user is already following them
    const followingIds = following.map((f) => f.following_id);
    const alreadyFollowing = await prisma.following.findMany({
        where: {
            follower_id: currentUserId,
            following_id: { in: followingIds },
        },
        select: { following_id: true },
    });

    const followingSet = new Set(alreadyFollowing.map((f) => f.following_id));

    return following.map((f) => ({
        ...f.following,
        isFollowing: followingSet.has(f.following_id),
    }));
};

// Get suggested users (people the current user is NOT following), limit to 5
export const getSuggestedUsers = async (currentUserId: number) => {
    // Get IDs of people the user already follows
    const alreadyFollowing = await prisma.following.findMany({
        where: { follower_id: currentUserId },
        select: { following_id: true },
    });

    const excludeIds = [
        currentUserId,
        ...alreadyFollowing.map((f) => f.following_id),
    ];

    const suggested = await prisma.user.findMany({
        where: { id: { notIn: excludeIds } },
        select: {
            id: true,
            username: true,
            full_name: true,
            photo_profile: true,
        },
        take: 5,
    });

    return suggested.map((u) => ({ ...u, isFollowing: false }));
};

// Follow a user
export const followUser = async (followerId: number, followingId: number) => {
    if (followerId === followingId) {
        throw new Error("You cannot follow yourself");
    }

    const result = await prisma.following.create({
        data: {
            follower_id: followerId,
            following_id: followingId,
        },
    });

    return result;
};

// Get follower & following counts for a user
export const getFollowCounts = async (userId: number) => {
    const [followersCount, followingCount] = await Promise.all([
        prisma.following.count({ where: { following_id: userId } }),
        prisma.following.count({ where: { follower_id: userId } }),
    ]);
    return { followersCount, followingCount };
};

// Unfollow a user
export const unfollowUser = async (followerId: number, followingId: number) => {
    const result = await prisma.following.delete({
        where: {
            follower_id_following_id: {
                follower_id: followerId,
                following_id: followingId,
            },
        },
    });

    return result;
};