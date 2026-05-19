import admin from "firebase-admin";
import type { AppEnv } from "../../config/env.js";

let initialized = false;

function ensureInit(json: string): void {
  if (initialized || !json) {
    return;
  }
  const cred = JSON.parse(json) as admin.ServiceAccount;
  admin.initializeApp({
    credential: admin.credential.cert(cred),
  });
  initialized = true;
}

export class FirebasePushService {
  constructor(private readonly env: AppEnv) {}

  async sendMulticast(params: {
    tokens: string[];
    title: string;
    body: string;
    data?: Record<string, string>;
  }): Promise<{ success: number; failure: number }> {
    if (!this.env.FCM_SERVICE_ACCOUNT_JSON || params.tokens.length === 0) {
      return { success: 0, failure: 0 };
    }
    ensureInit(this.env.FCM_SERVICE_ACCOUNT_JSON);
    const res = await admin.messaging().sendEachForMulticast({
      tokens: params.tokens,
      notification: { title: params.title, body: params.body },
      data: params.data,
      android: { priority: "high" },
      apns: { headers: { "apns-priority": "10" } },
    });
    return { success: res.successCount, failure: res.failureCount };
  }
}
