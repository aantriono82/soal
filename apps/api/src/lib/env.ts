export const env = {
  appName: process.env.APP_NAME ?? "Assessment AI App",
  appUrl: process.env.APP_URL ?? "http://localhost:3000",
  apiPort: Number(process.env.API_PORT ?? 3001),
  jwtSecret: process.env.JWT_SECRET ?? "change-this-secret",
  aiBaseUrl: process.env.AI_BASE_URL ?? "https://api.openai.com/v1",
  aiApiKey: process.env.AI_API_KEY ?? "",
  aiModel: process.env.AI_MODEL ?? "gpt-4.1-mini",
  rustfsEndpoint: process.env.RUSTFS_ENDPOINT ?? "http://localhost:9000",
  rustfsAccessKey: process.env.RUSTFS_ACCESS_KEY ?? "admin",
  rustfsSecretKey: process.env.RUSTFS_SECRET_KEY ?? "admin123456",
  rustfsBucketMedia: process.env.RUSTFS_BUCKET_MEDIA ?? "media-soal",
  uploadDir: process.env.UPLOAD_DIR ?? "./uploads"
};
