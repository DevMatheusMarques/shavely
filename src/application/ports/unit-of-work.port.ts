import type { AppointmentRepositoryPort } from "./appointment-repository.port.js";
import type { OutboxRepositoryPort } from "./outbox-repository.port.js";
import type { ProductRepositoryPort } from "./product-repository.port.js";
import type { StockMovementRepositoryPort } from "./stock-movement-repository.port.js";

export interface TransactionalRepositories {
  appointments: AppointmentRepositoryPort;
  outbox: OutboxRepositoryPort;
}

export interface InventoryTransactionalRepositories {
  products: ProductRepositoryPort;
  movements: StockMovementRepositoryPort;
}

export interface UnitOfWorkPort {
  runInTransaction<T>(fn: (repos: TransactionalRepositories) => Promise<T>): Promise<T>;
  runInventoryTransaction<T>(
    fn: (repos: InventoryTransactionalRepositories) => Promise<T>,
  ): Promise<T>;
}
