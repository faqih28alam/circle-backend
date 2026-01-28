// auth-service.ts
import bcrypt from "bcrypt";
import { prisma } from "../connection/client";
import { generateToken } from "../utils/jwt";

export async function registerUser(
  username: string,
  full_name: string,
  email: string, 
  password: string, 
  photo_profile?: string,
  bio?: string
) {
  // Validate email and password
  if (!email.match(/@/) || password.length < 6) {
    throw new Error("Invalid email or password");
  }
  // Check if user already exists
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new Error("User already exists with this email");
  }
  // Check username availability
  const existingUsername = await prisma.user.findUnique({ where: { username } });
  if (existingUsername) {
    throw new Error("Username already exists");
  }

  const hashed = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: { username, full_name, email, password: hashed, photo_profile, bio },
  });

  const token = generateToken({ id: user.id, username: user.username });

  return { 
    user: {
      id: user.id, 
      username: user.username, 
      full_name: user.full_name, 
      email: user.email, 
      photo_profile: user.photo_profile,
      bio: user.bio,
    },
    token: token
  };
}

export async function loginUser(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error("User not found");

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error("Wrong password");

  const token = generateToken({ id: user.id, username: user.username });
  return { 
    token,
    user: {
      id: user.id, 
      username: user.username, 
      full_name: user.full_name, 
      email: user.email, 
      photo_profile: user.photo_profile,
      bio: user.bio,
    }
  };
}