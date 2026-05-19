import type { DataSource, EntityManager } from "typeorm";
import type {
  TransactionalRepositories,
  UnitOfWorkPort,
} from "../../../application/ports/unit-of-work.port.js";
import { TypeormAppointmentRepository } from "./repositories/typeorm-appointment.repository.js";
import { TypeormOutboxRepository } from "./repositories/typeorm-outbox.repository.js";
import { AppointmentOrm } from "./entities/appointment.orm.js";
import { OutboxMessageOrm } from "./entities/outbox-message.orm.js";

function buildRepos(manager: EntityManager): TransactionalRepositories {
  return {
    appointments: new TypeormAppointmentRepository(manager.getRepository(AppointmentOrm)),
    outbox: new TypeormOutboxRepository(manager.getRepository(OutboxMessageOrm)),
  };
}

export class TypeormUnitOfWork implements UnitOfWorkPort {
  constructor(private readonly dataSource: DataSource) {}

  async runInTransaction<T>(fn: (repos: TransactionalRepositories) => Promise<T>): Promise<T> {
    return this.dataSource.transaction(async (manager) => {
      return fn(buildRepos(manager));
    });
  }
}
