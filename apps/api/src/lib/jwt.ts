import { sign, verify } from "hono/jwt";
import { env } from "./env";

export interface AuthPayload {
  userId: number;
  role: string;
  exp?: number;
  [key: string]: string | number | undefined;
}

export function signToken(payload: AuthPayload) {
  return sign(payload, env.jwtSecret);
}

export function verifyToken(token: string) {
  return verify(token, env.jwtSecret, "HS256") as Promise<AuthPayload>;
}
