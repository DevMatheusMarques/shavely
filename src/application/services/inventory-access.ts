import { DomainError } from "../../domain/errors/domain-error.js";
import { Role } from "../../domain/value-objects/role.js";
import type { Requester } from "../types/requester.js";

/** ADMIN ou BARBER podem gerir o inventário interno da barbearia. */
export function assertCanManageInventory(requester: Requester): void {
  if (requester.role === Role.ADMIN || requester.role === Role.BARBER) {
    return;
  }
  throw new DomainError("Sem permissão para o módulo de estoque", "FORBIDDEN", 403);
}
