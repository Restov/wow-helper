import { describe, expect, it } from "bun:test";

import { createApp } from "../../../apps/api/src/app";

describe("API", () => {
  it("returns the service health status", async () => {
    const response = await createApp().handle(
      new Request("http://localhost/health"),
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ status: "ok" });
  });

  it("returns 404 for an unknown route", async () => {
    const response = await createApp().handle(
      new Request("http://localhost/unknown"),
    );

    expect(response.status).toBe(404);
  });

  it("propagates the request ID", async () => {
    const response = await createApp().handle(
      new Request("http://localhost/health", {
        headers: { "x-request-id": "request-123" },
      }),
    );

    expect(response.headers.get("x-request-id")).toBe("request-123");
  });
});
