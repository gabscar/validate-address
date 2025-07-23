import z from "zod";

export const addressValidationSchema = z.object({
    address: z.string().min(1, 'Address is required').max(500, 'Address too long')
  });