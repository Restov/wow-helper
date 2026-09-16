import { describe, expect, it } from "bun:test";

import { createApp } from "../../../apps/api/src/app";
import type { TelegramAccountServiceContract } from "../../../apps/api/src/contracts/services/telegram-account-service";
import type { UserServiceContract } from "../../../apps/api/src/contracts/services/user-service";
import type { User } from "../../../apps/api/src/models/user";

const user: User = {
  id: "8db06ca3-d265-4a86-b94c-209c4dfb93e5",
  status: "active",
  createdAt: new Date("2026-09-16T00:00:00.000Z"),
  updatedAt: new Date("2026-09-16T00:00:00.000Z"),
};

const userService: UserServiceContract = {
  create: async () => user,
  findById: async () => undefined,
};

const telegramAccountService: TelegramAccountServiceContract = {
  create: async () => {
    throw new Error("Not used in this test");
  },
  findByUserId: async () => undefined,
  findByTelegramUserId: async () => undefined,
};

function createTestApp() {
  return createApp({ userService, telegramAccountService });
}

describe("API", () => {
  it("returns the service health status", async () => {
    const response = await createTestApp().handle(
      new Request("http://localhost/health"),
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ status: "ok" });
  });

  it("returns 404 for an unknown route", async () => {
    const response = await createTestApp().handle(
      new Request("http://localhost/unknown"),
    );

    expect(response.status).toBe(404);
  });

  it("propagates the request ID", async () => {
    const response = await createTestApp().handle(
      new Request("http://localhost/health", {
        headers: { "x-request-id": "request-123" },
      }),
    );

    expect(response.headers.get("x-request-id")).toBe("request-123");
  });

  it("registers the user routes", async () => {
    const response = await createTestApp().handle(
      new Request("http://localhost/users", { method: "POST" }),
    );

    expect(response.status).toBe(201);
  });
});
