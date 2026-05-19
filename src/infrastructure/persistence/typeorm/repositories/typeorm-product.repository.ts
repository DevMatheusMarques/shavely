import type { Repository } from "typeorm";
import type {
  ProductListFilters,
  ProductRepositoryPort,
  ProductWithDeletionMeta,
} from "../../../../application/ports/product-repository.port.js";
import { Product } from "../../../../domain/entities/product.js";
import { productToDomain, productToOrm } from "../../mappers/product.mapper.js";
import type { ProductOrm } from "../entities/product.orm.js";

export class TypeormProductRepository implements ProductRepositoryPort {
  constructor(private readonly repo: Repository<ProductOrm>) {}

  async save(product: Product): Promise<void> {
    await this.repo.save(productToOrm(product));
  }

  async findById(id: string, includeDeleted = false): Promise<Product | null> {
    const row = await this.repo.findOne({
      where: { id },
      withDeleted: includeDeleted,
    });
    return row ? productToDomain(row) : null;
  }

  async findByIdWithMeta(
    id: string,
    includeDeleted = false,
  ): Promise<ProductWithDeletionMeta | null> {
    const row = await this.repo.findOne({
      where: { id },
      withDeleted: includeDeleted,
    });
    if (!row) {
      return null;
    }
    return { product: productToDomain(row), deletedAt: row.deletedAt ?? null };
  }

  async findBySku(sku: string, includeDeleted = false): Promise<Product | null> {
    const row = await this.repo.findOne({
      where: { sku },
      withDeleted: includeDeleted,
    });
    return row ? productToDomain(row) : null;
  }

  async existsBySku(sku: string): Promise<boolean> {
    const count = await this.repo.count({ where: { sku } });
    return count > 0;
  }

  async list(filters?: ProductListFilters): Promise<Product[]> {
    const rows = await this.listOrmRows(filters);
    return rows.map(productToDomain);
  }

  async listWithMeta(filters?: ProductListFilters): Promise<ProductWithDeletionMeta[]> {
    const rows = await this.listOrmRows(filters);
    return rows.map((row) => ({
      product: productToDomain(row),
      deletedAt: row.deletedAt ?? null,
    }));
  }

  private async listOrmRows(filters?: ProductListFilters): Promise<ProductOrm[]> {
    const qb = this.repo.createQueryBuilder("p").orderBy("p.name", "ASC");
    if (!filters?.includeDeleted) {
      qb.andWhere("p.deletedAt IS NULL");
    }
    if (filters?.search) {
      qb.andWhere("(p.name LIKE :q OR p.sku LIKE :q)", { q: `%${filters.search}%` });
    }
    if (filters?.category) {
      qb.andWhere("p.category = :cat", { cat: filters.category });
    }
    if (filters?.lowStock) {
      qb.andWhere("p.quantity <= p.minQuantity");
    }
    if (filters?.includeDeleted) {
      qb.withDeleted();
    }
    return qb.getMany();
  }

  async softDelete(id: string): Promise<void> {
    await this.repo.softDelete({ id });
  }

  async restore(id: string): Promise<void> {
    await this.repo.restore({ id });
  }
}
