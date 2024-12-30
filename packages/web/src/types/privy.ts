import type { LinkedAccountWithMetadata } from "@privy-io/react-auth";
import type { CreateUserInput } from "@prophesy/api/types";

// Private interfaces for type assertions
interface PrivyTwitterFields {
  subject: string;
  username: string | null;
  name: string | null;
  profilePictureUrl: string | null;
  firstVerifiedAt: Date | null;
  latestVerifiedAt: Date | null;
}

interface PrivyWalletFields {
  address: string;
  walletClientType: string;
}

// Required fields for type checking
const REQUIRED_TWITTER_FIELDS = [
  "subject",
  "username",
  "name",
  "profilePictureUrl",
  "firstVerifiedAt",
  "latestVerifiedAt",
] as const;

const REQUIRED_WALLET_FIELDS = ["address", "walletClientType"] as const;

// Type guards
function isTwitterOAuth(account: LinkedAccountWithMetadata): boolean {
  return (
    account.type === "twitter_oauth" &&
    REQUIRED_TWITTER_FIELDS.every((field) => field in account)
  );
}

function isWallet(account: LinkedAccountWithMetadata): boolean {
  return (
    account.type === "wallet" &&
    REQUIRED_WALLET_FIELDS.every((field) => field in account)
  );
}

// Private helper functions
function getTwitterFields(
  account: LinkedAccountWithMetadata
): PrivyTwitterFields {
  return account as unknown as PrivyTwitterFields;
}

function getWalletFields(
  account: LinkedAccountWithMetadata
): PrivyWalletFields {
  return account as unknown as PrivyWalletFields;
}

/**
 * Converts Privy user data to our application's CreateUserInput format
 * @param userId - The Privy DID
 * @param twitterAccount - The Twitter OAuth account from Privy
 * @param walletAccount - The wallet account from Privy
 * @returns CreateUserInput if conversion succeeds, null if required fields are missing
 */
export function convertPrivyUserToCreateUserInput(
  userId: string,
  twitterAccount: LinkedAccountWithMetadata,
  walletAccount: LinkedAccountWithMetadata
): CreateUserInput | null {
  try {
    if (!isTwitterOAuth(twitterAccount) || !isWallet(walletAccount)) {
      console.warn("Missing required fields in Privy account data");
      return null;
    }

    const now = new Date().toISOString();
    const twitter = getTwitterFields(twitterAccount);
    const wallet = getWalletFields(walletAccount);

    return {
      id: userId,
      authType: twitterAccount.type,
      twitter: {
        subject: twitter.subject || "",
        username: twitter.username || "",
        name: twitter.name || "",
        profilePictureUrl: twitter.profilePictureUrl || "",
        firstVerifiedAt: twitter.firstVerifiedAt?.toISOString() || now,
        latestVerifiedAt: twitter.latestVerifiedAt?.toISOString() || now,
      },
      wallet: {
        address: wallet.address || "",
        walletClient: wallet.walletClientType || "",
      },
    };
  } catch (error) {
    console.error("Error converting Privy user data:", error);
    return null;
  }
}
