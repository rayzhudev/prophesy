export interface TwitterFollowersResponse {
  meta: {
    result_count: number;
  };
  data?: {
    id: string;
    name: string;
    username: string;
  }[];
}
