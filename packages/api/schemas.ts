import { z } from "zod";
import { TWEET_MAX_LENGTH } from "./types";

// Input schemas
export const createUserSchema = z.object({
  id: z.string(), // Privy DID
  authType: z.string(),
  twitter: z
    .object({
      subject: z.string(),
      username: z.string(),
      name: z.string(),
      profilePictureUrl: z.string(),
      firstVerifiedAt: z.string().transform((str) => new Date(str)),
      latestVerifiedAt: z.string().transform((str) => new Date(str)),
    })
    .optional(),
  wallets: z
    .array(
      z.object({
        address: z.string(),
        walletType: z.string(), // e.g. "smart_wallet", "eoa", etc.
        walletClientType: z.string(), // e.g. "privy", "kernel", etc.
      })
    )
    .optional()
    .default([]),
});

export const createTweetSchema = z.object({
  content: z.string().min(1).max(280),
  userId: z.string(), // Privy DID of the user
});

export const paginationSchema = z.object({
  limit: z.number().min(1).max(100).default(20),
  cursor: z.string().optional(),
});

export const getTwitterFollowersSchema = z.object({
  userId: z.string(),
  accessToken: z.string(),
});

export const tweetContentSchema = z
  .string()
  .min(1, "Tweet cannot be empty")
  .max(
    TWEET_MAX_LENGTH,
    `Tweet cannot be longer than ${TWEET_MAX_LENGTH} characters`
  )
  .refine(
    (content) => content.trim().length > 0,
    "Tweet cannot be only whitespace"
  );
