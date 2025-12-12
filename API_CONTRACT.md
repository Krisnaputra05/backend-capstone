# 📚 API Contract: Capstone Project Backend

Dokumentasi lengkap untuk endpoint yang tersedia di backend Capstone Project Management.

---

##  Server Base URL (Domains)

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

## 🌟 Overview Fitur
Project ini memiliki **7 Modul Utama** yang terbagi untuk role **Admin** dan **Student**:

1.  **Authentication (Auth)**: Registrasi dan Login pengguna (dengan JWT).
2.  **User Profile & Dashboard**: Profil pengguna, timeline proyek, dan daftar dokumen referensi.
3.  **Group Management (Admin)**: Pembuatan, update status, dan manajemen anggota tim (Add/Remove/Randomize).
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
| **Manage Members** | POST/DELETE /groups/:id/members | ✅ | ❌ | Admin menambah/menghapus anggota. |
| **Rules Config** | POST /rules | ✅ | ❌ | Admin mengatur aturan komposisi tim. |
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
Memperbarui data profil pengguna. **Catatan:** `learning_path` hanya bisa diset **SEKALI**.
-   **Endpoint:** `PUT /profile`
-   **Body:**
    ```json
    {
      "name": "Budi Santoso",
      "university": "Institut Teknologi Bandung",
      "learning_group": "M02",
      "learning_path": "Machine Learning (ML)"
    }
    ```
-   **Response (200 OK):**
    ```json
    {
      "message": "Profil berhasil diperbarui.",
      "data": { ... }
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

### d. List Project Timeline
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

### e. List Use Cases
-   **Endpoint:** `GET /use-cases`
-   **Response (200 OK):**
    ```json
    {
      "message": "Berhasil mengambil daftar use cases.",
      "data": [
        { "id": "uuid-uc-1", "name": "Company Profile AI", "company": "Dicoding" }
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
      "data": { "group_id": "uuid-group-1", "status": "pending_validation" }
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
        "capstone_groups_source_id": "CAPS-12345678", // ID Unik untuk Tampilan
        "group_name": "Capstone Team A",
        "status": "pending_validation",
        "members": [
          { "name": "Budi", "role": "leader", "learning_path": "Cloud Computing" },
          { "name": "Siti", "role": "member", "learning_path": "Machine Learning" }
        ]
      }
    }
    ```

### c. Get Group Rules
Melihat aturan komposisi tim yang aktif.
-   **Endpoint:** `GET /rules`
-   **Response (200 OK):**
    ```json
    {
      "message": "Berhasil mengambil aturan grup.",
      "data": [
        {
          "user_attribute": "learning_path",
          "attribute_value": "Machine Learning",
          "operator": ">=",
          "value": "2"
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
      "document_type": "PROJECT_PLAN", // PROJECT_PLAN, FINAL_REPORT, VIDEO_PRESENTATION
      "file_path": "https://drive.google.com/...",
      "description": "Submitted by Budi"
    }
    ```

### b. List Deliverables (Admin)
-   **Endpoint:** `GET /api/admin/deliverables`
-   **Query Params:** `document_type=PROJECT_PLAN`

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
      "activity_description": "Membuat API...",
      "proof_url": "https://github.com/..."
    }
    ```

### b. List My Worksheets (Student)
-   **Endpoint:** `GET /api/group/worksheets`

### c. List All Worksheets (Admin)
-   **Endpoint:** `GET /api/admin/worksheets`

### d. Validate Worksheet (Admin)
-   **Endpoint:** `PUT /api/admin/worksheets/:id/validate`
-   **Body:**
    ```json
    { "status": "approved", "feedback": "Good job." }
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
      "group_ref": "uuid-group-1", // Optional (Explicit)
      "batch_id": "asah-batch-1",  // Optional (Explicit)
      "is_member_active": true,
      "contribution_level": "signifikan",
      "reason": "..."
    }
    ```
-   **Response (201 Created):**
    ```json
    {
      "message": "Penilaian berhasil dikirim.",
      "data": {
        "id": "uuid-feedback-1",
        "contribution_level": "signifikan",
        "group_name": "Capstone Team A", // Nama Grup (Friendly)
        "submitted_for": "Siti Aminah",  // Nama Teman (Friendly)
        ...
      }
    }
    ```

### b. Get Feedback Status (Student)
-   **Endpoint:** `GET /api/group/feedback/status`

### c. Export Feedback Data (Admin)
-   **Endpoint:** `GET /api/admin/feedback/export`

---

## 7. 🛡️ Admin Management Features

**Base URL:** `/api/admin` (Auth: Admin)

### A. Group Operations

#### 1. List All Groups
-   **Endpoint:** `GET /groups`
-   **Response (200 OK):** `{ "data": [ ...groups ] }`

#### 2. Create Group (Manual)
-   **Endpoint:** `POST /groups`
-   **Body:** `{ "group_name": "Tim A", "batch_id": "batch-1" }`

#### 3. Validate Group (Accept/Reject)
Validasi pendaftaran tim mahasiswa. **Mengirim Email Notifikasi**.
-   **Endpoint:** `POST /groups/:groupId/validate`
-   **Body:**
    ```json
    {
      "status": "accepted", // or "rejected"
      "rejection_reason": ""
    }
    ```

#### 4. Set Composition Rules
Mengatur aturan batch (ex: Machine Learning min 2 orang).
-   **Endpoint:** `POST /rules`
-   **Body:**
    ```json
    {
      "batch_id": "asah-batch-1",
      "rules": [
        { "user_attribute": "learning_path", "attribute_value": "Machine Learning", "operator": ">=", "value": 2 }
      ]
    }
    ```

### B. Team Member Management (NEW)

#### 1. Add Member to Group
Menambahkan siswa ke dalam grup secara manual.
-   **Endpoint:** `POST /groups/:groupId/members`
-   **Body:** `{ "user_id": "uuid-user-1" }`
-   **Response (201 Created):** `{ "message": "Anggota berhasil ditambahkan ke grup." }`

#### 2. Remove Member from Group
Menghapus siswa dari grup (Soft Delete: status menjadi inactive).
-   **Endpoint:** `DELETE /groups/:groupId/members/:userId`
-   **Response (200 OK):** `{ "message": "Anggota berhasil dihapus dari grup." }`

#### 3. Get Unassigned Students
Melihat daftar siswa yang belum memiliki tim (tidak aktif di grup manapun).
-   **Endpoint:** `GET /users/unassigned?batch_id=batch-1`
-   **Response (200 OK):**
    ```json
    {
      "message": "Berhasil mengambil daftar siswa tanpa tim.",
      "data": [ { "id": "...", "name": "Budi", "email": "..." } ]
    }
    ```

#### 4. Auto Assign / Randomize Team
Mengacak siswa yang belum punya tim ke dalam grup baru.
**Fitur Smart Matchmaking:**
- Memprioritaskan **Aturan Komposisi** (Rules) yang aktif (misal: "Harus ada 1 ML").
- Mengisi sisa slot secara acak hingga tim berisi 3 orang.
- **Random Use Case**: Setiap tim otomatis diberikan Topic/Use Case acak.

-   **Endpoint:** `POST /groups/auto-assign`
-   **Body:** `{ "batch_id": "asah-batch-1" }`
-   **Response (200 OK):**
    ```json
    {
      "message": "Proses randomisasi anggota berhasil.",
      "data": {
        "assigned_count": 12,
        "groups_created": 4,
        "details": [
          {
            "user": "Budi",
            "group": "Auto Team 1 - 1234",
            "role": "leader",
            "use_case": "uuid-use-case-1"
          }
        ]
      }
    }
    ```

### C. Student Data Management

#### 1. Update Student Learning Path (Override)
Endpoint khusus Admin untuk mengubah Learning Path student.
-   **Endpoint:** `PUT /users/:userId/learning-path`
-   **Body:** `{ "learning_path": "Front-End Web & Back-End with AI (FEBE)" }`

### D. Other Admin Features

#### 1. Create Timeline
Membuat jadwal/timeline baru untuk proyek.
-   **Endpoint:** `POST /timeline`
-   **Body:**
    ```json
    {
      "title": "Pendaftaran",
      "description": "Periode pendaftaran untuk mahasiswa batch 1.",
      "start_at": "2023-10-01",
      "end_at": "2023-10-07",
      "batch_id": "asah-batch-1"
    }
    ```
-   **Response (201 Created):**
    ```json
    {
      "message": "Timeline berhasil dibuat.",
      "data": { ... }
    }
    ```
