import type { DataSource, EntityManager } from "typeorm";
import type {
  InventoryTransactionalRepositories,
  TransactionalRepositories,
  UnitOfWorkPort,
} from "../../../application/ports/unit-of-work.port.js";
import { TypeormAppointmentRepository } from "./repositories/typeorm-appointment.repository.js";
import { TypeormOutboxRepository } from "./repositories/typeorm-outbox.repository.js";
import { TypeormProductRepository } from "./repositories/typeorm-product.repository.js";
import { TypeormStockMovementRepository } from "./repositories/typeorm-stock-movement.repository.js";
import { AppointmentOrm } from "./entities/appointment.orm.js";
import { OutboxMessageOrm } from "./entities/outbox-message.orm.js";
import { ProductOrm } from "./entities/product.orm.js";
import { StockMovementOrm } from "./entities/stock-movement.orm.js";

function buildRepos(manager: EntityManager): TransactionalRepositories {
  return {
    appointments: new TypeormAppointmentRepository(manager.getRepository(AppointmentOrm)),
    outbox: new TypeormOutboxRepository(manager.getRepository(OutboxMessageOrm)),
  };
}

function buildInventoryRepos(manager: EntityManager): InventoryTransactionalRepositories {
  return {
    products: new TypeormProductRepository(manager.getRepository(ProductOrm)),
    movements: new TypeormStockMovementRepository(manager.getRepository(StockMovementOrm)),
  };
}

export class TypeormUnitOfWork implements UnitOfWorkPort {
  constructor(private readonly dataSource: DataSource) {}

  async runInTransaction<T>(fn: (repos: TransactionalRepositories) => Promise<T>): Promise<T> {
    return this.dataSource.transaction(async (manager) => {
      return fn(buildRepos(manager));
    });
  }

  async runInventoryTransaction<T>(
    fn: (repos: InventoryTransactionalRepositories) => Promise<T>,
  ): Promise<T> {
    return this.dataSource.transaction(async (manager) => {
      return fn(buildInventoryRepos(manager));
    });
  }
}
