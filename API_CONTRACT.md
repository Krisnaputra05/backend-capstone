# 📚 API Contract: Admin & User Features


####  NOTE : UNTUK FRONT-END  JADI UNTUK SEMUA KEY BISA DI COMBAIN 2 KEY SEPERTI USER ID SAMA ID UIDD

Berikut adalah dokumentasi kontrak API untuk fitur Admin (Group Management) dan User (View & Docs), melengkapi kontrak Auth yang sudah ada.

---

## 🔐 0. Auth Features

**Base URL:** `/api/auth`

### a. Register User

Mendaftarkan pengguna baru.
**Catatan:** Jika pengguna mendaftar sebelum **30 Januari 2026**, `batch_id` akan otomatis diset ke **'asah-batch-1'**.

- **Endpoint:** `POST /register`
- **Headers:** `Content-Type: application/json`

**Request Body:**

```json
{
  "email": "String", // Wajib
  "password": "String", // Wajib
  "name": "String", // Wajib
  "role": "String" // Opsional (default: student)
}
```

**Success Response (Status 201 Created):**

```json
{
  "message": "Registrasi berhasil.",
  "user": {
    "id": "UUID",
    "email": "String",
    "name": "String",
    "role": "String",
    "batch_id": "String" // e.g., "asah-batch-1"
  },
  "meta": {
    "timestamp": "ISO8601"
  }
}
```

---

## 🛡️ 1. Admin: Group Management

**Base URL:** `/api/admin`
**Authorization:** Bearer Token (Role: `admin`)

### a. Create Group

Membuat grup baru dan menetapkan admin pembuat sebagai leader.

- **Endpoint:** `POST /groups`
- **Headers:** `Authorization: Bearer <token>`

**Request Body:**

```json
{
  "group_name": "String", // Wajib. Contoh: "Capstone A"
  "batch_id": "String" // Wajib. Contoh: "BATCH-001"
}
```

**Success Response (Status 201 Created):**

```json
{
  "message": "Grup berhasil dibuat dan leader telah ditetapkan.",
  "group": {
    "id": "UUID",
    "group_name": "String",
    "batch_id": "String",
    "creator_user_ref": "UUID",
    "status": "draft",
    "created_at": "ISO8601"
  },
  "meta": {
    "timestamp": "ISO8601"
  }
}
```

**Error Response (Status 400, 500):**

```json
{
  "message": "Permintaan tidak valid. Beberapa field wajib diisi.",
  "error": {
    "code": "VALIDATION_FAILED",
    "fields": {
      "group_name": "Nama grup wajib diisi."
    }
  },
  "meta": {
    "timestamp": "ISO8601"
  }
}
```

---

### b. Update Group

Memperbarui informasi dasar grup.

- **Endpoint:** `PUT /groups/:groupId`
- **Headers:** `Authorization: Bearer <token>`
- **Params:** `groupId` (UUID)

**Request Body:**

```json
{
  "group_name": "String", // Opsional
  "batch_id": "String", // Opsional
  "status": "String" // Opsional. Contoh: "active", "inactive", "draft"
}
```

**Success Response (Status 200 OK):**

```json
{
  "message": "Grup ID <groupId> berhasil diperbarui.",
  "group": {
    "id": "UUID",
    "group_name": "String",
    "batch_id": "String",
    "updated_at": "ISO8601"
  },
  "meta": {
    "timestamp": "ISO8601"
  }
}
```

---

### c. Update Project Status

Mengubah status proyek grup menjadi `in_progress`.

- **Endpoint:** `PUT /project/:groupId`
- **Headers:** `Authorization: Bearer <token>`
- **Params:** `groupId` (UUID)

**Request Body:** _(Kosong)_

**Success Response (Status 200 OK):**

```json
{
  "message": "Status proyek untuk Grup ID <groupId> berhasil diubah menjadi 'in_progress'.",
  "meta": {
    "timestamp": "ISO8601"
  }
}
```

---

### d. List All Groups

Mengambil daftar semua grup beserta nama pembuatnya.

- **Endpoint:** `GET /groups`
- **Headers:** `Authorization: Bearer <token>`

**Success Response (Status 200 OK):**

```json
{
  "message": "Berhasil mengambil semua grup.",
  "data": [
    {
      "id": "UUID",
      "group_name": "String",
      "batch_id": "String",
      "status": "String",
      "creator_name": "String", // Nama pembuat grup
      "created_at": "ISO8601"
    }
  ],
  "meta": {
    "timestamp": "ISO8601"
  }
}
```

---

## 👤 2. User Features

**Base URL:** `/api/user`
**Authorization:** Bearer Token (Role: `student` / `admin`)

### a. Get Profile

Mengambil data profil pengguna yang sedang login.

- **Endpoint:** `GET /profile`
- **Headers:** `Authorization: Bearer <token>`

**Success Response (Status 200 OK):**

```json
{
  "message": "Berhasil mengambil profil pengguna.",
  "data": {
    "name": "String",
    "email": "String",
    "role": "String",
    "university": "String",
    "learning_group": "String"
  },
  "meta": {
    "timestamp": "ISO8601"
  }
}
```

---

### b. List Available Docs

Mengambil daftar dokumen referensi capstone.

- **Endpoint:** `GET /docs`
- **Headers:** `Authorization: Bearer <token>`

**Success Response (Status 200 OK):**

```json
{
  "message": "Berhasil mengambil daftar dokumen.",
  "data": [
    {
      "id": "UUID",
      "title": "String",
      "url": "String",
      "order_idx": "Number"
    }
  ],
  "meta": {
    "timestamp": "ISO8601"
  }
}
```

---

### c. List Project Timeline

Mengambil timeline proyek (difilter berdasarkan batch user jika ada).

- **Endpoint:** `GET /timeline`
- **Headers:** `Authorization: Bearer <token>`

**Success Response (Status 200 OK):**

```json
{
  "message": "Berhasil mengambil timeline proyek.",
  "data": [
    {
      "id": "UUID",
      "title": "String",
      "description": "String",
      "start_at": "ISO8601",
      "end_at": "ISO8601"
    }
  ],
  "meta": {
    "timestamp": "ISO8601"
  }
}
```

---

### d. List Use Cases

Mengambil daftar use case yang tersedia.

- **Endpoint:** `GET /use-cases`
- **Headers:** `Authorization: Bearer <token>`

**Success Response (Status 200 OK):**

```json
{
  "message": "Berhasil mengambil daftar use cases.",
  "data": [
    {
      "id": "UUID",
      "name": "String",
      "company": "String"
    }
  ],
  "meta": {
    "timestamp": "ISO8601"
  }
}
```

---

## 📂 3. Group Features (User)

**Base URL:** `/api/group`
**Authorization:** Bearer Token (Role: `student`)

### a. Upload Document

Mengupload dokumen tugas ke grup.

- **Endpoint:** `POST /docs`
- **Headers:** `Authorization: Bearer <token>`

**Request Body:**

```json
{
  "group_id": "UUID", // Wajib
  "url": "String" // Wajib (URL file yang sudah diupload ke storage)
}
```

**Success Response (Status 201 Created):**

```json
{
  "message": "Dokumen berhasil dibuat.",
  "doc_id": "UUID",
  "meta": {
    "timestamp": "ISO8601"
  }
}
```

**Error Response (Status 400):**

```json
{
  "message": "group_id dan url wajib diisi.",
  "error": {
    "code": "VALIDATION_FAILED"
  },
  "meta": {
    "timestamp": "ISO8601"
  }
}
```

---

### b. Submit Deliverable

Mengumpulkan dokumen deliverable (Project Plan, Final Report, Video).

- **Endpoint:** `POST /deliverables`
- **Headers:** `Authorization: Bearer <token>`

**Request Body:**

```json
{
  "document_type": "String", // Wajib. Enum: "PROJECT_PLAN", "FINAL_REPORT", "PRESENTATION_VIDEO"
  "file_path": "String", // Wajib. URL file
  "description": "String" // Opsional
}
```

**Success Response (Status 201 Created):**

```json
{
  "message": "Dokumen berhasil dikumpulkan.",
  "data": {
    "id": "UUID",
    "group_ref": "UUID",
    "document_type": "String",
    "file_path": "String",
    "status": "SUBMITTED",
    "submitted_at": "ISO8601"
  },
  "meta": {
    "timestamp": "ISO8601"
  }
}
```

---

### c. Get Group Rules

Melihat aturan komposisi tim yang aktif.

- **Endpoint:** `GET /rules`
- **Headers:** `Authorization: Bearer <token>`

**Success Response (Status 200 OK):**

```json
{
  "message": "Berhasil mengambil aturan grup.",
  "data": [
    {
      "id": "UUID",
      "user_attribute": "learning_path",
      "attribute_value": "Machine Learning",
      "operator": ">=",
      "value": "2",
      "is_active": true
    }
  ],
  "meta": {
    "timestamp": "ISO8601"
  }
}
```

---

---

### c. Get My Team

Melihat detail tim pengguna saat ini (termasuk status dan anggota).

- **Endpoint:** `GET /my-team`
- **Headers:** `Authorization: Bearer <token>`

**Success Response (Status 200 OK):**

```json
{
  "message": "Berhasil mengambil data tim.",
  "data": {
    "id": "UUID",
    "group_name": "String",
    "status": "String",
    "batch_id": "String",
    "members": [
      {
        "id": "UUID",
        "name": "String",
        "email": "String",
        "role": "leader", // atau "member"
        "learning_path": "String",
        "university": "String"
      }
    ]
  },
  "meta": {
    "timestamp": "ISO8601"
  }
}
```

---

Mendaftarkan tim baru dengan validasi komposisi dan keanggotaan.
**Aturan:** 
1. Komposisi tim divalidasi berdasarkan aturan **Use Case** yang dipilih.
2. Ketua kelompok harus ada di dalam daftar anggota.
1. Komposisi tim divalidasi berdasarkan aturan **Use Case** yang dipilih.
2. Ketua kelompok harus ada di dalam daftar anggota.
3. **Profil Ketua** (Learning Path & Universitas) harus sudah dilengkapi sebelum mendaftar.
4. **Email Notifikasi:** Setelah pendaftaran berhasil, email konfirmasi ("Pendaftaran Diterima") akan dikirimkan secara otomatis ke seluruh anggota tim.

- **Endpoint:** `POST /register`
- **Headers:** `Authorization: Bearer <token>`

**Request Body:**

```json
{
  "group_name": "String", // Wajib
  "use_case_id": "UUID", // Wajib
  "member_source_ids": ["String", "String"] // Array ID anggota (e.g., ["FUI0001", "FUI0002"])
}
```

**Success Response (Status 201 Created):**

```json
{
  "message": "Pendaftaran tim berhasil dikirim dan menunggu validasi.",
  "data": {
    "group_id": "UUID",
    "status": "pending_validation"
  },
  "meta": {
    "timestamp": "ISO8601"
  }
}
```

**Error Response (Status 400 - Invalid Composition):**

```json
{
  "message": "Komposisi tim tidak memenuhi syarat: Machine Learning harus >= 2.",
  "error": {
    "code": "INVALID_COMPOSITION"
  },
  "meta": {
    "timestamp": "ISO8601"
  }
}
```

**Error Response (Status 400 - Double Submission):**

```json
{
  "message": "Beberapa anggota sudah terdaftar di tim lain yang valid.",
  "error": {
    "code": "DOUBLE_SUBMISSION",
    "fields": {
      "doubleUserIds": ["UUID"]
    }
  },
  "meta": {
    "timestamp": "ISO8601"
  }
}
```

---

## 🛡️ 4. Admin: Team Validation & Rules

**Base URL:** `/api/admin`
**Authorization:** Bearer Token (Role: `admin`)

### a. Set Group Rules

Mengatur aturan komposisi tim.

- **Endpoint:** `POST /rules`
- **Headers:** `Authorization: Bearer <token>`

**Request Body:**

```json
{
  "batch_id": "String", // Wajib
  "rules": [
    {
      "user_attribute": "learning_path",
      "attribute_value": "Machine Learning",
      "operator": ">=",
      "value": "2"
    }
  ]
}
```

**Success Response (Status 201 Created):**

```json
{
  "message": "Aturan grup berhasil disimpan.",
  "data": [ ... ],
  "meta": {
    "timestamp": "ISO8601"
  }
}
```

---

### b. Validate Group Registration

Memvalidasi pendaftaran tim (Terima/Tolak).
**Catatan:** Sistem akan mengirimkan **email notifikasi** ke seluruh anggota tim berisi status validasi (Diterima/Ditolak) beserta alasannya (jika ditolak).

- **Endpoint:** `POST /groups/:groupId/validate`
- **Headers:** `Authorization: Bearer <token>`
- **Params:** `groupId` (UUID)

**Request Body:**

```json
{
  "status": "accepted", // atau "rejected"
  "rejection_reason": "String" // Opsional jika rejected
}
```

**Success Response (Status 200 OK):**

```json
{
  "message": "Grup berhasil divalidasi sebagai accepted.",
  "data": { ... },
  "meta": {
    "timestamp": "ISO8601"
  }
}
```
