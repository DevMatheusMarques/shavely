import type { MigrationInterface, QueryRunner } from "typeorm";

export class InventorySchema1746300000000 implements MigrationInterface {
  name = "InventorySchema1746300000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE products (
        id char(36) NOT NULL,
        sku varchar(64) NOT NULL,
        name varchar(160) NOT NULL,
        description varchar(500) NULL,
        category varchar(80) NULL,
        unit varchar(16) NOT NULL,
        quantity int NOT NULL DEFAULT 0,
        min_quantity int NOT NULL DEFAULT 0,
        cost_cents int NOT NULL DEFAULT 0,
        created_at timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        deleted_at timestamp(3) NULL,
        PRIMARY KEY (id),
        CONSTRAINT uq_products_sku UNIQUE (sku)
      )
    `);
    await queryRunner.query(`CREATE INDEX idx_products_deleted_at ON products (deleted_at)`);
    await queryRunner.query(`CREATE INDEX idx_products_category ON products (category)`);

    await queryRunner.query(`
      CREATE TABLE stock_movements (
        id char(36) NOT NULL,
        product_id char(36) NOT NULL,
        type varchar(16) NOT NULL,
        quantity int NOT NULL,
        quantity_after int NOT NULL,
        reason varchar(255) NULL,
        performed_by_user_id char(36) NULL,
        created_at timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        CONSTRAINT fk_stock_movements_product FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE
      )
    `);
    await queryRunner.query(
      `CREATE INDEX idx_stock_movements_product ON stock_movements (product_id, created_at)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE stock_movements`);
    await queryRunner.query(`DROP TABLE products`);
  }
}
