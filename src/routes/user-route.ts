// src/routes/user-route.ts

import express from "express";
import {
    getUser
} from "../controllers/user-controller";
import { authMiddleware } from "../middlewares/auth-middleware";

const router = express.Router();

// Thread Routes
router.get("/search", authMiddleware, getUser);

export default router;