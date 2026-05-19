import type { Product } from "../../domain/entities/product.js";

export interface ProductListFilters {
  search?: string;
  category?: string;
  lowStock?: boolean;
  includeDeleted?: boolean;
}

export interface ProductWithDeletionMeta {
  product: Product;
  deletedAt: Date | null;
}

export interface ProductRepositoryPort {
  save(product: Product): Promise<void>;
  findById(id: string, includeDeleted?: boolean): Promise<Product | null>;
  findByIdWithMeta(id: string, includeDeleted?: boolean): Promise<ProductWithDeletionMeta | null>;
  findBySku(sku: string, includeDeleted?: boolean): Promise<Product | null>;
  existsBySku(sku: string): Promise<boolean>;
  list(filters?: ProductListFilters): Promise<Product[]>;
  listWithMeta(filters?: ProductListFilters): Promise<ProductWithDeletionMeta[]>;
  softDelete(id: string): Promise<void>;
  restore(id: string): Promise<void>;
}
