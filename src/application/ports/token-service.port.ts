export interface AuthTokenPayload {
  sub: string;
  role: string;
  email: string;
}

export interface TokenServicePort {
  sign(payload: AuthTokenPayload): Promise<string>;
  verify(token: string): Promise<AuthTokenPayload>;
}
