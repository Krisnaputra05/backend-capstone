# 📚 API Contract: Capstone Project Backend

Dokumentasi lengkap untuk endpoint yang tersedia di backend Capstone Project Management.

---

## � Server Base URL (Domains)

| Environment | Base URL | Keterangan |
| :--- | :--- | :--- |
| **Development** | `http://localhost:3000` | Server lokal saat development. |
| **Production** | `https://backendsw.vercel.app` | URL server saat deploy. |

---

## 📚 Reference: Valid Domains (Learning Paths)
Berikut adalah daftar **Learning Path (Domain)** yang valid.
**PENTING**: Learning Path pengguna hanya bisa diset **SEKALI** (jika masih kosong). Setelah diisi, tidak bisa diubah lagi.

1.  **Machine Learning (ML)**
2.  **Front-End Web & Back-End with AI (FEBE)**
3.  **React & Back-End with AI (REBE)**

---

## �🌟 Overview Fitur
Project ini memiliki **7 Modul Utama** yang terbagi untuk role **Admin** dan **Student**:

1.  **Authentication (Auth)**: Registrasi dan Login pengguna (dengan JWT).
2.  **User Profile & Dashboard**: Profil pengguna, timeline proyek, dan daftar dokumen referensi.
3.  **Group Management (Admin)**: Pembuatan, update status, dan monitoring grup/tim.
4.  **Team Registration (Student)**: Pembentukan tim oleh mahasiswa dengan validasi aturan Use Case.
5.  **Deliverables**: Pengumpulan tugas (Project Plan, Final Report, Video) dan pemantauan oleh Admin.
6.  **Capstone Worksheet (Check-in)**: Laporan aktivitas individu mingguan.
7.  **360-Degree Feedback**: Penilaian antar anggota tim (Peer Review).

---

## 🔑 Role Access Matrix

| Fitur / Modul | Endpoint (Method) | Admin | Student | Deskripsi |
| :--- | :--- | :---: | :---: | :--- |
| **Auth** | POST /register, POST /login | ✅ | ✅ | Semua user bisa register/login. |
| **User Profile** | GET /profile, /timeline, /docs, /users/use-cases | ✅ | ✅ | Akses data dasar pengguna. |
| **Manage Groups** | POST/PUT /groups, PUT /project/status | ✅ | ❌ | Admin mengatur grup & status proyek. |
| **Rules Configuration** | POST /rules | ✅ | ❌ | Admin mengatur aturan komposisi tim. |
| **Team Registration** | POST /register, GET /my-team | ❌ | ✅ | Mahasiswa mendaftarkan tim mereka. |
| **Deliverables** | POST /deliverables (Submit) | ❌ | ✅ | Mahasiswa mengumpulkan tugas. |
| **Deliverables List** | GET /deliverables (List All) | ✅ | ❌ | Admin memantau pengumpulan tugas. |
| **Worksheet** | POST /worksheets (Submit) | ❌ | ✅ | Mahasiswa check-in mingguan. |
| **Worksheet Valid.** | PUT /worksheets/:id/validate | ✅ | ❌ | Admin memvalidasi laporan check-in. |
| **Feedback** | POST /feedback (Submit) | ❌ | ✅ | Peer review antar mahasiswa. |
| **Feedback Export** | GET /feedback/export | ✅ | ❌ | Admin download data feedback. |

---

## 1. 🔐 Authentication Features

**Base URL:** `/api/auth`

### a. Register User
Mendaftarkan pengguna baru.

-   **Endpoint:** `POST /register`
-   **Body:**
    ```json
    {
      "email": "student@indo.com",
      "password": "password123",
      "name": "Budi Santoso"
    }
    ```
-   **Response (201 Created):**
    ```json
    {
      "message": "Registrasi berhasil.",
      "user": {
        "id": "uuid-user-1",
        "email": "student@indo.com",
        "name": "Budi Santoso",
        "role": "student",
        "batch_id": "asah-batch-1"
      },
      "meta": { "timestamp": "2023-10-01T10:00:00Z" }
    }
    ```

### b. Login User
Masuk ke sistem.

-   **Endpoint:** `POST /login`
-   **Body:**
    ```json
    {
      "email": "student@indo.com",
      "password": "password123"
    }
    ```
-   **Response (200 OK):**
    ```json
    {
      "token": "eyJhbGciOiJIUzI1Ti...",
      "user": {
        "id": "uuid-user-1",
        "email": "student@indo.com",
        "role": "student",
        "users_source_id": "FUI0001"
      },
      "meta": { "timestamp": "2023-10-01T10:00:00Z" }
    }
    ```

---

## 2. 👤 User & Dashboard Features

**Base URL:** `/api/user` (Auth: Bearer Token)

### a. Get Profile
-   **Endpoint:** `GET /profile`
-   **Response (200 OK):**
    ```json
    {
      "message": "Berhasil mengambil profil pengguna.",
      "data": {
        "name": "Budi Santoso",
        "email": "student@indo.com",
        "role": "student",
        "university": "Universitas Indonesia",
        "learning_group": "M01",
        "learning_path": "Machine Learning (ML)",
        "users_source_id": "FUI0001"
      },
      "meta": { "timestamp": "..." }
    }
    ```

### b. Update Profile
Memperbarui data profil pengguna.
**Catatan:** `learning_path` hanya bisa diset **SEKALI**. Jika sudah ada nilainya, tidak bisa diubah lagi.
-   **Endpoint:** `PUT /profile`
-   **Body:**
    ```json
    {
      "name": "Budi Santoso",
      "university": "Institut Teknologi Bandung",
      "learning_group": "M02",
      "learning_path": "Machine Learning (ML)" // Opsional, hanya jika belum diset
    }
    ```
-   **Response (200 OK):**
    ```json
    {
      "message": "Profil berhasil diperbarui.",
      "data": {
        "name": "Budi Santoso",
        "email": "student@indo.com",
        "role": "student",
        "university": "Institut Teknologi Bandung",
        "learning_group": "M02",
        "learning_path": "Machine Learning (ML)"
      },
      "meta": { "timestamp": "..." }
    }
    ```

### c. List Available Docs
-   **Endpoint:** `GET /docs`
-   **Response (200 OK):**
    ```json
    {
      "message": "Berhasil mengambil daftar dokumen.",
      "data": [
        { "id": "uuid-doc-1", "title": "Guidebook", "url": "http://...", "order_idx": 1 }
      ]
    }
    ```

### c. List Project Timeline
-   **Endpoint:** `GET /timeline`
-   **Response (200 OK):**
    ```json
    {
      "message": "Berhasil mengambil timeline proyek.",
      "data": [
        { "title": "Pendaftaran", "start_at": "...", "end_at": "..." }
      ]
    }
    ```

### d. List Use Cases
-   **Endpoint:** `GET /use-cases`
-   **Response (200 OK):**
    ```json
    {
      "message": "Berhasil mengambil daftar use cases.",
      "data": [
        { "id": "uuid-uc-1", "name": "Company Profile AI", "company": "Dicoding" },
        { "id": "uuid-uc-2", "name": "E-Commerce", "company": "Tokopedia" }
      ]
    }
    ```

---

## 3. 👥 Group & Team Features (Student Scope)

**Base URL:** `/api/group` (Auth: Student)

### a. Register Team
-   **Endpoint:** `POST /register`
-   **Body:**
    ```json
    {
      "group_name": "Capstone Team A",
      "use_case_source_id": "UC-001",
      "member_source_ids": ["FUI0001", "FUI0002"]
    }
    ```
-   **Response (201 Created):**
    ```json
    {
      "message": "Pendaftaran tim berhasil dikirim dan menunggu validasi.",
      "data": { "group_id": "uuid-group-1", "status": "pending_validation" },
      "meta": { "timestamp": "..." }
    }
    ```
-   **Error (400 - Invalid Composition):**
    ```json
    {
      "message": "Komposisi tim tidak memenuhi syarat: Machine Learning harus >= 2.",
      "error": { "code": "INVALID_COMPOSITION" }
    }
    ```

### b. Get My Team
-   **Endpoint:** `GET /my-team`
-   **Response (200 OK):**
    ```json
    {
      "message": "Berhasil mengambil data tim.",
      "data": {
        "id": "uuid-group-1",
        "group_name": "Capstone Team A",
        "status": "pending_validation",
        "members": [
          { "name": "Budi", "role": "leader", "learning_path": "Cloud Computing" },
          { "name": "Siti", "role": "member", "learning_path": "Machine Learning" }
        ]
      }
    }
    ```

### c. Upload Document (General)
Mengupload dokumen umum ke grup.
-   **Endpoint:** `POST /docs`
-   **Body:**
    ```json
    {
      "group_id": "uuid-group-1",
      "url": "https://storage.com/file.pdf"
    }
    ```
-   **Response (201 Created):**
    ```json
    {
      "message": "Dokumen berhasil dibuat.",
      "doc_id": "uuid-doc-new"
    }
    ```

### d. Get Group Rules
Melihat aturan komposisi tim yang aktif.
-   **Endpoint:** `GET /rules`
-   **Response (200 OK):**
    ```json
    {
      "message": "Berhasil mengambil aturan grup.",
      "data": [
        {
          "id": "uuid-rule-1",
          "user_attribute": "learning_path",
          "attribute_value": "Machine Learning",
          "operator": ">=",
          "value": "2",
          "is_active": true
        }
      ]
    }
    ```

---

## 4. 📦 Deliverables Features

**Base URL:** `/api/group` (Student) / `/api/admin` (Admin)

### a. Submit Deliverable (Student)
-   **Endpoint:** `POST /api/group/deliverables`
-   **Body:**
    ```json
    {
      "document_type": "PROJECT_PLAN", // ENUM: PROJECT_PLAN, FINAL_REPORT, PRESENTATION_VIDEO
      "file_path": "https://drive.google.com/file/d/...",
      "description": "Submitted by Budi"
    }
    ```
-   **Response (201 Created):**
    ```json
    {
      "message": "Dokumen berhasil dikumpulkan.",
      "data": {
        "id": "uuid-deliv-1",
        "document_type": "PROJECT_PLAN",
        "file_path": "...",
        "status": "SUBMITTED",
        "submitted_at": "..."
      }
    }
    ```

### b. List Deliverables (Admin)
-   **Endpoint:** `GET /api/admin/deliverables`
-   **Query Params:** `document_type=PROJECT_PLAN`
-   **Response (200 OK):**
    ```json
    {
      "message": "Berhasil mengambil daftar deliverables.",
      "data": [
        {
          "id": "uuid-deliv-1",
          "document_type": "PROJECT_PLAN",
          "file_path": "...",
          "submitted_at": "...",
          "group": { "group_name": "Capstone Team A" }
        }
      ]
    }
    ```

---

## 5. 📅 Capstone Worksheet (Check-in) Features

**Base URL:** `/api/group` (Student) / `/api/admin` (Admin)

### a. Submit Worksheet (Student)
-   **Endpoint:** `POST /api/group/worksheets`
-   **Body:**
    ```json
    {
      "period_start": "2023-10-01",
      "period_end": "2023-10-14",
      "activity_description": "Membuat API Login dan Register.",
      "proof_url": "https://github.com/capstone-team/backend/pull/1"
    }
    ```
-   **Response (201 Created):**
    ```json
    {
      "message": "Worksheet berhasil dikumpulkan.",
      "data": {
        "id": "uuid-ws-1",
        "activity_description": "Membuat API...",
        "status": "submitted",
        "submitted_at": "..."
      }
    }
    ```

### b. List My Worksheets (Student)
-   **Endpoint:** `GET /api/group/worksheets`
-   **Response (200 OK):**
    ```json
    {
      "message": "Berhasil mengambil riwayat worksheet.",
      "data": [
        {
          "id": "uuid-ws-1",
          "period_start": "...",
          "status": "approved",
          "feedback": "Good job!"
        }
      ]
    }
    ```

### c. List All Worksheets (Admin)
-   **Endpoint:** `GET /api/admin/worksheets`
-   **Query Optional:** `?status=submitted`
-   **Response (200 OK):**
    ```json
    {
      "message": "Berhasil mengambil daftar worksheet.",
      "data": [
        {
          "id": "uuid-ws-1",
          "user_ref": "uuid-user-1",
          "activity_description": "...",
          "users": { "name": "Budi", "email": "budi@mail.com" }
        }
      ]
    }
    ```

### d. Validate Worksheet (Admin)
-   **Endpoint:** `PUT /api/admin/worksheets/:id/validate`
-   **Body:**
    ```json
    {
      "status": "approved", // approved, rejected, late
      "feedback": "Deskripsi sangat jelas, lanjutkan."
    }
    ```
-   **Response (200 OK):**
    ```json
    {
      "message": "Worksheet berhasil divalidasi.",
      "data": {
        "id": "uuid-ws-1",
        "status": "approved",
        "feedback": "Deskripsi sangat jelas, lanjutkan."
      }
    }
    ```

---

## 6. 🔄 360-Degree Feedback Features

**Base URL:** `/api/group` (Student) / `/api/admin` (Admin)

### a. Submit Feedback (Student)
-   **Endpoint:** `POST /api/group/feedback`
-   **Body:**
    ```json
    {
      "reviewee_source_id": "FUI0002",
      "is_member_active": true,
      "contribution_level": "signifikan",
      "reason": "Sangat proaktif dalam coding."
    }
    ```
-   **Response (201 Created):**
    ```json
    {
      "message": "Penilaian berhasil dikirim.",
      "data": {
        "id": "uuid-fb-1",
        "contribution_level": "signifikan",
        "created_at": "..."
      }
    }
    ```

### b. Get Feedback Status (Student)
-   **Endpoint:** `GET /api/group/feedback/status`
-   **Response (200 OK):**
    ```json
    {
      "message": "Berhasil mengambil status penilaian.",
      "data": [
        { "name": "Siti (FUI0002)", "status": "pending" },
        { "name": "Andi (FUI0003)", "status": "completed" }
      ]
    }
    ```

### c. Export Feedback Data (Admin)
-   **Endpoint:** `GET /api/admin/feedback/export`
-   **Response (200 OK):**
    ```json
    {
      "message": "Berhasil mengambil data export feedback.",
      "data": [
        {
          "reviewer_name": "Budi",
          "reviewee_name": "Siti",
          "group_name": "Capstone Team A",
          "contribution": "signifikan",
          "reason": "..."
        }
      ]
    }
    ```

---

## 7. 🛡️ Admin Management Features

**Base URL:** `/api/admin` (Auth: Admin)

### a. List All Groups
Melihat semua grup yang terdaftar.

-   **Endpoint:** `GET /groups`
-   **Body:** _(None)_
-   **Response (200 OK):**
    ```json
    {
      "message": "Berhasil mengambil semua grup.",
      ],
      "meta": { "timestamp": "..." }
    }
    ```

### b. Update Student Learning Path (Override)
Endpoint khusus Admin untuk mengubah Learning Path student (bisa mengubah meskipun student sudah pernah set).

-   **Endpoint:** `PUT /users/:userId/learning-path`
-   **Body:**
    ```json
    {
      "learning_path": "Front-End Web & Back-End with AI (FEBE)" 
    }
    ```
-   **Response (200 OK):**
    ```json
    {
      "message": "Learning path student berhasil diperbarui oleh admin.",
      "data": { ... },
      "meta": { ... }
    }
    ```

### c. Validate Group (Accept/Reject)
Validasi pendaftaran tim mahasiswa.

-   **Endpoint:** `POST /groups/:groupId/validate`
-   **Body:**
    ```json
    {
      "status": "accepted", // accepted / rejected
      "rejection_reason": "" // Optional
    }
    ```
-   **Response (200 OK):**
    ```json
    {
      "message": "Grup berhasil divalidasi sebagai accepted.",
      "data": { "id": "uuid-group-1", "status": "accepted" },
      "meta": { "timestamp": "..." }
    }
    ```

### c. Create Group (Manual)
Membuat grup oleh admin (jarang dipakai jika registrasi via user).

-   **Endpoint:** `POST /groups`
-   **Body:**
    ```json
    {
      "group_name": "Tim Cadangan",
      "batch_id": "asah-batch-1"
    }
    ```
-   **Response (201 Created):**
    ```json
    {
      "message": "Grup berhasil dibuat.",
      "group": { "id": "uuid-group-new", "group_name": "Tim Cadangan" }
    }
    ```

### d. Set Composition Rules
Mengatur aturan batch (ex: Machine Learning min 2 orang).

-   **Endpoint:** `POST /rules`
-   **Body:**
    ```json
    {
      "batch_id": "asah-batch-1",
      "rules": [
        {
          "user_attribute": "learning_path",
          "attribute_value": "Machine Learning",
          "operator": ">=",
          "value": 2
        }
      ]
    }
    ```
-   **Response (201 Created):**
    ```json
    {
      "message": "Aturan grup berhasil disimpan."
    }
    ```
