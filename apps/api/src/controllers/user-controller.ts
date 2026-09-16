import { Elysia, t } from "elysia";

import type { UserServiceContract } from "../contracts/services/user-service";
import { toUserResource } from "../resources/user-resource";

export function createUserController(userService: UserServiceContract) {
  return new Elysia({ prefix: "/users" })
    .post("/", async ({ set }) => {
      set.status = 201;

      return toUserResource(await userService.create());
    })
    .get(
      "/:id",
      async ({ params, set }) => {
        const user = await userService.findById(params.id);

        if (!user) {
          set.status = 404;

          return { error: "User not found" };
        }

        return toUserResource(user);
      },
      {
        params: t.Object({
          id: t.String({ format: "uuid" }),
        }),
      },
    );
}
