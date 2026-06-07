# Blueprint Arsitektur Aplikasi Bank Soal & Generator Asesmen AI

## 1. Ringkasan Aplikasi

Aplikasi ini adalah platform full-stack untuk membantu guru atau sekolah membuat, mengelola, menyimpan, dan menghasilkan soal asesmen berbasis AI.

Pengguna dapat membuat proyek asesmen, menyusun kisi-kisi, menginput materi atau indikator, lalu sistem menghasilkan soal secara otomatis. Soal yang dihasilkan dapat direview, diedit, disimpan ke bank soal, dirakit menjadi paket asesmen, lalu diekspor menjadi dokumen siap cetak.

---

## 2. Tujuan Aplikasi

Aplikasi ini bertujuan untuk:

1. Mempercepat proses pembuatan soal asesmen.
2. Membantu guru membuat soal berdasarkan kisi-kisi.
3. Menyediakan bank soal yang rapi dan mudah dicari.
4. Menghasilkan soal dengan bantuan AI.
5. Menyimpan media soal seperti gambar, audio, video, dan PDF.
6. Mendukung pembuatan paket soal siap cetak.
7. Menjadi pondasi aplikasi SaaS untuk sekolah.

---

## 3. Teknologi Utama

| Bagian | Teknologi |
|---|---|
| Runtime | Bun |
| Backend | Hono |
| Frontend | React + Vite |
| UI | TailwindCSS + Shadcn/UI |
| ORM | Drizzle ORM |
| Database | SQLite |
| Object Storage | RustFS |
| Container | Docker + Docker Compose |
| Auth | Session/JWT |
| AI Provider | OpenAI-compatible API |
| Export | PDF / DOCX |

---

## 4. Gambaran Arsitektur Sistem

```txt
User Browser
    |
    v
Frontend React + Vite + Tailwind + Shadcn/UI
    |
    v
Backend API Bun + Hono
    |
    |---- Auth Service
    |---- Assessment Service
    |---- Question Bank Service
    |---- AI Generator Service
    |---- Export Service
    |---- Media Upload Service
    |
    |---- SQLite Database via Drizzle ORM
    |
    |---- RustFS Object Storage
    |
    v
AI Provider API
```

---

## 5. Komponen Utama

## 5.1 Frontend

Frontend digunakan oleh pengguna untuk mengelola aplikasi melalui browser.

Fitur frontend:

- Login dan register
- Dashboard
- Manajemen asesmen
- Manajemen kisi-kisi
- Generator soal AI
- Editor soal
- Bank soal
- Paket soal
- Upload media
- Export dokumen
- Pengaturan akun

Teknologi:

- React
- Vite
- TailwindCSS
- Shadcn/UI
- TanStack Query
- React Hook Form
- Zod Validation

---

## 5.2 Backend

Backend menangani seluruh logika bisnis aplikasi.

Tugas backend:

- Autentikasi pengguna
- Validasi request
- CRUD data
- Koneksi database
- Generate soal AI
- Upload file ke RustFS
- Export PDF/DOCX
- Audit log
- Manajemen role

Teknologi:

- Bun
- Hono
- Drizzle ORM
- Zod
- SQLite
- RustFS SDK/S3-compatible client

---

## 5.3 Database

Database menggunakan SQLite agar ringan, mudah dipasang, dan cocok untuk tahap awal pengembangan.

ORM yang digunakan adalah Drizzle ORM.

Kelebihan:

- Setup sederhana
- Cocok untuk aplikasi sekolah/lokal
- Mudah di-backup
- Bisa dikembangkan ke PostgreSQL saat aplikasi menjadi SaaS besar

---

## 5.4 Object Storage RustFS

RustFS digunakan untuk menyimpan file media.

Contoh file:

- Gambar soal
- Diagram
- Audio listening
- Video stimulus
- PDF referensi
- File export

Struktur bucket:

```txt
rustfs
 ├── media-soal
 ├── export-pdf
 ├── export-docx
 └── user-avatar
```

---

## 5.5 AI Generator Service

AI Generator Service bertugas membuat soal berdasarkan input pengguna.

Input:

- Mata pelajaran
- Kelas
- Kurikulum
- Materi
- CP/KD
- Indikator
- Level kognitif
- Bentuk soal
- Jumlah soal
- Tingkat kesulitan

Output:

- Soal
- Pilihan jawaban
- Kunci jawaban
- Pembahasan
- Tag materi
- Level kognitif
- Metadata soal

---

# 6. Alur Kerja Aplikasi

## 6.1 Login

Pengguna masuk ke aplikasi menggunakan email dan password.

Role pengguna:

- Admin
- Operator Sekolah
- Guru

---

## 6.2 Membuat Proyek Asesmen

Pengguna membuat proyek asesmen.

Contoh:

```txt
Nama Asesmen : SAS Matematika Kelas VIII Semester Ganjil
Mapel        : Matematika
Kelas        : VIII
Semester     : Ganjil
Tahun Ajaran : 2026/2027
Kurikulum    : Kurikulum Merdeka
```

---

## 6.3 Membuat Kisi-Kisi

Pengguna membuat kisi-kisi soal.

Data kisi-kisi:

- CP/KD
- Tujuan pembelajaran
- Materi
- Indikator soal
- Level kognitif
- Bentuk soal
- Nomor soal
- Bobot soal

---

## 6.4 Generate Soal AI

Pengguna memilih kisi-kisi atau mengisi form generator.

Contoh input:

```txt
Mata Pelajaran : Matematika
Kelas          : VIII
Materi         : SPLDV
Indikator      : Menentukan penyelesaian SPLDV
Bentuk Soal    : Pilihan Ganda
Jumlah Soal    : 10
Kesulitan      : Sedang
```

AI menghasilkan soal lengkap dengan opsi jawaban, kunci, dan pembahasan.

---

## 6.5 Review dan Edit Soal

Guru meninjau soal yang dihasilkan.

Aksi yang tersedia:

- Edit soal
- Edit pilihan jawaban
- Edit kunci jawaban
- Edit pembahasan
- Regenerate soal
- Tambahkan gambar
- Tandai sebagai valid
- Simpan ke bank soal

---

## 6.6 Bank Soal

Soal yang sudah disetujui masuk ke bank soal.

Fitur bank soal:

- Pencarian
- Filter
- Kategori
- Tagging
- Folder
- Duplikasi soal
- Import soal
- Export soal

---

## 6.7 Merakit Paket Soal

Pengguna memilih soal dari bank soal untuk membuat paket asesmen.

Contoh paket:

```txt
Paket: SAS Matematika VIII
Isi:
- 30 pilihan ganda
- 5 isian singkat
- 5 uraian
```

---

## 6.8 Export Dokumen

Aplikasi dapat menghasilkan:

1. Naskah soal
2. Kunci jawaban
3. Pembahasan
4. Kartu soal
5. Kisi-kisi

Format export:

- PDF
- DOCX

---

# 7. Fitur Utama

## 7.1 Dashboard

Menampilkan:

- Total soal
- Total asesmen
- Total paket soal
- Total pengguna
- Aktivitas terbaru
- Statistik soal per mapel

---

## 7.2 Manajemen Pengguna

Fitur:

- Register
- Login
- Logout
- Reset password
- Role user
- Profil pengguna

Role:

```txt
Admin  : mengelola semua data
Guru   : membuat soal dan asesmen
Operator : membantu input dan export
```

---

## 7.3 Manajemen Asesmen

Fitur:

- Buat asesmen
- Edit asesmen
- Hapus asesmen
- Atur kelas
- Atur mapel
- Atur semester
- Atur tahun ajaran

---

## 7.4 Kisi-Kisi Soal

Fitur:

- CRUD kisi-kisi
- Input CP/KD
- Input indikator
- Level kognitif
- Bentuk soal
- Jumlah soal
- Bobot soal

---

## 7.5 Generator Soal AI

Jenis soal:

- Pilihan ganda
- Pilihan ganda kompleks
- Benar salah
- Menjodohkan
- Isian singkat
- Uraian

Fitur tambahan:

- Generate dari indikator
- Generate dari materi
- Generate dari teks bacaan
- Generate dari file PDF
- Generate variasi soal
- Generate pembahasan
- Generate soal HOTS
- Generate soal AKM

---

## 7.6 Editor Soal

Fitur:

- Edit teks soal
- Edit opsi jawaban
- Edit kunci jawaban
- Edit pembahasan
- Tambahkan gambar
- Preview soal
- Tandai valid/tidak valid

---

## 7.7 Bank Soal

Fitur:

- Simpan soal
- Cari soal
- Filter berdasarkan mapel
- Filter berdasarkan kelas
- Filter berdasarkan materi
- Filter berdasarkan level kognitif
- Filter berdasarkan tipe soal
- Filter berdasarkan tingkat kesulitan

---

## 7.8 Paket Soal

Fitur:

- Buat paket soal
- Pilih soal manual
- Pilih soal otomatis
- Acak nomor soal
- Acak opsi jawaban
- Tentukan bobot
- Export paket

---

## 7.9 Media Soal

Fitur:

- Upload gambar
- Upload audio
- Upload video
- Upload PDF
- Simpan ke RustFS
- Hubungkan media ke soal

---

## 7.10 Export Dokumen

Output:

- Naskah soal PDF
- Naskah soal DOCX
- Kunci jawaban PDF
- Pembahasan PDF
- Kisi-kisi PDF
- Kartu soal PDF

---

# 8. Struktur Database Awal

## 8.1 users

Menyimpan data pengguna.

Kolom:

- id
- name
- email
- password_hash
- role
- avatar_url
- created_at
- updated_at

---

## 8.2 assessments

Menyimpan proyek asesmen.

Kolom:

- id
- title
- subject
- grade
- semester
- academic_year
- curriculum
- created_by
- created_at
- updated_at

---

## 8.3 blueprints

Menyimpan kisi-kisi soal.

Kolom:

- id
- assessment_id
- competency
- learning_objective
- material
- indicator
- cognitive_level
- question_type
- difficulty
- question_count
- weight
- created_at
- updated_at

---

## 8.4 questions

Menyimpan soal.

Kolom:

- id
- assessment_id
- blueprint_id
- question_text
- question_type
- difficulty
- cognitive_level
- subject
- grade
- material
- answer_key
- explanation
- status
- created_by
- created_at
- updated_at

---

## 8.5 question_options

Menyimpan opsi jawaban.

Kolom:

- id
- question_id
- option_label
- option_text
- is_correct

---

## 8.6 media_files

Menyimpan metadata file media.

Kolom:

- id
- owner_id
- file_name
- file_type
- mime_type
- file_size
- bucket
- object_key
- public_url
- created_at

---

## 8.7 question_media

Relasi soal dan media.

Kolom:

- id
- question_id
- media_id

---

## 8.8 question_packages

Menyimpan paket soal.

Kolom:

- id
- title
- assessment_id
- description
- created_by
- created_at
- updated_at

---

## 8.9 package_questions

Relasi paket dan soal.

Kolom:

- id
- package_id
- question_id
- order_number
- score_weight

---

## 8.10 ai_generations

Menyimpan riwayat generate AI.

Kolom:

- id
- user_id
- assessment_id
- blueprint_id
- prompt
- response
- provider
- model
- token_usage
- created_at

---

## 8.11 audit_logs

Menyimpan log aktivitas.

Kolom:

- id
- user_id
- action
- entity_type
- entity_id
- metadata
- created_at

---

# 9. API Endpoint Awal

## 9.1 Auth

```txt
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me
POST   /api/auth/reset-password
```

---

## 9.2 Users

```txt
GET    /api/users
GET    /api/users/:id
PATCH  /api/users/:id
DELETE /api/users/:id
```

---

## 9.3 Assessments

```txt
GET    /api/assessments
POST   /api/assessments
GET    /api/assessments/:id
PATCH  /api/assessments/:id
DELETE /api/assessments/:id
```

---

## 9.4 Blueprints / Kisi-Kisi

```txt
GET    /api/assessments/:id/blueprints
POST   /api/assessments/:id/blueprints
PATCH  /api/blueprints/:id
DELETE /api/blueprints/:id
```

---

## 9.5 Questions

```txt
GET    /api/questions
POST   /api/questions
GET    /api/questions/:id
PATCH  /api/questions/:id
DELETE /api/questions/:id
```

---

## 9.6 AI Generator

```txt
POST   /api/ai/generate-questions
POST   /api/ai/regenerate-question
POST   /api/ai/improve-question
POST   /api/ai/generate-explanation
POST   /api/ai/generate-variants
```

---

## 9.7 Media

```txt
POST   /api/media/upload
GET    /api/media
GET    /api/media/:id
DELETE /api/media/:id
```

---

## 9.8 Packages

```txt
GET    /api/packages
POST   /api/packages
GET    /api/packages/:id
PATCH  /api/packages/:id
DELETE /api/packages/:id
POST   /api/packages/:id/questions
DELETE /api/packages/:id/questions/:questionId
```

---

## 9.9 Export

```txt
GET    /api/export/package/:id/pdf
GET    /api/export/package/:id/docx
GET    /api/export/package/:id/answer-key/pdf
GET    /api/export/package/:id/explanation/pdf
GET    /api/export/assessment/:id/blueprint/pdf
```

---

# 10. Struktur Folder Proyek

```txt
assessment-ai-app/
├── apps/
│   ├── web/
│   │   ├── src/
│   │   │   ├── components/
│   │   │   ├── pages/
│   │   │   ├── routes/
│   │   │   ├── hooks/
│   │   │   ├── lib/
│   │   │   └── main.tsx
│   │   ├── index.html
│   │   └── package.json
│   │
│   └── api/
│       ├── src/
│       │   ├── index.ts
│       │   ├── routes/
│       │   ├── services/
│       │   ├── middlewares/
│       │   ├── validators/
│       │   ├── db/
│       │   ├── storage/
│       │   └── utils/
│       └── package.json
│
├── packages/
│   ├── db/
│   ├── shared/
│   └── ui/
│
├── docker/
├── docker-compose.yml
├── Dockerfile
├── .env.example
└── README.md
```

---

# 11. Docker Compose Awal

```yaml
services:
  app:
    build: .
    container_name: assessment-ai-app
    ports:
      - "3000:3000"
    env_file:
      - .env
    volumes:
      - ./data:/app/data
    depends_on:
      - rustfs

  rustfs:
    image: rustfs/rustfs:latest
    container_name: assessment-rustfs
    ports:
      - "9000:9000"
      - "9001:9001"
    environment:
      RUSTFS_ACCESS_KEY: admin
      RUSTFS_SECRET_KEY: admin123456
    volumes:
      - ./rustfs-data:/data
```

---

# 12. Environment Variable

```env
APP_NAME=Assessment AI App
APP_URL=http://localhost:3000

DATABASE_URL=file:./data/app.db

JWT_SECRET=change-this-secret
SESSION_SECRET=change-this-session-secret

RUSTFS_ENDPOINT=http://rustfs:9000
RUSTFS_ACCESS_KEY=admin
RUSTFS_SECRET_KEY=admin123456
RUSTFS_BUCKET_MEDIA=media-soal

AI_BASE_URL=https://api.openai.com/v1
AI_API_KEY=your-api-key
AI_MODEL=gpt-4.1-mini
```

---

# 13. Halaman UI

## 13.1 Public Pages

- Login
- Register
- Forgot Password

## 13.2 Dashboard

- Statistik soal
- Statistik asesmen
- Grafik aktivitas
- Shortcut generate soal

## 13.3 Asesmen

- Daftar asesmen
- Detail asesmen
- Form asesmen
- Kisi-kisi asesmen

## 13.4 Generator AI

- Form generate soal
- Preview hasil AI
- Simpan ke bank soal
- Regenerate

## 13.5 Bank Soal

- Tabel soal
- Filter soal
- Detail soal
- Editor soal

## 13.6 Paket Soal

- Daftar paket
- Builder paket soal
- Preview paket
- Export paket

## 13.7 Media Library

- Upload media
- Daftar file
- Preview file
- Hapus file

## 13.8 Pengaturan

- Profil
- Pengguna
- Role
- API key AI
- Storage RustFS

---

# 14. Keamanan

Fitur keamanan:

- Password hashing
- Session/JWT authentication
- Role-based access control
- Validasi input dengan Zod
- Rate limit endpoint AI
- Audit log aktivitas
- Proteksi upload file
- Validasi MIME type
- Batas ukuran file
- Sanitasi HTML/editor content

---

# 15. Strategi Pengembangan MVP

## Tahap 1: Fondasi

- Setup Bun + Hono
- Setup React + Vite
- Setup Tailwind + Shadcn/UI
- Setup Drizzle + SQLite
- Setup Docker
- Setup RustFS

## Tahap 2: Auth dan Dashboard

- Login
- Register
- Logout
- Role pengguna
- Dashboard dasar

## Tahap 3: Asesmen dan Kisi-Kisi

- CRUD asesmen
- CRUD kisi-kisi
- Relasi asesmen dan kisi-kisi

## Tahap 4: Generator AI

- Form generate soal
- Integrasi AI provider
- Simpan hasil generate
- Riwayat generate

## Tahap 5: Bank Soal

- CRUD soal
- Filter soal
- Editor soal
- Validasi soal

## Tahap 6: Paket Soal

- Buat paket
- Pilih soal
- Atur urutan soal
- Acak soal

## Tahap 7: Export

- Export PDF
- Export DOCX
- Export kunci jawaban
- Export pembahasan

## Tahap 8: Media Storage

- Upload gambar
- Upload PDF
- Simpan ke RustFS
- Hubungkan media ke soal

---

# 16. Roadmap Lanjutan

## Versi 1.0

- Multi-user
- Bank soal
- Generate soal AI
- Export PDF/DOCX
- Upload media

## Versi 1.5

- Import soal dari Word/PDF
- Generate soal dari dokumen
- Template kartu soal
- Template kisi-kisi

## Versi 2.0

- Multi-sekolah SaaS
- Subscription plan
- Billing
- Kolaborasi guru
- Approval workflow

## Versi 3.0

- Ujian online
- Analisis hasil siswa
- CBT sederhana
- Integrasi LMS
- Rekomendasi remedial berbasis AI

---

# 17. Kesimpulan

Aplikasi ini dirancang sebagai platform bank soal dan generator asesmen berbasis AI yang ringan, modern, dan mudah dikembangkan.

Dengan kombinasi Bun, Hono, React, Tailwind, Shadcn/UI, Drizzle, SQLite, RustFS, dan Docker, aplikasi ini dapat dimulai sebagai aplikasi lokal/sekolah, lalu dikembangkan menjadi SaaS multi-user untuk banyak sekolah.

Fokus MVP sebaiknya dimulai dari:

1. Login pengguna
2. Manajemen asesmen
3. Kisi-kisi soal
4. Generator soal AI
5. Bank soal
6. Export PDF/DOCX
7. Upload media ke RustFS
