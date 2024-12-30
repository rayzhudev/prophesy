// Domain Models
export interface User {
  id: string;
  authType: string;
  createdAt: string;
  twitter?: TwitterProfile;
  wallet?: WalletProfile;
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
  createdAt: string;
  updatedAt: string;
}

export interface WalletProfile {
  id: string;
  userId: string;
  address: string;
  walletType: string;
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

// API Response Types
export interface PaginatedResponse<T> {
  items: T[];
  nextCursor?: string;
}

// Input Types
export interface CreateUserInput {
  id: string;
  authType: string;
  twitter: {
    subject: string;
    username: string;
    name: string;
    profilePictureUrl: string;
    firstVerifiedAt: string;
    latestVerifiedAt: string;
  };
  wallet: {
    address: string;
    walletClient: string;
  };
}

export interface CreateTweetInput {
  content: string;
  userId: string;
}
