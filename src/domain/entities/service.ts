export interface ServiceProps {
  id: string;
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
  get name(): string {
    return this.props.name;
  }
  get durationMinutes(): number {
    return this.props.durationMinutes;
  }
  get priceCents(): number {
    return this.props.priceCents;
  }
  get createdAt(): Date {
    return this.props.createdAt;
  }
  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  toProps(): ServiceProps {
    return { ...this.props };
  }
}
