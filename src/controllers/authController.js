const { supabase } = require("../config/supabaseClient");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Login pengguna
async function login(req, res) {
  const { email, password } = req.body || {};

  // --- 1. Validasi Input Dasar (400 Bad Request) ---
  const errorFields = {};
  if (!email) errorFields.email = "Email wajib diisi.";
  if (!password) errorFields.password = "Password wajib diisi.";

  if (Object.keys(errorFields).length > 0) {
    return res.status(400).json({
      message: "Permintaan tidak valid. Beberapa field wajib diisi.",
      error: {
        code: "VALIDATION_FAILED",
        fields: errorFields,
      },
      meta: { timestamp: new Date().toISOString() },
    });
  }

  // --- 2. Ambil User (SELECT menggunakan 'name') ---
  const { data: user, error } = await supabase
    .from("users")
    .select("id, email, password, name, role") // <-- DIGANTI: full_name -> name
    .eq("email", email)
    .limit(1)
    .single();

  // --- 3. User Tidak Ditemukan atau Error DB (401 Unauthorized) ---
  if (error || !user) {
    if (error) console.error("Login DB Error:", error);
    if (!user) console.error("Login Failed: User not found for email", email);
    
    return res.status(401).json({
      message: "Kredensial tidak valid.",
      error: { code: "INVALID_CREDENTIALS" },
      meta: { timestamp: new Date().toISOString() },
    });
  }

  // --- 4. Cek Password ---
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) {
    return res.status(401).json({
      message: "Kredensial tidak valid.",
      error: { code: "INVALID_CREDENTIALS" },
      meta: { timestamp: new Date().toISOString() },
    });
  }

  // --- 5. Cek JWT Secret (500 Internal Server Error) ---
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return res.status(500).json({
      message: "Kesalahan konfigurasi server.",
      error: { code: "JWT_SECRET_MISSING" },
      meta: { timestamp: new Date().toISOString() },
    });
  }

  // --- 6. Sukses (200 OK) ---
  // JWT Payload menggunakan 'name'
  const token = jwt.sign(
    { userId: user.id, role: user.role, name: user.name }, // <-- DIGANTI: full_name -> name
    secret,
    { expiresIn: "8h" }
  );

  // Respon Sukses: TOKEN DIPINDAHKAN KE DALAM DATA
  return res.status(200).json({
    message: "Login berhasil.",
    data: {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name, // <-- DIGANTI: full_name -> name
        role: user.role,
      },
    },
    meta: { timestamp: new Date().toISOString() },
  });
}

// Registrasi pengguna baru
async function register(req, res) {
  // --- INPUT BODY MENGGUNAKAN 'name' ---
  const { email, password, name, role } = req.body || {};

  // --- 1. Validasi Input Dasar (400 Bad Request) ---
  const errorFields = {};
  if (!email) errorFields.email = "Email wajib diisi.";
  if (!password) errorFields.password = "Password wajib diisi.";
  if (!name) errorFields.name = "Nama lengkap wajib diisi."; // <-- DIGANTI: full_name -> name

  if (Object.keys(errorFields).length > 0) {
    return res.status(400).json({
      message: "Data pendaftaran tidak lengkap.",
      error: {
        code: "VALIDATION_FAILED",
        fields: errorFields,
      },
      meta: { timestamp: new Date().toISOString() },
    });
  }

  // --- 2. Validasi Role (400 Bad Request) ---
  const normalizedRole = (role || "student").toLowerCase();
  if (!["student", "admin"].includes(normalizedRole)) {
    return res.status(400).json({
      message: "Role tidak valid.",
      error: {
        code: "INVALID_ROLE",
        fields: { role: "Role harus 'student' atau 'admin'." },
      },
      meta: { timestamp: new Date().toISOString() },
    });
  }

  // --- 3. Cek Email Sudah Ada (409 Conflict) ---
  const { data: existing } = await supabase
    .from("users")
    .select("id")
    .eq("email", email)
    .limit(1)
    .maybeSingle();

  if (existing && existing.id) {
    return res.status(409).json({
      message: "Email sudah terdaftar.",
      error: { code: "EMAIL_ALREADY_EXISTS" },
      meta: { timestamp: new Date().toISOString() },
    });
  }

  // --- 4. Proses Pendaftaran ---
  const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || "10", 10);
  const hash = await bcrypt.hash(password, saltRounds);
  const payload = {
    email,
    password: hash,
    name, // <-- DIGANTI: full_name -> name
    role: normalizedRole,
    created_at: new Date().toISOString(),
  };

  const { data: user, error } = await supabase
    .from("users")
    .insert(payload)
    .select("id, email, name, role") // <-- DIGANTI: full_name -> name
    .single();

  // --- 5. Gagal Insert DB (500 Internal Server Error) ---
  if (error) {
    return res.status(500).json({
      message: "Gagal mendaftarkan pengguna karena kesalahan database.",
      error: { code: "DB_INSERT_FAILED" },
      meta: { timestamp: new Date().toISOString() },
    });
  }

  // --- 6. Sukses (201 Created) ---
  // Respon Sukses
  return res.status(201).json({
    message: "Pendaftaran berhasil. Silakan login.",
    data: {
      user: {
        id: user.id,
        email: user.email,
        name: user.name, // <-- DIGANTI: full_name -> name
        role: user.role,
      },
    },
    meta: { timestamp: new Date().toISOString() },
  });
}


// ... (Kode login dan register Anda di atas)

// Logout pengguna
async function logout(req, res) {
    // Di sisi server, kita hanya mengonfirmasi bahwa permintaan telah diterima.
    // Tugas klien: segera menghapus token JWT yang dimilikinya.
    
    // Menggunakan format respons yang konsisten:
    return res.status(200).json({
        message: "Logout berhasil. Token Anda tidak lagi valid dan telah dihapus dari sisi klien.",
        data: {}, // Mengembalikan data kosong atau null
        meta: { timestamp: new Date().toISOString() },
    });
}

module.exports = { login, register, logout }; // <-- EKSPOR FUNGSI BARU

// kode lama
// const { supabase } = require("../config/supabaseClient");
// const bcrypt = require("bcrypt");
// const jwt = require("jsonwebtoken");

// // Login pengguna
// async function login(req, res) {
//   const { email, password } = req.body || {};

//   // --- 1. Validasi Input Dasar (400 Bad Request) ---
//   const errorFields = {};
//   if (!email) errorFields.email = "Email wajib diisi.";
//   if (!password) errorFields.password = "Password wajib diisi.";

//   if (Object.keys(errorFields).length > 0) {
//     return res.status(400).json({
//       message: "Permintaan tidak valid. Beberapa field wajib diisi.",
//       error: {
//         code: "VALIDATION_FAILED",
//         fields: errorFields,
//       },
//       meta: { timestamp: new Date().toISOString() },
//     });
//   }

//   // --- 2. Ambil User ---
//   const { data: user, error } = await supabase
//     .from("users")
//     .select("id, email, password, full_name, role")
//     .eq("email", email)
//     .limit(1)
//     .single();

//   // --- 3. User Tidak Ditemukan atau Error DB (401 Unauthorized) ---
//   if (error || !user) {
//     return res.status(401).json({
//       message: "Kredensial tidak valid.",
//       error: { code: "INVALID_CREDENTIALS" },
//       meta: { timestamp: new Date().toISOString() },
//     });
//   }

//   // --- 4. Cek Password ---
//   const ok = await bcrypt.compare(password, user.password);
//   if (!ok) {
//     return res.status(401).json({
//       message: "Kredensial tidak valid.",
//       error: { code: "INVALID_CREDENTIALS" },
//       meta: { timestamp: new Date().toISOString() },
//     });
//   }

//   // --- 5. Cek JWT Secret (500 Internal Server Error) ---
//   const secret = process.env.JWT_SECRET;
//   if (!secret) {
//     return res.status(500).json({
//       message: "Kesalahan konfigurasi server.",
//       error: { code: "JWT_SECRET_MISSING" },
//       meta: { timestamp: new Date().toISOString() },
//     });
//   }

//   // --- 6. Sukses (200 OK) ---
//   const token = jwt.sign(
//     { userId: user.id, role: user.role, full_name: user.full_name },
//     secret,
//     { expiresIn: "8h" }
//   );

//   // Respon Sukses: TOKEN DIPINDAHKAN KE DALAM DATA
//   return res.status(200).json({
//     message: "Login berhasil.",
//     data: {
//       token, // <-- TOKEN ADA DI SINI
//       user: {
//         id: user.id,
//         email: user.email,
//         full_name: user.full_name,
//         role: user.role,
//       },
//     },
//     meta: { timestamp: new Date().toISOString() },
//   });
// }

// // Registrasi pengguna baru
// async function register(req, res) {
//   const { email, password, full_name, role } = req.body || {};

//   // --- 1. Validasi Input Dasar (400 Bad Request) ---
//   const errorFields = {};
//   if (!email) errorFields.email = "Email wajib diisi.";
//   if (!password) errorFields.password = "Password wajib diisi.";
//   if (!full_name) errorFields.full_name = "Nama lengkap wajib diisi.";

//   if (Object.keys(errorFields).length > 0) {
//     return res.status(400).json({
//       message: "Data pendaftaran tidak lengkap.",
//       error: {
//         code: "VALIDATION_FAILED",
//         fields: errorFields,
//       },
//       meta: { timestamp: new Date().toISOString() },
//     });
//   }

//   // --- 2. Validasi Role (400 Bad Request) ---
//   const normalizedRole = (role || "student").toLowerCase();
//   if (!["student", "admin"].includes(normalizedRole)) {
//     return res.status(400).json({
//       message: "Role tidak valid.",
//       error: {
//         code: "INVALID_ROLE",
//         fields: { role: "Role harus 'student' atau 'admin'." },
//       },
//       meta: { timestamp: new Date().toISOString() },
//     });
//   }

//   // --- 3. Cek Email Sudah Ada (409 Conflict) ---
//   const { data: existing } = await supabase
//     .from("users")
//     .select("id")
//     .eq("email", email)
//     .limit(1)
//     .maybeSingle();

//   if (existing && existing.id) {
//     return res.status(409).json({
//       message: "Email sudah terdaftar.",
//       error: { code: "EMAIL_ALREADY_EXISTS" },
//       meta: { timestamp: new Date().toISOString() },
//     });
//   }

//   // --- 4. Proses Pendaftaran ---
//   const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || "10", 10);
//   const hash = await bcrypt.hash(password, saltRounds);
//   const payload = {
//     email,
//     password: hash,
//     full_name,
//     role: normalizedRole,
//     created_at: new Date().toISOString(),
//   };

//   const { data: user, error } = await supabase
//     .from("users")
//     .insert(payload)
//     .select("id, email, full_name, role")
//     .single();

//   // --- 5. Gagal Insert DB (500 Internal Server Error) ---
//   if (error) {
//     return res.status(500).json({
//       message: "Gagal mendaftarkan pengguna karena kesalahan database.",
//       error: { code: "DB_INSERT_FAILED" },
//       meta: { timestamp: new Date().toISOString() },
//     });
//   }

//   // --- 6. Sukses (201 Created) ---
//   // Respon Sukses
//   return res.status(201).json({
//     message: "Pendaftaran berhasil. Silakan login.",
//     data: {
//       // Data user di dalam objek 'data'
//       user: {
//         id: user.id,
//         email: user.email,
//         full_name: user.full_name,
//         role: user.role,
//       },
//     },
//     meta: { timestamp: new Date().toISOString() },
//   });
// }

// module.exports = { login, register };
