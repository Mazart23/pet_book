import { User } from "./user";
import { Comment } from "./comment";
import { Reaction } from "./reaction";

export type Post = {
  id: string;
  content: string;
  images: Array<string>;
  user: User;
  location: string;
  timestamp: string;
  reactions: Array<Reaction>;
};
