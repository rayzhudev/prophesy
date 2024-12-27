export interface User {
  id: string;
  username: string;
  email: string;
  tweets: Tweet[];
  createdAt: Date;
}

export interface Tweet {
  id: string;
  content: string;
  userId: string;
  createdAt: Date;
}
