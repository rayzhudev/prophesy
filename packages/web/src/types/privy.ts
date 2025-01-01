import type {
  LinkedAccountWithMetadata,
  User as PrivyUser,
} from "@privy-io/react-auth";
import { createUserSchema } from "@prophesy/api/schemas";
import { z } from "zod";

type RawCreateUserSchema = z.input<typeof createUserSchema>;

// Required fields for type checking
const REQUIRED_TWITTER_FIELDS = [
  "subject",
  "username",
  "name",
  "picture",
  "connectedAt",
] as const;

const REQUIRED_WALLET_FIELDS = ["address"] as const;

// Type guards
function isTwitterOAuth(
  account: LinkedAccountWithMetadata
): account is LinkedAccountWithMetadata & {
  type: "twitter_oauth";
  subject: string;
  username: string | null;
  name: string | null;
  picture: string | null;
  connectedAt: Date;
} {
  return (
    account.type === "twitter_oauth" &&
    REQUIRED_TWITTER_FIELDS.every((field) => field in account)
  );
}

function isWallet(
  account: LinkedAccountWithMetadata
): account is LinkedAccountWithMetadata & {
  type: "wallet" | "smart_wallet";
  address: string;
  walletClient: string;
} {
  return (
    (account.type === "wallet" || account.type === "smart_wallet") &&
    REQUIRED_WALLET_FIELDS.every((field) => field in account)
  );
}

/**
 * Converts Privy user data to our application's CreateUserInput format
 * @param privyUser - The Privy user object
 * @returns Raw schema type that will be transformed by zod
 */
export function convertPrivyUserToCreateUserInput(
  privyUser: PrivyUser
): RawCreateUserSchema {
  try {
    let twitter = undefined;
    const wallets: RawCreateUserSchema["wallets"] = [];

    // Find Twitter and wallet accounts
    const twitterAccount = privyUser.linkedAccounts.find(
      (account) => account.type === "twitter_oauth"
    );
    const walletAccount = privyUser.linkedAccounts.find(
      (account) => account.type === "wallet"
    );
    const smartWalletAccount = privyUser.linkedAccounts.find(
      (account) => account.type === "smart_wallet"
    );

    // Convert Twitter data if available
    if (twitterAccount && isTwitterOAuth(twitterAccount)) {
      twitter = {
        subject: twitterAccount.subject,
        username: twitterAccount.username || "",
        name: twitterAccount.name || "",
        profilePictureUrl: twitterAccount.picture || "",
        firstVerifiedAt: twitterAccount.connectedAt.toISOString(),
        latestVerifiedAt: twitterAccount.connectedAt.toISOString(),
      };
    }

    // Convert wallet data if available
    if (walletAccount && isWallet(walletAccount)) {
      wallets.push({
        address: walletAccount.address,
        walletType: walletAccount.type,
        walletClientType: walletAccount.walletClientType || walletAccount.walletClient,
      });
    }

    if (smartWalletAccount && isWallet(smartWalletAccount)) {
      wallets.push({
        address: smartWalletAccount.address,
        walletType: smartWalletAccount.type,
        walletClientType: smartWalletAccount.smartWalletType,
      });
    }

    return {
      id: privyUser.id,
      authType: twitterAccount?.type || "wallet",
      twitter,
      wallets,
    };
  } catch (error) {
    console.error("Error converting Privy user data:", error);
    // Return minimal valid input instead of null
    return {
      id: privyUser.id,
      authType: "wallet",
      wallets: [],
    };
  }
}
