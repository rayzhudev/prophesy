import { z } from "zod";
import type { User, Tweet } from "./types";

// Input schemas
export const createUserSchema = z.object({
  username: z.string(),
  email: z.string().email(),
  password: z.string(),
});

export const createTweetSchema = z.object({
  content: z.string(),
  userId: z.string(),
});

// Procedure definitions
export type Procedures = {
  createUser: (input: z.infer<typeof createUserSchema>) => Promise<User>;
  getUsers: () => Promise<User[]>;
  createTweet: (input: z.infer<typeof createTweetSchema>) => Promise<Tweet>;
};

// Export type for tRPC
export type AppRouter = Procedures;
