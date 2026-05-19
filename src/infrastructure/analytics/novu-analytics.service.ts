import type { AppEnv } from "../../config/env.js";

export class NovuAnalyticsService {
  constructor(private readonly env: AppEnv) {}

  async trackAppointmentEvent(params: {
    name: string;
    payload: Record<string, unknown>;
    actorSubscriberId: string;
    transactionId: string;
  }): Promise<void> {
    if (!this.env.NOVU_API_KEY) {
      return;
    }
    const url = `${this.env.NOVU_BACKEND_URL.replace(/\/$/, "")}/v1/events/trigger`;
    const body = {
      name: this.env.NOVU_ANALYTICS_WORKFLOW,
      to: [{ subscriberId: params.actorSubscriberId }],
      payload: { eventName: params.name, ...params.payload },
      transactionId: params.transactionId,
    };
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `ApiKey ${this.env.NOVU_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Novu trigger failed: ${res.status} ${text}`);
    }
  }
}
