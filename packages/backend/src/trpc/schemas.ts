import { z } from "zod";

export const paginationSchema = z.object({
  limit: z.number().min(1).max(100).default(20),
  cursor: z.string().optional(),
});

export const tweetContentSchema = z
  .string()
  .min(1, "Tweet content cannot be empty")
  .max(280, "Tweet content cannot exceed 280 characters");
