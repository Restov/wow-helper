import { describe, expect, it } from "bun:test";

import type { UserServiceContract } from "../../../../apps/api/src/contracts/services/user-service";
import { createUserController } from "../../../../apps/api/src/controllers/user-controller";
import type { User } from "../../../../apps/api/src/models/user";

const user: User = {
  id: "8db06ca3-d265-4a86-b94c-209c4dfb93e5",
  status: "active",
  createdAt: new Date("2026-09-16T00:00:00.000Z"),
  updatedAt: new Date("2026-09-16T00:00:00.000Z"),
};

function createService(): UserServiceContract {
  return {
    create: async () => user,
    findById: async () => undefined,
  };
}

describe("UserController", () => {
  it("creates a user", async () => {
    const controller = createUserController(createService());

    const response = await controller.handle(
      new Request("http://localhost/users", { method: "POST" }),
    );

    expect(response.status).toBe(201);
    expect(await response.json()).toEqual({
      ...user,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    });
  });

  it("returns a user by ID", async () => {
    const service = createService();
    service.findById = async () => user;
    const controller = createUserController(service);

    const response = await controller.handle(
      new Request(`http://localhost/users/${user.id}`),
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      ...user,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    });
  });

  it("returns 404 when the user does not exist", async () => {
    const controller = createUserController(createService());

    const response = await controller.handle(
      new Request(
        "http://localhost/users/00000000-0000-4000-8000-000000000000",
      ),
    );

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ error: "User not found" });
  });

  it("rejects an invalid user ID", async () => {
    const controller = createUserController(createService());

    const response = await controller.handle(
      new Request("http://localhost/users/not-a-uuid"),
    );

    expect(response.status).toBe(422);
  });
});
