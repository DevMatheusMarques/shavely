import type { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1745976000000 implements MigrationInterface {
  name = "InitialSchema1745976000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);

    await queryRunner.query(`
      CREATE TABLE users (
        id char(36) NOT NULL,
        email varchar(255) NOT NULL,
        password_hash varchar(255) NOT NULL,
        role varchar(16) NOT NULL,
        name varchar(120) NOT NULL,
        phone_e164 varchar(20) NULL,
        created_at timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        CONSTRAINT uq_users_email UNIQUE (email)
      )
    `);
    await queryRunner.query(`
      CREATE TABLE barbers (
        id char(36) NOT NULL,
        user_id char(36) NOT NULL,
        created_at timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        CONSTRAINT uq_barbers_user UNIQUE (user_id),
        CONSTRAINT fk_barbers_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      )
    `);
    await queryRunner.query(`
      CREATE TABLE services (
        id char(36) NOT NULL,
        barber_id char(36) NOT NULL,
        name varchar(120) NOT NULL,
        duration_minutes int NOT NULL,
        price_cents int NOT NULL,
        created_at timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        CONSTRAINT fk_services_barber FOREIGN KEY (barber_id) REFERENCES barbers (id) ON DELETE CASCADE
      )
    `);
    await queryRunner.query(`CREATE INDEX idx_services_barber ON services (barber_id)`);
    await queryRunner.query(`
      CREATE TABLE barber_availability (
        id char(36) NOT NULL,
        barber_id char(36) NOT NULL,
        weekday smallint NOT NULL CHECK (weekday >= 0 AND weekday <= 6),
        start_minutes smallint NOT NULL CHECK (start_minutes >= 0 AND start_minutes <= 1440),
        end_minutes smallint NOT NULL CHECK (end_minutes >= 0 AND end_minutes <= 1440),
        PRIMARY KEY (id),
        CONSTRAINT fk_availability_barber FOREIGN KEY (barber_id) REFERENCES barbers (id) ON DELETE CASCADE
      )
    `);
    await queryRunner.query(
      `CREATE INDEX idx_availability_barber_weekday ON barber_availability (barber_id, weekday)`,
    );
    await queryRunner.query(`
      CREATE TABLE appointments (
        id char(36) NOT NULL,
        client_id char(36) NOT NULL,
        barber_id char(36) NOT NULL,
        service_id char(36) NOT NULL,
        starts_at timestamp(3) NOT NULL,
        ends_at timestamp(3) NOT NULL,
        status varchar(32) NOT NULL,
        reminder_sent_at timestamp(3) NULL,
        created_at timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        CONSTRAINT fk_appt_client FOREIGN KEY (client_id) REFERENCES users (id) ON DELETE CASCADE,
        CONSTRAINT fk_appt_barber FOREIGN KEY (barber_id) REFERENCES barbers (id) ON DELETE CASCADE,
        CONSTRAINT fk_appt_service FOREIGN KEY (service_id) REFERENCES services (id) ON DELETE RESTRICT
      )
    `);
    await queryRunner.query(`CREATE INDEX idx_appt_barber_starts ON appointments (barber_id, starts_at)`);
    await queryRunner.query(`CREATE INDEX idx_appt_client_starts ON appointments (client_id, starts_at)`);
    await queryRunner.query(`
      CREATE TABLE notification_tokens (
        id char(36) NOT NULL,
        user_id char(36) NOT NULL,
        token varchar(512) NOT NULL,
        platform varchar(16) NOT NULL,
        created_at timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        CONSTRAINT uq_notif_user_token UNIQUE (user_id, token),
        CONSTRAINT fk_notif_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      )
    `);
    await queryRunner.query(`
      CREATE TABLE event_logs (
        id char(36) NOT NULL,
        event_id char(36) NOT NULL,
        routing_key varchar(128) NOT NULL,
        consumer varchar(64) NOT NULL,
        created_at timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        CONSTRAINT uq_event_consumer UNIQUE (event_id, consumer)
      )
    `);
    await queryRunner.query(`
      CREATE TABLE outbox_messages (
        id char(36) NOT NULL,
        event_id char(36) NOT NULL,
        routing_key varchar(128) NOT NULL,
        payload text NOT NULL,
        created_at timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        published_at timestamp(3) NULL,
        PRIMARY KEY (id),
        CONSTRAINT uq_outbox_event UNIQUE (event_id)
      )
    `);
    await queryRunner.query(`CREATE INDEX idx_outbox_published ON outbox_messages (published_at)`);

    const adminId = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
    const hash = "$2a$10$.JHJ.UD7fqzgKILp3a7WH.t3mii9.BIAAdNNLVlUXpv8miQnt9wEW";
    await queryRunner.query(
      `INSERT INTO users (id, email, password_hash, role, name, phone_e164) VALUES ($1, $2, $3, 'ADMIN', 'Administrador', '+5511999999999')`,
      [adminId, "admin@shavely.local", hash],
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE outbox_messages`);
    await queryRunner.query(`DROP TABLE event_logs`);
    await queryRunner.query(`DROP TABLE notification_tokens`);
    await queryRunner.query(`DROP TABLE appointments`);
    await queryRunner.query(`DROP TABLE barber_availability`);
    await queryRunner.query(`DROP TABLE services`);
    await queryRunner.query(`DROP TABLE barbers`);
    await queryRunner.query(`DROP TABLE users`);
  }
}
