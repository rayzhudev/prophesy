// Generic Response Types
export interface PaginatedResponse<T> {
  items: T[];
  nextCursor?: string;
}

// Twitter Response Types
export interface TwitterFollowersResponse {
  followersCount: number;
  followingCount: number;
  tweetCount: number;
  listedCount: number;
  likeCount: number;
  mediaCount: number;
  lastFetched: Date;
}
