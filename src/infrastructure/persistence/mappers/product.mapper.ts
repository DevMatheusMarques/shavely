import { Product } from "../../../domain/entities/product.js";
import { ProductOrm } from "../typeorm/entities/product.orm.js";

export function productToDomain(row: ProductOrm): Product {
  return new Product({
    id: row.id,
    sku: row.sku,
    name: row.name,
    description: row.description,
    category: row.category,
    unit: row.unit,
    quantity: row.quantity,
    minQuantity: row.minQuantity,
    costCents: row.costCents,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  });
}

export function productToOrm(product: Product): ProductOrm {
  const p = product.toProps();
  const row = new ProductOrm();
  row.id = p.id;
  row.sku = p.sku;
  row.name = p.name;
  row.description = p.description;
  row.category = p.category;
  row.unit = p.unit;
  row.quantity = p.quantity;
  row.minQuantity = p.minQuantity;
  row.costCents = p.costCents;
  row.createdAt = p.createdAt;
  row.updatedAt = p.updatedAt;
  return row;
}
