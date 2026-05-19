import type { MigrationInterface, QueryRunner } from "typeorm";

export class AddSoftDeleteDeletedAt1746200000000 implements MigrationInterface {
  name = "AddSoftDeleteDeletedAt1746200000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`users\` ADD \`deleted_at\` datetime(3) NULL`);
    await queryRunner.query(`ALTER TABLE \`barbers\` ADD \`deleted_at\` datetime(3) NULL`);
    await queryRunner.query(`ALTER TABLE \`services\` ADD \`deleted_at\` datetime(3) NULL`);
    await queryRunner.query(`ALTER TABLE \`barber_availability\` ADD \`deleted_at\` datetime(3) NULL`);
    await queryRunner.query(`ALTER TABLE \`appointments\` ADD \`deleted_at\` datetime(3) NULL`);
    await queryRunner.query(`CREATE INDEX \`IDX_users_deleted_at\` ON \`users\` (\`deleted_at\`)`);
    await queryRunner.query(`CREATE INDEX \`IDX_barbers_deleted_at\` ON \`barbers\` (\`deleted_at\`)`);
    await queryRunner.query(`CREATE INDEX \`IDX_services_deleted_at\` ON \`services\` (\`deleted_at\`)`);
    await queryRunner.query(`CREATE INDEX \`IDX_availability_deleted_at\` ON \`barber_availability\` (\`deleted_at\`)`);
    await queryRunner.query(`CREATE INDEX \`IDX_appointments_deleted_at\` ON \`appointments\` (\`deleted_at\`)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX \`IDX_appointments_deleted_at\` ON \`appointments\``);
    await queryRunner.query(`DROP INDEX \`IDX_availability_deleted_at\` ON \`barber_availability\``);
    await queryRunner.query(`DROP INDEX \`IDX_services_deleted_at\` ON \`services\``);
    await queryRunner.query(`DROP INDEX \`IDX_barbers_deleted_at\` ON \`barbers\``);
    await queryRunner.query(`DROP INDEX \`IDX_users_deleted_at\` ON \`users\``);
    await queryRunner.query(`ALTER TABLE \`appointments\` DROP COLUMN \`deleted_at\``);
    await queryRunner.query(`ALTER TABLE \`barber_availability\` DROP COLUMN \`deleted_at\``);
    await queryRunner.query(`ALTER TABLE \`services\` DROP COLUMN \`deleted_at\``);
    await queryRunner.query(`ALTER TABLE \`barbers\` DROP COLUMN \`deleted_at\``);
    await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`deleted_at\``);
  }
}
