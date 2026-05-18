import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string({
    required_error: "Name is required",
  }).min(2, "Name must be at least 2 characters long").max(50, "Name cannot exceed 50 characters"),
  email: z.string({
    required_error: "Email is required",
  }).email("Invalid email format"),
  password: z.string({
    required_error: "Password is required",
  }).min(6, "Password must be at least 6 characters long").max(100, "Password cannot exceed 100 characters"),
  role: z.enum(['Admin', 'Sales User'], {
    invalid_type_error: "Role must be either 'Admin' or 'Sales User'",
  }).optional(),
});

export const loginSchema = z.object({
  email: z.string({
    required_error: "Email is required",
  }).email("Invalid email format"),
  password: z.string({
    required_error: "Password is required",
  }).min(1, "Password is required"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
