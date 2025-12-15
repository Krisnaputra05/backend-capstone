# 🔄 360-Degree Feedback API Contract

Dokumentasi khusus untuk fitur 360-Degree Feedback (Penilaian Antar Teman Sejawat).
Fitur ini memungkinkan mahasiswa untuk menilai kontribusi anggota tim mereka sendiri.

**Base URL**: 
- Student: `/api/group`
- Admin: `/api/admin`

---

## 1. 📝 Submit Feedback (Student)
Mahasiswa memberikan penilaian kepada anggota timnya.

- **Endpoint**: `POST /api/group/feedback`
- **Auth**: Bearer Token (Role: Student)

### Request Body
| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `reviewee_id` | UUID | ✅* | UUID anggota yang dinilai. (Prioritas) |
| `reviewee_source_id` | String | ✅* | ID Source (FUI...) jika UUID tidak diketahui. |
| `is_member_active` | Boolean | ✅ | Status keaktifan anggota di tim. |
| `contribution_level` | Enum | ✅ | `signifikan`, `sakit_darurat`, `tidak_signifikan`, `tidak_kontribusi`. |
| `reason` | String | ✅ | Alasan penilaian. |
| `group_ref` | UUID | ❌ | ID Group (Optional/Explicit). |
| `batch_id` | String | ❌ | Batch ID (Optional/Explicit). |

*\*Salah satu dari `reviewee_id` atau `reviewee_source_id` wajib diisi.*

**Contoh Body**:
```json
{
  "reviewee_id": "3192d540-e9cd-428b-9d63-3161454c5333",
  "is_member_active": true,
  "contribution_level": "signifikan",
  "reason": "Sangat proaktif dalam coding dan membantu tim."
}
```

### Response (201 Created)
```json
{
  "message": "Penilaian berhasil dikirim.",
  "data": {
    "id": "2d7b4e64-b7bb-4237-9366-1b041f15717f",
    "contribution_level": "signifikan",
    "group_name": "Capstone Team A",
    "submitted_for": "Siti Aminah",
    "created_at": "2025-12-09T08:46:02.704Z"
  }
}
```

---

## 2. 📋 List Feedback History & Status (Student)
Melihat daftar anggota tim dan status penilaian (apakah saya sudah menilai mereka?).
Endpoint ini **digunakan** untuk mendapatkan `id` (UUID) atau `source_id` teman yang akan dinilai pada endpoint POST di atas.

- **Endpoint**: `GET /api/group/feedback/status`
- **Auth**: Bearer Token (Role: Student)

### Response (200 OK)
```json
{
  "message": "Berhasil mengambil status penilaian.",
  "data": [
    {
      "reviewee_id": "3192d540-e9cd-428b-9d63-3161454c5333", 
      "reviewee_source_id": "FUI0002",
      "name": "Budi Santoso",
      "group_id": "98f27b12-b373-4ae8-8ed4-831406d9d06f",
      "batch_id": "asah-batch-1",
      "status": "completed", 
      "feedback": {
         "contribution_level": "signifikan",
         "reason": "Sangat membantu...",
         "submitted_at": "2025-12-09T08:46:02.704Z"
      }
    },
    {
      "reviewee_id": "uuid-member-2",
      "reviewee_source_id": "FUI0003",
      "name": "Siti",
      "group_id": "98f27b12-b373-4ae8-8ed4-831406d9d06f",
      "batch_id": "asah-batch-1",
      "status": "pending", 
      "feedback": null
    }
  ]
}
```
*Catatan: Gunakan field `reviewee_id`, `reviewee_source_id`, `group_id`, dan `batch_id` langsung untuk payload POST.*

---

## 3. 📊 List All Feedback Data (Admin)
Admin dapat mengunduh/melihat seluruh data feedback untuk keperluan rekapitulasi nilai.

- **Endpoint**: `GET /api/admin/feedback/export`
- **Auth**: Bearer Token (Role: Admin)

### Query Params
- `batch_id` (Optional): Filter berdasarkan Batch ID.
- `group_id` (Optional): Filter berdasarkan Group ID.

### Response (200 OK)
```json
{
  "message": "Berhasil mengambil data export feedback.",
  "data": [
    {
      "id": "2d7b4e64-b7bb-4237-9366-1b041f15717f",
      "created_at": "2025-12-09T08:46:02.704Z",
      "reviewer": { 
        "name": "Rudi", 
        "email": "rudi@example.com" 
      },
      "reviewee": { 
        "name": "Siti", 
        "email": "siti@example.com" 
      },
      "group": { 
        "group_name": "Team A" 
      },
      "contribution_level": "signifikan",
      "reason": "..."
    }
  ]
}
```

---

## 🗄️ Database Schema Example
Berikut adalah struktur data (row) pada tabel `capstone_360_feedback`.

**SQL Insert Example**:
```sql
INSERT INTO "public"."capstone_360_feedback" (
  "id", 
  "reviewer_user_ref", 
  "reviewee_user_ref", 
  "group_ref", 
  "batch_id", 
  "is_member_active", 
  "contribution_level", 
  "reason", 
  "created_at"
) VALUES (
  '2d7b4e64-b7bb-4237-9366-1b041f15717f', 
  '94df0dd4-5a2a-4640-ba6d-bb7ec8e41ed6', -- Reviewer UUID
  '3192d540-e9cd-428b-9d63-3161454c5333', -- Reviewee UUID
  '98f27b12-b373-4ae8-8ed4-831406d9d06f', -- Group UUID
  'asah-batch-1', 
  'true', 
  'signifikan', 
  'Sangat proaktif dalam coding.', 
  '2025-12-09 08:46:02.704+00'
);
```
