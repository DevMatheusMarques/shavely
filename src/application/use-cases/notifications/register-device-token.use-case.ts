import type { RegisterDeviceTokenInput } from "../../dto/appointment.dto.js";
import type { NotificationTokenRepositoryPort } from "../../ports/notification-token-repository.port.js";
import type { Requester } from "../../types/requester.js";

export class RegisterDeviceTokenUseCase {
  constructor(private readonly tokens: NotificationTokenRepositoryPort) {}

  async execute(requester: Requester, input: RegisterDeviceTokenInput): Promise<void> {
    await this.tokens.upsert(requester.userId, input.token, input.platform);
  }
}
