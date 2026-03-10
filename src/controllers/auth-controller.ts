// controller-register.ts
// src/controllers/auth.controller.ts

import { Request, Response, NextFunction } from "express";
import { loginSchema, registerSchema } from "../validations/auth-validation";
import { registerUser, loginUser } from "../models/auth-model";
import { prisma } from "../connection/client";

// controller for Sign-Up
export async function handleRegister(req: Request, res: Response, next: NextFunction) {
  try {
    // Check wether user upload profile image or not
    // if (!req.file) {
    //   res.status(400).json({ message: "update profile image available in settings!" });
    //   next;
    // }
    // Implement joi to Validate Input
    const { error } = registerSchema.validate(req.body);
    if (error) {
      res.status(400).json({ message: error.message });
      return;
    }
    // Fetch User Input from Client
    const { email, password, username, full_name, bio } = req.body;
    const photo_profile = req.file ? req.file.filename : undefined;
    // Model querry to DB
    const { user, token } = await registerUser(username, full_name, email, password, photo_profile, bio);
    return res.status(201).json({ message: "User registered successfully", user, token });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
}

// controller for Sign-in
export async function handleLogin(req: Request, res: Response) {
  try {
    const { error } = loginSchema.validate(req.body);
    if (error) {
      res.status(400).json({ message: error.message });
      return;
    }

    const { email, password } = req.body;

    const result = await loginUser(email, password);
    res.json({ message: "Login success", ...result });
  } catch (err: any) {
    res.status(401).json({ message: err.message });
  }
}

// controller to check auth
export const checkAuth = async (req: Request, res: Response) => {
  try {
    res.json((req as any).user);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// controller to Update profile
export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { full_name, bio } = req.body;

    // Check if a new file was uploaded, otherwise keep the old one
    const updateData: any = { full_name, bio };
    if (req.file) {
      updateData.photo_profile = req.file.filename;
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    res.json({
      message: "Profile updated!",
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        full_name: updatedUser.full_name,
        email: updatedUser.email,
        photo_profile: updatedUser.photo_profile,
        bio: updatedUser.bio,
      }
    });

  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

