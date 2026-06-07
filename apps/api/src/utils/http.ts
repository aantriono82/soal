import type { ZodSchema } from "zod";
import type { Context } from "hono";

export async function parseBody<T>(c: Context, schema: ZodSchema<T>) {
  const body = await c.req.json();
  return schema.parse(body);
}

export function jsonError(message: string, status = 400) {
  return Response.json({ message }, { status });
}
