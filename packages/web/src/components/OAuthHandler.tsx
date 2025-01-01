import { useOAuthTokens, type OAuthTokens } from "@privy-io/react-auth";
import { trpc } from "../utils/trpc";

export function OAuthHandler() {
  const getFollowers = trpc.getTwitterFollowers.useMutation();

  useOAuthTokens({
    onOAuthTokenGrant: async (tokens: OAuthTokens, { user }) => {
      if (tokens.provider !== "twitter") {
        return;
      }

      const twitterAccount = user.linkedAccounts.find(
        (account) => account.type === "twitter_oauth"
      );

      if (!twitterAccount?.subject) {
        return;
      }

      try {
        await getFollowers.mutateAsync({
          userId: user.id,
          accessToken: tokens.accessToken,
        });
      } catch (error: unknown) {
        console.error("Error fetching follower count:", error);
        if (error instanceof Error && error.message) {
          if (error.message.includes("rate limit")) {
            console.log("Rate limited by Twitter API - will retry later");
          } else if (error.message.includes("permissions")) {
            console.log(
              "Permission error - user may need to reconnect Twitter"
            );
          }
        }
      }
    },
  });

  return null;
}
