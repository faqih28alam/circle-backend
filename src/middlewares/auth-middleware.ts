// auth-middleware.ts
// src/middlewares/auth-middleware.ts
// this middleware checks for a valid JWT token in the Authorization header
// wether the user is authenticated before allowing access to protected routes

import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";
import { PrismaClient } from "@prisma/client"; // Or however you access Prisma

const prisma = new PrismaClient();

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const decoded = verifyToken(token) as any;
    
    // FETCH THE ACTUAL USER DATA
    // The token usually only contains the ID. We need the full object.
    const user = await prisma.user.findUnique({
      where: { id: decoded.id }
    });

    if (!user) {
      res.status(401).json({ message: "User no longer exists" });
      return;
    }

    (req as any).user = user; // Now this contains bio, full_name, etc.
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
}