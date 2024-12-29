export interface User {
  id: string;
  username: string;
  email: string;
  createdAt: Date;
}

export interface Tweet {
  id: string;
  content: string;
  createdAt: Date;
}
