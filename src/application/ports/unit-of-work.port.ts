import type { AppointmentRepositoryPort } from "./appointment-repository.port.js";
import type { OutboxRepositoryPort } from "./outbox-repository.port.js";

export interface TransactionalRepositories {
  appointments: AppointmentRepositoryPort;
  outbox: OutboxRepositoryPort;
}

export interface UnitOfWorkPort {
  runInTransaction<T>(fn: (repos: TransactionalRepositories) => Promise<T>): Promise<T>;
}
