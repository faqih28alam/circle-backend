// controller-register.ts
// src/controllers/auth.controller.ts

import { Request, Response } from "express";
import { loginSchema, registerSchema } from "../validations/auth-validation";
import { registerUser, loginUser } from "../services/auth-service";

// controller for register
export async function handleRegister(req: Request, res: Response) {
  try {
    if (!req.file) {
      res.status(400).json({ message: "please upload profile image!" });
      return;
    }
    
    const { error } = registerSchema.validate(req.body);
    if (error) {
      res.status(400).json({ message: error.message });
      return;
    }

    const { email, password, username, full_name, bio } = req.body;
    const photo_profile = req.file.filename;

    const { user, token } = await registerUser(username, full_name, email, password, photo_profile, bio);
    res.status(201).json({ message: "User registered successfully", user, token});
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
}

// controller for login
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
    // Your middleware should have already put the user in req.user
    // We send this back to the frontend to populate the RightBar
    res.json((req as any).user); 
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
