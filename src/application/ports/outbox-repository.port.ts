export interface OutboxMessage {
  id: string;
  eventId: string;
  routingKey: string;
  payload: string;
  createdAt: Date;
  publishedAt: Date | null;
}

export interface OutboxRepositoryPort {
  enqueue(message: Omit<OutboxMessage, "publishedAt">): Promise<void>;
  fetchPending(limit: number): Promise<OutboxMessage[]>;
  markPublished(ids: string[]): Promise<void>;
}
