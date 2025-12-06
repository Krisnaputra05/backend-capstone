# 📧 Panduan Fitur Email Notifikasi

Dokumen ini menjelaskan cara kerja dan konfigurasi fitur pengiriman email otomatis pada backend.

## 📂 Struktur Kode

Fitur ini terdiri dari 3 bagian utama:

1.  **Service Layer** (`src/services/emailService.js`)
    *   Berisi konfigurasi `nodemailer` (transporter).
    *   Fungsi `sendTeamRegistrationEmail`: Mengirim email saat tim baru mendaftar.
    *   Fungsi `sendTeamValidationEmail`: Mengirim email saat status tim divalidasi (Diterima/Ditolak).

2.  **User Controller** (`src/controllers/userController.js`)
    *   Pada fungsi `registerTeam`, setelah data tersimpan di database, sistem memanggil `sendTeamRegistrationEmail` untuk mengirim notifikasi ke seluruh anggota tim.

3.  **Admin Controller** (`src/controllers/adminController.js`)
    *   Pada fungsi `validateGroupRegistration`, setelah admin mengubah status tim, sistem memanggil `sendTeamValidationEmail` untuk memberi tahu hasil validasi ke anggota tim.

---

## ⚙️ Konfigurasi (Wajib Dilakukan)

Agar email dapat terkirim (tidak hanya muncul di console log), Anda harus mengatur **Environment Variables** di file `.env`.

### 1. Edit File `.env`

Tambahkan konfigurasi berikut ke dalam file `.env` Anda:

```env
EMAIL_SERVICE=gmail
EMAIL_USER=email_anda@gmail.com
EMAIL_PASS=app_password_anda
EMAIL_FROM="Admin Capstone <email_anda@gmail.com>"
```

### 2. Cara Mendapatkan `EMAIL_PASS` (Gmail)

Karena alasan keamanan, Anda **TIDAK BISA** menggunakan password login Gmail biasa. Anda harus membuat **App Password**.

1.  Login ke akun Google Anda.
2.  Buka **Manage your Google Account** > **Security**.
3.  Pastikan **2-Step Verification** sudah **ON**.
4.  Cari menu **App passwords** (atau cari di kolom search "App passwords").
5.  Buat App Password baru:
    *   **App name**: Masukkan nama bebas, misal "Backend Capstone".
    *   Klik **Create**.
6.  Google akan memberikan kode 16 karakter (misal: `abcd efgh ijkl mnop`).
7.  Copy kode tersebut dan paste ke `EMAIL_PASS` di file `.env` (tanpa spasi).

---

## 🚀 Cara Testing

1.  Pastikan `.env` sudah terisi.
2.  Jalankan server: `npm run dev`.
3.  Coba fitur **Register Team** (sebagai User) atau **Validate Team** (sebagai Admin).
4.  Cek inbox email anggota tim yang didaftarkan.

**Catatan:** Jika `.env` belum diset, sistem akan berjalan dalam **Mock Mode** dan hanya menampilkan isi email di terminal (console log).
