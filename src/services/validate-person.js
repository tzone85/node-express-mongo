import { z } from "zod";

export const personCreateSchema = z.object({
  name: z.string().trim().min(1).max(120),
  age: z.number().int().min(0).max(150),
  email: z.string().trim().toLowerCase().email(),
});

export const personUpdateSchema = personCreateSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  { message: "at least one field is required" },
);
