import { z } from "zod";

export const categorySchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(60, "Keep it under 60 characters"),
  description: z
    .string()
    .max(160, "Keep it under 160 characters")
    .optional()
    .or(z.literal("")),
});

export type CategoryFormValues = z.infer<typeof categorySchema>;
