// src/models/user-model.ts

import { prisma } from "../connection/client";

//model to query username
export const searchUsers = async (query: string) => {
    const result = await prisma.user.findMany({
        where: {
            OR: [
                {
                    username: {
                        contains: query,
                        mode: "insensitive", // case-insensitive search
                    },
                },
                {
                    full_name: {
                        contains: query,
                        mode: "insensitive",
                    },
                },
            ],
        },
        select: {
            id: true,
            username: true,
            full_name: true,
            photo_profile: true,
            bio: true,
            // Never return password!
        },
        take: 20, // limit results to 20 users max
    });

    return result;
};