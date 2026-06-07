import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { db } from "../db/client";
import { mediaFiles } from "../db/schema";
import { requireAuth, type AuthContext } from "../middlewares/auth";
import { storeMedia } from "../services/storage";

export const mediaRoutes = new Hono<AuthContext>();
mediaRoutes.use("*", requireAuth);

mediaRoutes.post("/upload", async (c) => {
  const auth = c.get("auth")!;
  const form = await c.req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return c.json({ message: "File wajib diisi" }, 400);
  }

  const stored = await storeMedia(file);
  const row = await db
    .insert(mediaFiles)
    .values({
      ownerId: auth.userId,
      fileName: file.name,
      fileType: file.type.split("/")[0] || "file",
      mimeType: file.type || "application/octet-stream",
      fileSize: file.size,
      bucket: stored.bucket,
      objectKey: stored.objectKey,
      publicUrl: stored.publicUrl
    })
    .returning()
    .get();

  return c.json(row, 201);
});

mediaRoutes.get("/", async (c) => {
  const rows = await db.select().from(mediaFiles);
  return c.json(rows);
});

mediaRoutes.get("/:id", async (c) => {
  const item = await db.select().from(mediaFiles).where(eq(mediaFiles.id, Number(c.req.param("id")))).get();
  if (!item) {
    return c.json({ message: "Media tidak ditemukan" }, 404);
  }
  return c.json(item);
});

mediaRoutes.delete("/:id", async (c) => {
  await db.delete(mediaFiles).where(eq(mediaFiles.id, Number(c.req.param("id"))));
  return c.json({ success: true });
});
