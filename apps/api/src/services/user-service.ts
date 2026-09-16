import type { UserRepositoryContract } from "../contracts/user-repository";

export class UserService {
  constructor(private readonly userRepository: UserRepositoryContract) {}
}
