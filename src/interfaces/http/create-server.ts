import Fastify from "fastify";
import cors from "@fastify/cors";
import rateLimit from "@fastify/rate-limit";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import { swaggerOptions } from "./openapi/swagger-options.js";
import { healthResponseSchema } from "./openapi/schemas.js";
import type { FastifyInstance } from "fastify";
import AppDataSource from "../../infrastructure/database/data-source.js";
import { loadEnv } from "../../config/env.js";
import { TypeormUserRepository } from "../../infrastructure/persistence/typeorm/repositories/typeorm-user.repository.js";
import { TypeormBarberRepository } from "../../infrastructure/persistence/typeorm/repositories/typeorm-barber.repository.js";
import { TypeormServiceRepository } from "../../infrastructure/persistence/typeorm/repositories/typeorm-service.repository.js";
import { TypeormAppointmentRepository } from "../../infrastructure/persistence/typeorm/repositories/typeorm-appointment.repository.js";
import { TypeormNotificationTokenRepository } from "../../infrastructure/persistence/typeorm/repositories/typeorm-notification-token.repository.js";
import { TypeormProductRepository } from "../../infrastructure/persistence/typeorm/repositories/typeorm-product.repository.js";
import { TypeormStockMovementRepository } from "../../infrastructure/persistence/typeorm/repositories/typeorm-stock-movement.repository.js";
import { TypeormUnitOfWork } from "../../infrastructure/persistence/typeorm/typeorm-unit-of-work.js";
import { UserOrm } from "../../infrastructure/persistence/typeorm/entities/user.orm.js";
import { BarberOrm } from "../../infrastructure/persistence/typeorm/entities/barber.orm.js";
import { BarberAvailabilityOrm } from "../../infrastructure/persistence/typeorm/entities/barber-availability.orm.js";
import { ServiceOrm } from "../../infrastructure/persistence/typeorm/entities/service.orm.js";
import { AppointmentOrm } from "../../infrastructure/persistence/typeorm/entities/appointment.orm.js";
import { NotificationTokenOrm } from "../../infrastructure/persistence/typeorm/entities/notification-token.orm.js";
import { ProductOrm } from "../../infrastructure/persistence/typeorm/entities/product.orm.js";
import { StockMovementOrm } from "../../infrastructure/persistence/typeorm/entities/stock-movement.orm.js";
import { SystemClock } from "../../infrastructure/time/system-clock.js";
import { BcryptPasswordHasher } from "../../infrastructure/auth/bcrypt-password-hasher.js";
import { JwtTokenService } from "../../infrastructure/auth/jwt-token.service.js";
import { RegisterClientUseCase } from "../../application/use-cases/auth/register-client.use-case.js";
import { LoginUseCase } from "../../application/use-cases/auth/login.use-case.js";
import { CreateBarberByAdminUseCase } from "../../application/use-cases/admin/create-barber-by-admin.use-case.js";
import { CreateClientByAdminUseCase } from "../../application/use-cases/admin/create-client-by-admin.use-case.js";
import { GetBarberAdminUseCase } from "../../application/use-cases/admin/get-barber-admin.use-case.js";
import { GetUserAdminUseCase } from "../../application/use-cases/admin/get-user-admin.use-case.js";
import {
  CreateServiceAdminUseCase,
  ListServicesByBarberAdminUseCase,
  RestoreServiceAdminUseCase,
  SoftDeleteServiceAdminUseCase,
  UpdateServiceAdminUseCase,
} from "../../application/use-cases/admin/admin-services-crud.use-case.js";
import { ListBarbersAdminUseCase } from "../../application/use-cases/admin/list-barbers-admin.use-case.js";
import { ListUsersAdminUseCase } from "../../application/use-cases/admin/list-users-admin.use-case.js";
import { RestoreBarberAdminUseCase } from "../../application/use-cases/admin/restore-barber-admin.use-case.js";
import { RestoreUserAdminUseCase } from "../../application/use-cases/admin/restore-user-admin.use-case.js";
import { SoftDeleteBarberAdminUseCase } from "../../application/use-cases/admin/soft-delete-barber-admin.use-case.js";
import { SoftDeleteUserAdminUseCase } from "../../application/use-cases/admin/soft-delete-user-admin.use-case.js";
import { UpdateBarberAdminUseCase } from "../../application/use-cases/admin/update-barber-admin.use-case.js";
import { UpdateUserAdminUseCase } from "../../application/use-cases/admin/update-user-admin.use-case.js";
import { CreateAppointmentUseCase } from "../../application/use-cases/appointments/create-appointment.use-case.js";
import { CancelAppointmentUseCase } from "../../application/use-cases/appointments/cancel-appointment.use-case.js";
import { ListAppointmentsUseCase } from "../../application/use-cases/appointments/list-appointments.use-case.js";
import { GetAppointmentUseCase } from "../../application/use-cases/appointments/get-appointment.use-case.js";
import {
  RestoreAppointmentAdminUseCase,
  SoftDeleteAppointmentAdminUseCase,
  UpdateAppointmentUseCase,
} from "../../application/use-cases/appointments/appointment-admin-crud.use-case.js";
import { CreateServiceUseCase } from "../../application/use-cases/services/create-service.use-case.js";
import { SetBarberAvailabilityUseCase } from "../../application/use-cases/barbers/set-barber-availability.use-case.js";
import {
  CreateAvailabilitySlotUseCase,
  GetAvailabilitySlotUseCase,
  ListMyAvailabilityUseCase,
  RestoreAvailabilitySlotUseCase,
  SoftDeleteAvailabilitySlotUseCase,
  UpdateAvailabilitySlotUseCase,
} from "../../application/use-cases/barbers/barber-availability-crud.use-case.js";
import { RegisterDeviceTokenUseCase } from "../../application/use-cases/notifications/register-device-token.use-case.js";
import { ListBookableBarbersUseCase } from "../../application/use-cases/barbers/list-bookable-barbers.use-case.js";
import { ListServicesByBarberUseCase } from "../../application/use-cases/services/list-services-by-barber.use-case.js";
import {
  GetServiceByBarberUseCase,
  ListMyServicesUseCase,
  RestoreServiceUseCase,
  SoftDeleteServiceUseCase,
  UpdateServiceUseCase,
} from "../../application/use-cases/services/barber-service-crud.use-case.js";
import { CreateProductUseCase } from "../../application/use-cases/inventory/create-product.use-case.js";
import { GetProductUseCase } from "../../application/use-cases/inventory/get-product.use-case.js";
import { ListProductsUseCase } from "../../application/use-cases/inventory/list-products.use-case.js";
import { ListStockMovementsUseCase } from "../../application/use-cases/inventory/list-stock-movements.use-case.js";
import { RegisterStockMovementUseCase } from "../../application/use-cases/inventory/register-stock-movement.use-case.js";
import { RestoreProductUseCase } from "../../application/use-cases/inventory/restore-product.use-case.js";
import { SoftDeleteProductUseCase } from "../../application/use-cases/inventory/soft-delete-product.use-case.js";
import { UpdateProductUseCase } from "../../application/use-cases/inventory/update-product.use-case.js";
import { registerErrorHandler } from "./plugins/error-handler.plugin.js";
import { registerRequestLogging } from "./plugins/logging.plugin.js";
import { createAuthenticate, createRequireRoles } from "./auth/authenticate.js";
import { Role } from "../../domain/value-objects/role.js";
import { registerAuthRoutes } from "./routes/auth.routes.js";
import { registerAppointmentRoutes } from "./routes/appointments.routes.js";
import { registerAdminRoutes } from "./routes/admin.routes.js";
import { registerBarberRoutes } from "./routes/barber.routes.js";
import { registerInventoryRoutes } from "./routes/inventory.routes.js";
import { registerPublicRoutes } from "./routes/public.routes.js";

export async function createServer(): Promise<FastifyInstance> {
  const env = loadEnv();
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }

  const users = new TypeormUserRepository(AppDataSource.getRepository(UserOrm));
  const barbers = new TypeormBarberRepository(
    AppDataSource.getRepository(BarberOrm),
    AppDataSource.getRepository(BarberAvailabilityOrm),
  );
  const services = new TypeormServiceRepository(AppDataSource.getRepository(ServiceOrm));
  const appointments = new TypeormAppointmentRepository(AppDataSource.getRepository(AppointmentOrm));
  const notificationTokens = new TypeormNotificationTokenRepository(
    AppDataSource.getRepository(NotificationTokenOrm),
  );
  const products = new TypeormProductRepository(AppDataSource.getRepository(ProductOrm));
  const stockMovements = new TypeormStockMovementRepository(
    AppDataSource.getRepository(StockMovementOrm),
  );
  const uow = new TypeormUnitOfWork(AppDataSource);
  const clock = new SystemClock();
  const hasher = new BcryptPasswordHasher();
  const tokens = new JwtTokenService(env);

  const registerClient = new RegisterClientUseCase(users, hasher, clock);
  const login = new LoginUseCase(users, hasher, tokens);
  const createBarberByAdmin = new CreateBarberByAdminUseCase(users, barbers, hasher, clock);
  const createAppointment = new CreateAppointmentUseCase(
    appointments,
    barbers,
    services,
    users,
    uow,
    clock,
  );
  const cancelAppointment = new CancelAppointmentUseCase(appointments, barbers, users, uow, clock);
  const listAppointments = new ListAppointmentsUseCase(appointments, barbers);
  const getAppointment = new GetAppointmentUseCase(appointments, barbers);
  const updateAppointment = new UpdateAppointmentUseCase(appointments, barbers, services, clock);
  const softDeleteAppointmentAdmin = new SoftDeleteAppointmentAdminUseCase(appointments);
  const restoreAppointmentAdmin = new RestoreAppointmentAdminUseCase(appointments);
  const createService = new CreateServiceUseCase(barbers, services, clock);
  const setAvailability = new SetBarberAvailabilityUseCase(barbers);
  const registerDeviceToken = new RegisterDeviceTokenUseCase(notificationTokens);
  const listBookableBarbers = new ListBookableBarbersUseCase(barbers, users);
  const listServicesByBarber = new ListServicesByBarberUseCase(services);
  const listMyServices = new ListMyServicesUseCase(barbers, services);
  const getServiceByBarber = new GetServiceByBarberUseCase(barbers, services);
  const updateService = new UpdateServiceUseCase(barbers, services, clock);
  const softDeleteService = new SoftDeleteServiceUseCase(barbers, services);
  const restoreService = new RestoreServiceUseCase(barbers, services);
  const listMyAvailability = new ListMyAvailabilityUseCase(barbers);
  const createAvailabilitySlot = new CreateAvailabilitySlotUseCase(barbers);
  const getAvailabilitySlot = new GetAvailabilitySlotUseCase(barbers);
  const updateAvailabilitySlot = new UpdateAvailabilitySlotUseCase(barbers);
  const softDeleteAvailabilitySlot = new SoftDeleteAvailabilitySlotUseCase(barbers);
  const restoreAvailabilitySlot = new RestoreAvailabilitySlotUseCase(barbers);
  const createClientByAdmin = new CreateClientByAdminUseCase(users, hasher, clock);
  const listUsersAdmin = new ListUsersAdminUseCase(users);
  const getUserAdmin = new GetUserAdminUseCase(users);
  const updateUserAdmin = new UpdateUserAdminUseCase(users, clock);
  const softDeleteUserAdmin = new SoftDeleteUserAdminUseCase(users, barbers);
  const restoreUserAdmin = new RestoreUserAdminUseCase(users, barbers);
  const listBarbersAdmin = new ListBarbersAdminUseCase(barbers, users);
  const listServicesByBarberAdmin = new ListServicesByBarberAdminUseCase(barbers, services);
  const createServiceAdmin = new CreateServiceAdminUseCase(barbers, services, clock);
  const updateServiceAdmin = new UpdateServiceAdminUseCase(barbers, services, clock);
  const softDeleteServiceAdmin = new SoftDeleteServiceAdminUseCase(barbers, services);
  const restoreServiceAdmin = new RestoreServiceAdminUseCase(barbers, services);
  const getBarberAdmin = new GetBarberAdminUseCase(barbers, users);
  const updateBarberAdmin = new UpdateBarberAdminUseCase(barbers, users, clock);
  const softDeleteBarberAdmin = new SoftDeleteBarberAdminUseCase(barbers, users);
  const restoreBarberAdmin = new RestoreBarberAdminUseCase(barbers, users);
  const createProduct = new CreateProductUseCase(products, clock);
  const listProducts = new ListProductsUseCase(products);
  const getProduct = new GetProductUseCase(products);
  const updateProduct = new UpdateProductUseCase(products, clock);
  const softDeleteProduct = new SoftDeleteProductUseCase(products);
  const restoreProduct = new RestoreProductUseCase(products);
  const registerStockMovement = new RegisterStockMovementUseCase(uow, clock);
  const listStockMovements = new ListStockMovementsUseCase(stockMovements);

  const app = Fastify({ logger: true });

  await app.register(cors, { origin: true });
  await app.register(rateLimit, {
    max: 200,
    timeWindow: "1 minute",
  });
  await app.register(swagger, swaggerOptions);
  await app.register(swaggerUi, {
    routePrefix: "/docs",
    uiConfig: {
      docExpansion: "list",
      deepLinking: true,
      displayRequestDuration: true,
    },
    staticCSP: true,
    transformSpecification: (swaggerObject) => {
      const o = swaggerObject as { openapi?: string } & Record<string, unknown>;
      if (typeof o.openapi !== "string" || o.openapi.trim() === "") {
        o.openapi = "3.0.3";
      }
      return swaggerObject;
    },
  });

  await registerErrorHandler(app);
  await registerRequestLogging(app);

  const authenticate = createAuthenticate(tokens);
  const requireAdmin = createRequireRoles(Role.ADMIN);

  app.get(
    "/health",
    {
      schema: {
        tags: ["system"],
        summary: "Health check",
        description: "Indica se o processo HTTP está a responder.",
        response: {
          200: {
            description: "Serviço disponível",
            ...healthResponseSchema,
          },
        },
      },
    },
    async () => ({ ok: true }),
  );

  registerAuthRoutes(app, { registerClient, login });
  registerPublicRoutes(app, { listBookableBarbers, listServicesByBarber });
  registerAdminRoutes(
    app,
    {
      createBarberByAdmin,
      createClientByAdmin,
      listUsersAdmin,
      getUserAdmin,
      updateUserAdmin,
      softDeleteUserAdmin,
      restoreUserAdmin,
      listBarbersAdmin,
      listServicesByBarberAdmin,
      createServiceAdmin,
      updateServiceAdmin,
      softDeleteServiceAdmin,
      restoreServiceAdmin,
      getBarberAdmin,
      updateBarberAdmin,
      softDeleteBarberAdmin,
      restoreBarberAdmin,
    },
    authenticate,
    requireAdmin,
  );
  registerBarberRoutes(
    app,
    {
      createService,
      setAvailability,
      registerDeviceToken,
      listMyServices,
      getServiceByBarber,
      updateService,
      softDeleteService,
      restoreService,
      listMyAvailability,
      createAvailabilitySlot,
      getAvailabilitySlot,
      updateAvailabilitySlot,
      softDeleteAvailabilitySlot,
      restoreAvailabilitySlot,
    },
    authenticate,
  );
  registerAppointmentRoutes(
    app,
    {
      createAppointment,
      cancelAppointment,
      listAppointments,
      getAppointment,
      updateAppointment,
      softDeleteAppointmentAdmin,
      restoreAppointmentAdmin,
    },
    authenticate,
  );
  registerInventoryRoutes(
    app,
    {
      createProduct,
      listProducts,
      getProduct,
      updateProduct,
      softDeleteProduct,
      restoreProduct,
      registerStockMovement,
      listStockMovements,
    },
    authenticate,
  );

  app.get(
    "/openapi.json",
    {
      schema: {
        hide: true,
      },
    },
    async (_request, reply) => {
      return reply.send(app.swagger());
    },
  );

  return app;
}
