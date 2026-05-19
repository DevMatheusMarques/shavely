import type { Role } from "../value-objects/role.js";

export interface UserProps {
  id: string;
  email: string;
  passwordHash: string;
  role: Role;
  name: string;
  phoneE164: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export class User {
  constructor(private readonly props: UserProps) {}

  get id(): string {
    return this.props.id;
  }
  get email(): string {
    return this.props.email;
  }
  get passwordHash(): string {
    return this.props.passwordHash;
  }
  get role(): Role {
    return this.props.role;
  }
  get name(): string {
    return this.props.name;
  }
  get phoneE164(): string | null {
    return this.props.phoneE164;
  }
  get createdAt(): Date {
    return this.props.createdAt;
  }
  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  toProps(): UserProps {
    return { ...this.props };
  }
}
