# Assessment AI App

Aplikasi full-stack bank soal dan generator asesmen berbasis AI untuk guru, operator, dan admin sekolah.

Implementasi ini mengikuti blueprint pada `summary.md` dengan stack:

- Runtime: Bun
- Backend: Hono
- ORM: Drizzle ORM
- Database: SQLite
- Frontend: React + Vite
- UI: TailwindCSS dengan komponen gaya Shadcn
- Export: PDF dan DOCX
- API frontend: `/api` melalui proxy Vite

## Fitur yang Tersedia

### Autentikasi

- Login
- Register
- Logout
- Reset password
- Session berbasis cookie JWT

### Dashboard

- Total soal
- Total asesmen
- Total paket
- Total pengguna
- Aktivitas terbaru
- Statistik soal per mapel

### Asesmen dan Kisi-Kisi

- Buat asesmen
- Lihat daftar asesmen
- Tambah kisi-kisi per asesmen
- Lihat kisi-kisi berdasarkan asesmen

### Generator Soal AI

- Generate soal dari mapel, kelas, materi, indikator, tipe, dan kesulitan
- Fallback generator lokal bila `AI_API_KEY` belum diisi
- Simpan hasil generate ke bank soal

### Bank Soal

- Lihat daftar soal
- Validasi soal
- Hapus soal

### Paket Soal

- Buat paket dari soal yang dipilih
- Export PDF
- Export DOCX

### Media

- Upload file media
- Lihat daftar media
- Buka file hasil upload

### Pengaturan

- Ganti password
- Lihat daftar pengguna untuk role `admin`

## Struktur Proyek

```txt
.
├── apps
│   ├── api
│   │   └── src
│   └── web
│       └── src
├── packages
│   └── shared
├── summary.md
└── README.md
```

## Menjalankan Aplikasi

### 1. Install dependency

```bash
bun install
```

### 2. Siapkan environment

```bash
cp .env.example .env
```

Nilai default penting:

```env
APP_URL=http://localhost:3000
API_PORT=3001
DATABASE_URL=./data/app.sqlite
```

### 3. Seed akun demo

```bash
bun run db:seed
```

Akun demo default:

- Email: `admin@demo.local`
- Password: `admin123`

### 4. Jalankan aplikasi

```bash
bun run dev
```

Port yang dipakai:

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:3001`

Frontend mengakses backend melalui path `/api`, jadi penggunaan aplikasi tetap dari port `3000`.

## Script Penting

```bash
bun run dev
bun run build
bun run build:web
bun run build:api
bun run db:seed
```

## Endpoint API Utama

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `POST /api/auth/reset-password`

### Dashboard

- `GET /api/dashboard/stats`

### Asesmen

- `GET /api/assessments`
- `POST /api/assessments`
- `GET /api/assessments/:id`
- `PATCH /api/assessments/:id`
- `DELETE /api/assessments/:id`

### Kisi-Kisi

- `GET /api/assessments/:id/blueprints`
- `POST /api/assessments/:id/blueprints`
- `PATCH /api/blueprints/:id`
- `DELETE /api/blueprints/:id`

### Soal

- `GET /api/questions`
- `POST /api/questions`
- `GET /api/questions/:id`
- `PATCH /api/questions/:id`
- `DELETE /api/questions/:id`

### AI

- `POST /api/ai/generate-questions`
- `POST /api/ai/regenerate-question`
- `POST /api/ai/improve-question`
- `POST /api/ai/generate-explanation`
- `POST /api/ai/generate-variants`
- `POST /api/ai/save-generated`

### Media

- `POST /api/media/upload`
- `GET /api/media`
- `GET /api/media/:id`
- `DELETE /api/media/:id`

### Paket

- `GET /api/packages`
- `POST /api/packages`
- `GET /api/packages/:id`
- `PATCH /api/packages/:id`
- `DELETE /api/packages/:id`
- `POST /api/packages/:id/questions`
- `DELETE /api/packages/:id/questions/:questionId`

### Export

- `GET /api/export/package/:id/pdf`
- `GET /api/export/package/:id/docx`
- `GET /api/export/package/:id/answer-key/pdf`
- `GET /api/export/package/:id/explanation/pdf`
- `GET /api/export/assessment/:id/blueprint/pdf`

## Catatan Implementasi

### Database

- Database SQLite dibuat otomatis di `./data/app.sqlite`
- Tabel dibuat otomatis saat API dijalankan
- Schema Drizzle ada di [apps/api/src/db/schema.ts](/home/aantriono/Dev/soal/apps/api/src/db/schema.ts)

### AI Provider

- Bila `AI_API_KEY` diisi, aplikasi mencoba memanggil endpoint OpenAI-compatible
- Bila tidak diisi atau request gagal, aplikasi memakai generator fallback lokal agar alur kerja tetap jalan

### Storage Media

- Implementasi saat ini menyimpan file ke folder lokal `./uploads`
- Struktur env untuk RustFS tetap disiapkan agar integrasi S3-compatible bisa dilanjutkan tanpa mengubah surface API

### Export

- Export PDF menggunakan `pdf-lib`
- Export DOCX menggunakan `docx`

## Verifikasi yang Sudah Dilakukan

- `bun install`
- `bun run db:seed`
- `bun run build:api`
- `bun run build:web`
- `bunx tsc --noEmit`

## Catatan MVP

Versi ini sudah runnable dan mengikuti alur utama blueprint:

1. Login
2. Buat asesmen
3. Buat kisi-kisi
4. Generate soal AI
5. Simpan ke bank soal
6. Buat paket soal
7. Export dokumen
8. Upload media

Yang belum diperdalam:

- Integrasi RustFS langsung
- Approval workflow
- Import Word/PDF
- Audit log UI
- Editor rich text lanjutan
- Rate limiting AI
- RBAC yang lebih rinci per aksi
