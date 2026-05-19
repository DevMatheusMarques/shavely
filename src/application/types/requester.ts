import type { Role } from "../../domain/value-objects/role.js";

export interface Requester {
  userId: string;
  role: Role;
}
