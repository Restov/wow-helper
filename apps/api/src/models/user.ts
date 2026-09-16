export type UserStatus = "active" | "disabled";

export interface User {
  id: string;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
}
