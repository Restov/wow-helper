import type { UserRepositoryContract } from "../contracts/repositories/user-repository";
import type { UserServiceContract } from "../contracts/services/user-service";
import type { User } from "../models/user";

export class UserService implements UserServiceContract {
  constructor(private readonly userRepository: UserRepositoryContract) {}

  findById(id: string): Promise<User | undefined> {
    return this.userRepository.findById(id);
  }

  create(): Promise<User> {
    return this.userRepository.create();
  }
}
