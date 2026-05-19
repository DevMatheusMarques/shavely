import type { MigrationInterface, QueryRunner } from "typeorm";

export class InventorySchema1746300000000 implements MigrationInterface {
  name = "InventorySchema1746300000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE \`products\` (
        \`id\` char(36) NOT NULL,
        \`sku\` varchar(64) NOT NULL,
        \`name\` varchar(160) NOT NULL,
        \`description\` varchar(500) NULL,
        \`category\` varchar(80) NULL,
        \`unit\` varchar(16) NOT NULL,
        \`quantity\` int NOT NULL DEFAULT 0,
        \`min_quantity\` int NOT NULL DEFAULT 0,
        \`cost_cents\` int NOT NULL DEFAULT 0,
        \`created_at\` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        \`updated_at\` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
        \`deleted_at\` datetime(3) NULL,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`UQ_products_sku\` (\`sku\`),
        KEY \`IDX_products_deleted_at\` (\`deleted_at\`),
        KEY \`IDX_products_category\` (\`category\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await queryRunner.query(`
      CREATE TABLE \`stock_movements\` (
        \`id\` char(36) NOT NULL,
        \`product_id\` char(36) NOT NULL,
        \`type\` varchar(16) NOT NULL,
        \`quantity\` int NOT NULL,
        \`quantity_after\` int NOT NULL,
        \`reason\` varchar(255) NULL,
        \`performed_by_user_id\` char(36) NULL,
        \`created_at\` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        PRIMARY KEY (\`id\`),
        KEY \`IDX_stock_movements_product\` (\`product_id\`, \`created_at\`),
        CONSTRAINT \`FK_stock_movements_product\` FOREIGN KEY (\`product_id\`) REFERENCES \`products\`(\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query("DROP TABLE `stock_movements`");
    await queryRunner.query("DROP TABLE `products`");
  }
}
