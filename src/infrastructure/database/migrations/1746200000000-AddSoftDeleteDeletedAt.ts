import type { MigrationInterface, QueryRunner } from "typeorm";

export class AddSoftDeleteDeletedAt1746200000000 implements MigrationInterface {
  name = "AddSoftDeleteDeletedAt1746200000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE users ADD deleted_at timestamp(3) NULL`);
    await queryRunner.query(`ALTER TABLE barbers ADD deleted_at timestamp(3) NULL`);
    await queryRunner.query(`ALTER TABLE services ADD deleted_at timestamp(3) NULL`);
    await queryRunner.query(`ALTER TABLE barber_availability ADD deleted_at timestamp(3) NULL`);
    await queryRunner.query(`ALTER TABLE appointments ADD deleted_at timestamp(3) NULL`);
    await queryRunner.query(`CREATE INDEX idx_users_deleted_at ON users (deleted_at)`);
    await queryRunner.query(`CREATE INDEX idx_barbers_deleted_at ON barbers (deleted_at)`);
    await queryRunner.query(`CREATE INDEX idx_services_deleted_at ON services (deleted_at)`);
    await queryRunner.query(`CREATE INDEX idx_availability_deleted_at ON barber_availability (deleted_at)`);
    await queryRunner.query(`CREATE INDEX idx_appointments_deleted_at ON appointments (deleted_at)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX idx_appointments_deleted_at`);
    await queryRunner.query(`DROP INDEX idx_availability_deleted_at`);
    await queryRunner.query(`DROP INDEX idx_services_deleted_at`);
    await queryRunner.query(`DROP INDEX idx_barbers_deleted_at`);
    await queryRunner.query(`DROP INDEX idx_users_deleted_at`);
    await queryRunner.query(`ALTER TABLE appointments DROP COLUMN deleted_at`);
    await queryRunner.query(`ALTER TABLE barber_availability DROP COLUMN deleted_at`);
    await queryRunner.query(`ALTER TABLE services DROP COLUMN deleted_at`);
    await queryRunner.query(`ALTER TABLE barbers DROP COLUMN deleted_at`);
    await queryRunner.query(`ALTER TABLE users DROP COLUMN deleted_at`);
  }
}
