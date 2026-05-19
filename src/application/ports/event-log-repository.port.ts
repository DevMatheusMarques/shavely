export interface EventLogRepositoryPort {
  tryInsert(eventId: string, routingKey: string, consumer: string): Promise<boolean>;
}
