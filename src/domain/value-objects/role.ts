export enum Role {
  ADMIN = "ADMIN",
  BARBER = "BARBER",
  CLIENT = "CLIENT",
}

export function parseRole(value: string): Role {
  if (!Object.values(Role).includes(value as Role)) {
    throw new Error(`Invalid role: ${value}`);
  }
  return value as Role;
}
