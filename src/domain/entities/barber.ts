export interface BarberProps {
  id: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export class Barber {
  constructor(private readonly props: BarberProps) {}

  get id(): string {
    return this.props.id;
  }
  get userId(): string {
    return this.props.userId;
  }

  toProps(): BarberProps {
    return { ...this.props };
  }
}
