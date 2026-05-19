export interface BarberAvailabilityProps {
  id: string;
  barberId: string;
  weekday: number;
  startMinutes: number;
  endMinutes: number;
}

export class BarberAvailability {
  constructor(private readonly props: BarberAvailabilityProps) {}

  get id(): string {
    return this.props.id;
  }
  get barberId(): string {
    return this.props.barberId;
  }
  get weekday(): number {
    return this.props.weekday;
  }
  get startMinutes(): number {
    return this.props.startMinutes;
  }
  get endMinutes(): number {
    return this.props.endMinutes;
  }

  coversInterval(start: Date, end: Date): boolean {
    if (start >= end) {
      return false;
    }
    if (start.getUTCDay() !== end.getUTCDay()) {
      return false;
    }
    if (start.getUTCDay() !== this.props.weekday) {
      return false;
    }
    const startMin = start.getUTCHours() * 60 + start.getUTCMinutes();
    const endMin = end.getUTCHours() * 60 + end.getUTCMinutes();
    return startMin >= this.props.startMinutes && endMin <= this.props.endMinutes;
  }
}
