// auth-middleware.ts
// this middleware checks for a valid JWT token in the Authorization header
// wether the user is authenticated before allowing access to protected routes

// src/middleware/auth.middleware.ts
import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const decoded = verifyToken(token);
    (req as any).user = decoded as any;
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
    return;
  }
}