import type { User } from "../models/user";

export function toUserResource(user: User) {
  return {
    id: user.id,
    status: user.status,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}
