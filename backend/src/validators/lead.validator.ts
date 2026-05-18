import { z } from 'zod';

export const createLeadSchema = z.object({
  name: z.string({
    required_error: "Name is required",
  }).min(2, "Name must be at least 2 characters long").max(50, "Name cannot exceed 50 characters"),
  email: z.string({
    required_error: "Email is required",
  }).email("Invalid email format"),
  status: z.enum(['New', 'Contacted', 'Qualified', 'Lost'], {
    invalid_type_error: "Status must be: New, Contacted, Qualified, or Lost",
  }).optional(),
  source: z.enum(['Website', 'Instagram', 'Referral'], {
    required_error: "Source is required",
    invalid_type_error: "Source must be: Website, Instagram, or Referral",
  }),
});

export const updateLeadSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters long").max(50, "Name cannot exceed 50 characters").optional(),
  email: z.string().email("Invalid email format").optional(),
  status: z.enum(['New', 'Contacted', 'Qualified', 'Lost'], {
    invalid_type_error: "Status must be: New, Contacted, Qualified, or Lost",
  }).optional(),
  source: z.enum(['Website', 'Instagram', 'Referral'], {
    invalid_type_error: "Source must be: Website, Instagram, or Referral",
  }).optional(),
});

export type CreateLeadInput = z.infer<typeof createLeadSchema>;
export type UpdateLeadInput = z.infer<typeof updateLeadSchema>;
