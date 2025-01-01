// Constants
export const TWEET_MAX_LENGTH = 280;

// Domain Models
export interface User {
  id: string;
  authType: string;
  createdAt: string;
  twitter?: TwitterProfile;
  wallets: WalletProfile[];
  tweets?: Tweet[];
}

export interface TwitterProfile {
  id: string;
  userId: string;
  twitterId: string;
  username: string;
  name: string;
  profilePictureUrl: string;
  firstVerifiedAt: string;
  latestVerifiedAt: string;
  followersCount?: number;
  followingCount?: number;
  tweetCount?: number;
  listedCount?: number;
  likeCount?: number;
  mediaCount?: number;
  lastMetricsFetch?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WalletProfile {
  id: string;
  userId: string;
  address: string;
  walletType: string;
  walletClientType: string;
  createdAt: string;
  updatedAt: string;
}

export interface Tweet {
  id: string;
  content: string;
  createdAt: string;
  userId: string;
  user?: User;
}

// Input Types
export interface CreateUserInput {
  id: string;
  authType: string;
  twitter?: {
    subject: string;
    username: string;
    name: string;
    profilePictureUrl: string;
    firstVerifiedAt?: Date;
    latestVerifiedAt?: Date;
  };
  wallets: {
    address: string;
    walletType: string;
    walletClientType: string;
  }[];
}

export interface CreateTweetInput {
  content: string;
  userId: string;
}
