export interface ServiceProps {
  id: string;
  barberId: string;
  name: string;
  durationMinutes: number;
  priceCents: number;
  createdAt: Date;
  updatedAt: Date;
}

export class Service {
  constructor(private readonly props: ServiceProps) {}

  get id(): string {
    return this.props.id;
  }
  get barberId(): string {
    return this.props.barberId;
  }
  get name(): string {
    return this.props.name;
  }
  get durationMinutes(): number {
    return this.props.durationMinutes;
  }
  get priceCents(): number {
    return this.props.priceCents;
  }

  toProps(): ServiceProps {
    return { ...this.props };
  }
}
