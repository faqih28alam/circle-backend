// auth.validation.ts
import Joi from "joi";

export const registerSchema = Joi.object({
  username: Joi.string().min(3).required(),   
  full_name: Joi.string().min(3).required(),  
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  bio: Joi.string().optional()                
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});