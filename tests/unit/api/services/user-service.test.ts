import { describe, expect, it } from "bun:test";

import type { UserRepositoryContract } from "../../../../apps/api/src/contracts/repositories/user-repository";
import type { User } from "../../../../apps/api/src/models/user";
import { UserService } from "../../../../apps/api/src/services/user-service";

const user: User = {
  id: "8db06ca3-d265-4a86-b94c-209c4dfb93e5",
  status: "active",
  createdAt: new Date("2026-09-16T00:00:00.000Z"),
  updatedAt: new Date("2026-09-16T00:00:00.000Z"),
};

describe("UserService", () => {
  it("creates a user through the repository", async () => {
    const repository: UserRepositoryContract = {
      create: async () => user,
      findById: async () => undefined,
    };
    const service = new UserService(repository);

    expect(await service.create()).toEqual(user);
  });

  it("finds a user through the repository", async () => {
    const repository: UserRepositoryContract = {
      create: async () => user,
      findById: async () => user,
    };
    const service = new UserService(repository);

    expect(await service.findById(user.id)).toEqual(user);
  });
});
