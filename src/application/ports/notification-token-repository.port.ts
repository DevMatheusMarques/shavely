export interface NotificationTokenRecord {
  id: string;
  userId: string;
  token: string;
  platform: string;
  createdAt: Date;
}

export interface NotificationTokenRepositoryPort {
  upsert(userId: string, token: string, platform: string): Promise<void>;
  listByUserIds(userIds: string[]): Promise<NotificationTokenRecord[]>;
}
