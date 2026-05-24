import type { MigrationInterface, QueryRunner } from "typeorm";

export class ServiceCatalogAndBarberServices1746400000000 implements MigrationInterface {
  name = "ServiceCatalogAndBarberServices1746400000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE barber_services (
        id char(36) NOT NULL,
        barber_id char(36) NOT NULL,
        service_id char(36) NOT NULL,
        created_at timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        deleted_at timestamp(3) NULL,
        PRIMARY KEY (id),
        CONSTRAINT uq_barber_services_pair UNIQUE (barber_id, service_id),
        CONSTRAINT fk_barber_services_barber FOREIGN KEY (barber_id) REFERENCES barbers (id) ON DELETE CASCADE,
        CONSTRAINT fk_barber_services_service FOREIGN KEY (service_id) REFERENCES services (id) ON DELETE CASCADE
      )
    `);
    await queryRunner.query(`CREATE INDEX idx_barber_services_service ON barber_services (service_id)`);
    await queryRunner.query(`CREATE INDEX idx_barber_services_deleted ON barber_services (deleted_at)`);

    await queryRunner.query(`
      INSERT INTO barber_services (id, barber_id, service_id, created_at)
      SELECT gen_random_uuid()::text, barber_id, id, created_at FROM services
    `);

    await queryRunner.query(`ALTER TABLE services DROP CONSTRAINT fk_services_barber`);
    await queryRunner.query(`DROP INDEX idx_services_barber`);
    await queryRunner.query(`ALTER TABLE services DROP COLUMN barber_id`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE services ADD barber_id char(36) NULL`);
    await queryRunner.query(`
      UPDATE services s
      SET barber_id = bs.barber_id
      FROM (
        SELECT service_id, MIN(barber_id) AS barber_id
        FROM barber_services
        WHERE deleted_at IS NULL
        GROUP BY service_id
      ) bs
      WHERE bs.service_id = s.id
    `);
    await queryRunner.query(`ALTER TABLE services ALTER COLUMN barber_id SET NOT NULL`);
    await queryRunner.query(`CREATE INDEX idx_services_barber ON services (barber_id)`);
    await queryRunner.query(`
      ALTER TABLE services
      ADD CONSTRAINT fk_services_barber FOREIGN KEY (barber_id) REFERENCES barbers (id) ON DELETE CASCADE
    `);
    await queryRunner.query(`DROP TABLE barber_services`);
  }
}
