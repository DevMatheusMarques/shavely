import type { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1745976000000 implements MigrationInterface {
  name = "InitialSchema1745976000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE \`users\` (
        \`id\` char(36) NOT NULL,
        \`email\` varchar(255) NOT NULL,
        \`password_hash\` varchar(255) NOT NULL,
        \`role\` varchar(16) NOT NULL,
        \`name\` varchar(120) NOT NULL,
        \`phone_e164\` varchar(20) NULL,
        \`created_at\` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        \`updated_at\` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`UQ_users_email\` (\`email\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    await queryRunner.query(`
      CREATE TABLE \`barbers\` (
        \`id\` char(36) NOT NULL,
        \`user_id\` char(36) NOT NULL,
        \`created_at\` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        \`updated_at\` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`UQ_barbers_user\` (\`user_id\`),
        CONSTRAINT \`FK_barbers_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    await queryRunner.query(`
      CREATE TABLE \`services\` (
        \`id\` char(36) NOT NULL,
        \`barber_id\` char(36) NOT NULL,
        \`name\` varchar(120) NOT NULL,
        \`duration_minutes\` int NOT NULL,
        \`price_cents\` int NOT NULL,
        \`created_at\` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        \`updated_at\` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
        PRIMARY KEY (\`id\`),
        KEY \`IDX_services_barber\` (\`barber_id\`),
        CONSTRAINT \`FK_services_barber\` FOREIGN KEY (\`barber_id\`) REFERENCES \`barbers\`(\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    await queryRunner.query(`
      CREATE TABLE \`barber_availability\` (
        \`id\` char(36) NOT NULL,
        \`barber_id\` char(36) NOT NULL,
        \`weekday\` tinyint UNSIGNED NOT NULL,
        \`start_minutes\` smallint UNSIGNED NOT NULL,
        \`end_minutes\` smallint UNSIGNED NOT NULL,
        PRIMARY KEY (\`id\`),
        KEY \`IDX_availability_barber_weekday\` (\`barber_id\`, \`weekday\`),
        CONSTRAINT \`FK_availability_barber\` FOREIGN KEY (\`barber_id\`) REFERENCES \`barbers\`(\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    await queryRunner.query(`
      CREATE TABLE \`appointments\` (
        \`id\` char(36) NOT NULL,
        \`client_id\` char(36) NOT NULL,
        \`barber_id\` char(36) NOT NULL,
        \`service_id\` char(36) NOT NULL,
        \`starts_at\` datetime(3) NOT NULL,
        \`ends_at\` datetime(3) NOT NULL,
        \`status\` varchar(32) NOT NULL,
        \`reminder_sent_at\` datetime(3) NULL,
        \`created_at\` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        \`updated_at\` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
        PRIMARY KEY (\`id\`),
        KEY \`IDX_appt_barber_starts\` (\`barber_id\`, \`starts_at\`),
        KEY \`IDX_appt_client_starts\` (\`client_id\`, \`starts_at\`),
        CONSTRAINT \`FK_appt_client\` FOREIGN KEY (\`client_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE,
        CONSTRAINT \`FK_appt_barber\` FOREIGN KEY (\`barber_id\`) REFERENCES \`barbers\`(\`id\`) ON DELETE CASCADE,
        CONSTRAINT \`FK_appt_service\` FOREIGN KEY (\`service_id\`) REFERENCES \`services\`(\`id\`) ON DELETE RESTRICT
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    await queryRunner.query(`
      CREATE TABLE \`notification_tokens\` (
        \`id\` char(36) NOT NULL,
        \`user_id\` char(36) NOT NULL,
        \`token\` varchar(512) NOT NULL,
        \`platform\` varchar(16) NOT NULL,
        \`created_at\` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`UQ_notif_user_token\` (\`user_id\`, \`token\`),
        CONSTRAINT \`FK_notif_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    await queryRunner.query(`
      CREATE TABLE \`event_logs\` (
        \`id\` char(36) NOT NULL,
        \`event_id\` char(36) NOT NULL,
        \`routing_key\` varchar(128) NOT NULL,
        \`consumer\` varchar(64) NOT NULL,
        \`created_at\` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`UQ_event_consumer\` (\`event_id\`, \`consumer\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    await queryRunner.query(`
      CREATE TABLE \`outbox_messages\` (
        \`id\` char(36) NOT NULL,
        \`event_id\` char(36) NOT NULL,
        \`routing_key\` varchar(128) NOT NULL,
        \`payload\` text NOT NULL,
        \`created_at\` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        \`published_at\` datetime(3) NULL,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`UQ_outbox_event\` (\`event_id\`),
        KEY \`IDX_outbox_published\` (\`published_at\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    const adminId = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
    const hash = "$2a$10$.JHJ.UD7fqzgKILp3a7WH.t3mii9.BIAAdNNLVlUXpv8miQnt9wEW";
    await queryRunner.query(
      `INSERT INTO \`users\` (\`id\`, \`email\`, \`password_hash\`, \`role\`, \`name\`, \`phone_e164\`) VALUES (?, ?, ?, 'ADMIN', 'Administrador', '+5511999999999')`,
      [adminId, "admin@shavely.local", hash],
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE \`outbox_messages\``);
    await queryRunner.query(`DROP TABLE \`event_logs\``);
    await queryRunner.query(`DROP TABLE \`notification_tokens\``);
    await queryRunner.query(`DROP TABLE \`appointments\``);
    await queryRunner.query(`DROP TABLE \`barber_availability\``);
    await queryRunner.query(`DROP TABLE \`services\``);
    await queryRunner.query(`DROP TABLE \`barbers\``);
    await queryRunner.query(`DROP TABLE \`users\``);
  }
}
