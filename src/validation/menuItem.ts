import { z } from "zod";

export const menuItemSchema = z.object({
  category_id: z.string().uuid("Choose a category"),
  name: z.string().min(1, "Name is required").max(80, "Keep it under 80 characters"),
  description: z
    .string()
    .max(280, "Keep it under 280 characters")
    .optional()
    .or(z.literal("")),
  price: z
    .string()
    .min(1, "Price is required")
    .refine((val) => !Number.isNaN(Number(val)) && Number(val) >= 0, {
      message: "Enter a valid price",
    }),
  is_available: z.boolean(),
});

export type MenuItemFormValues = z.infer<typeof menuItemSchema>;
