import type { Repository } from "typeorm";
import type {
  StockMovementListFilters,
  StockMovementRepositoryPort,
} from "../../../../application/ports/stock-movement-repository.port.js";
import { StockMovement } from "../../../../domain/entities/stock-movement.js";
import {
  stockMovementToDomain,
  stockMovementToOrm,
} from "../../mappers/stock-movement.mapper.js";
import type { StockMovementOrm } from "../entities/stock-movement.orm.js";

export class TypeormStockMovementRepository implements StockMovementRepositoryPort {
  constructor(private readonly repo: Repository<StockMovementOrm>) {}

  async save(movement: StockMovement): Promise<void> {
    await this.repo.save(stockMovementToOrm(movement));
  }

  async list(filters: StockMovementListFilters): Promise<StockMovement[]> {
    const qb = this.repo.createQueryBuilder("m").orderBy("m.createdAt", "DESC");
    if (filters.productId) {
      qb.andWhere("m.productId = :pid", { pid: filters.productId });
    }
    if (filters.type) {
      qb.andWhere("m.type = :t", { t: filters.type });
    }
    if (filters.from) {
      qb.andWhere("m.createdAt >= :from", { from: filters.from });
    }
    if (filters.to) {
      qb.andWhere("m.createdAt <= :to", { to: filters.to });
    }
    const rows = await qb.getMany();
    return rows.map(stockMovementToDomain);
  }
}
