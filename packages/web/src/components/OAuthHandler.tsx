import { useOAuthTokens, type OAuthTokens } from "@privy-io/react-auth";
import { useFollowerCount } from "../context/FollowerContext";
import { trpc } from "../utils/trpc";

export function OAuthHandler() {
  const { setFollowerCount } = useFollowerCount();
  const getFollowers = trpc.getTwitterFollowers.useMutation();

  useOAuthTokens({
    onOAuthTokenGrant: async (tokens: OAuthTokens, { user }) => {
      console.log("🐦🐦🐦🐦🐦🐦🐦🐦🐦🐦🐦🐦🐦🐦🐦🐦🐦🐦🐦🐦🐦");
      console.log(tokens);
      console.log(user);
      console.log("🐦🐦🐦🐦🐦🐦🐦🐦🐦🐦🐦🐦🐦🐦🐦🐦🐦🐦🐦🐦🐦");
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
        console.log("Making request with token:", {
          provider: tokens.provider,
          scopes: tokens.scopes,
          // Don't log the full token for security
          tokenPreview: tokens.accessToken.substring(0, 10) + "...",
        });

        const result = await getFollowers.mutateAsync({
          userId: twitterAccount.subject,
          accessToken: tokens.accessToken,
        });

        if (result.meta?.result_count !== undefined) {
          setFollowerCount(result.meta.result_count);
        }
      } catch (error: any) {
        console.error("Error fetching follower count:", error);
        if (error.message.includes("rate limit")) {
          console.log("Rate limited by Twitter API - will retry later");
          // Could implement retry logic here
        } else if (error.message.includes("permissions")) {
          console.log("Permission error - user may need to reconnect Twitter");
          // Could prompt user to reconnect their Twitter account
        }
        // Keep the old follower count if there's an error
      }
    },
  });

  return null;
}
