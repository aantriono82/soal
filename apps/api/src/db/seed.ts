import { count, eq } from "drizzle-orm";
import { db, runMigrations } from "./client";
import { users } from "./schema";

runMigrations();

const existing = await db.select({ total: count() }).from(users);
if ((existing[0]?.total ?? 0) === 0) {
  const passwordHash = await Bun.password.hash("admin123");
  await db.insert(users).values({
    name: "Administrator Demo",
    email: "admin@demo.local",
    passwordHash,
    role: "admin"
  });
}

const admin = await db.select().from(users).where(eq(users.email, "admin@demo.local")).get();

console.log(`Seed selesai. Akun demo: ${admin?.email} / admin123`);
