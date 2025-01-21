import { User } from "./user";

export type Reaction = {
  id: string;
  type: string;
  user: User;
};
