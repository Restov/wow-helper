import type { User } from "../models/user";

export interface UserRepositoryContract {
  findById(id: string): Promise<User | undefined>;
  create(): Promise<User>;
}
