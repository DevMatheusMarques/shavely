import "reflect-metadata";
import { DataSource } from "typeorm";
import { loadEnv } from "../../config/env.js";
import { AppointmentOrm } from "../persistence/typeorm/entities/appointment.orm.js";
import { BarberAvailabilityOrm } from "../persistence/typeorm/entities/barber-availability.orm.js";
import { BarberOrm } from "../persistence/typeorm/entities/barber.orm.js";
import { EventLogOrm } from "../persistence/typeorm/entities/event-log.orm.js";
import { NotificationTokenOrm } from "../persistence/typeorm/entities/notification-token.orm.js";
import { OutboxMessageOrm } from "../persistence/typeorm/entities/outbox-message.orm.js";
import { ProductOrm } from "../persistence/typeorm/entities/product.orm.js";
import { ServiceOrm } from "../persistence/typeorm/entities/service.orm.js";
import { StockMovementOrm } from "../persistence/typeorm/entities/stock-movement.orm.js";
import { UserOrm } from "../persistence/typeorm/entities/user.orm.js";
import { InitialSchema1745976000000 } from "./migrations/1745976000000-InitialSchema.js";
import { AddSoftDeleteDeletedAt1746200000000 } from "./migrations/1746200000000-AddSoftDeleteDeletedAt.js";
import { InventorySchema1746300000000 } from "./migrations/1746300000000-InventorySchema.js";

const env = loadEnv();

/** Um único export default — exigido pelo CLI `typeorm migration:run -d`. */
export default new DataSource({
  type: "mysql",
  host: env.MYSQL_HOST,
  port: env.MYSQL_PORT,
  username: env.MYSQL_USER,
  password: env.MYSQL_PASSWORD,
  database: env.MYSQL_DATABASE,
  entities: [
    UserOrm,
    BarberOrm,
    ServiceOrm,
    BarberAvailabilityOrm,
    AppointmentOrm,
    NotificationTokenOrm,
    EventLogOrm,
    OutboxMessageOrm,
    ProductOrm,
    StockMovementOrm,
  ],
  migrations: [
    InitialSchema1745976000000,
    AddSoftDeleteDeletedAt1746200000000,
    InventorySchema1746300000000,
  ],
  synchronize: false,
  logging: env.NODE_ENV === "development",
});
