import type { User } from "../../models/user";

export interface UserServiceContract {
  findById(id: string): Promise<User | undefined>;
  create(): Promise<User>;
}
