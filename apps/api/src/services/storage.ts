import { mkdirSync } from "node:fs";
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { env } from "../lib/env";

mkdirSync(env.uploadDir, { recursive: true });

export async function storeMedia(file: File) {
  const objectKey = `${Date.now()}-${file.name.replaceAll(/\s+/g, "-")}`;
  const destination = path.join(env.uploadDir, objectKey);
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(destination, buffer);

  return {
    bucket: env.rustfsBucketMedia,
    objectKey,
    publicUrl: `/api/media/file/${objectKey}`
  };
}
