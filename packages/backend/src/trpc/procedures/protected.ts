import { userProcedures } from "./protected/users.js";
import { tweetProcedures } from "./protected/tweets.js";
import { twitterProcedures } from "./protected/twitter.js";

export const protectedProcedures = {
  ...userProcedures,
  ...tweetProcedures,
  ...twitterProcedures,
};
