import { z } from "zod";
import { TWEET_MAX_LENGTH } from "./types";

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
