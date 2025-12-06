const { supabase } = require("../config/supabaseClient");

/**
 * Fungsi untuk menghasilkan respons error yang konsisten.
 */
const buildErrorResponse = (res, status, message, code, fields = {}) => {
  const errorDetails = {
    code: code,
    ...(Object.keys(fields).length > 0 && { fields: fields }),
  };
  return res.status(status).json({
    message: message,
    error: errorDetails,
    meta: { timestamp: new Date().toISOString() },
  });
};

/**
 * GET /api/user/profile
 * Mengambil data profil pengguna yang login.
 */
async function getProfile(req, res) {
  const userId = req.user.userId;

  const { data: user, error } = await supabase
    .from("users")
    .select("name, email, role, university, learning_group") // Ambil field relevan saja
    .eq("id", userId)
    .single();

  if (error || !user) {
    return buildErrorResponse(
      res,
      404,
      "Profil pengguna tidak ditemukan.",
      "USER_NOT_FOUND"
    );
  }

  return res.status(200).json({
    message: "Berhasil mengambil profil pengguna.",
    data: user,
    meta: { timestamp: new Date().toISOString() },
  });
}

/**
 * GET /api/user/docs
 * Mengambil semua dokumen yang tersedia.
 */
async function listAvailableDocs(req, res) {
  const { data: docs, error } = await supabase
    .from("capstone_docs")
    .select("*")
    .order("order_idx", { ascending: true });

  if (error) {
    return buildErrorResponse(
      res,
      500,
      "Gagal mengambil daftar dokumen.",
      "DB_SELECT_FAILED"
    );
  }

  return res.status(200).json({
    message: "Berhasil mengambil daftar dokumen.",
    data: docs,
    meta: { timestamp: new Date().toISOString() },
  });
}

/**
 * GET /api/user/timeline
 * Mengambil timeline proyek berdasarkan batch pengguna.
 */
async function listProjectTimeline(req, res) {
  const userId = req.user.userId;

  // 1. Dapatkan batch_id pengguna dari tabel users (atau dari token jika ada)
  // Kita query ke users dulu untuk memastikan data terbaru
  const { data: user, error: userErr } = await supabase
    .from("users")
    .select("batch_id")
    .eq("id", userId)
    .single();

  if (userErr || !user) {
    return buildErrorResponse(
      res,
      404,
      "Data pengguna tidak ditemukan untuk mengambil timeline.",
      "USER_NOT_FOUND"
    );
  }

  const batchId = user.batch_id;

  // 2. Query timeline berdasarkan batch_id
  let query = supabase
    .from("capstone_timeline")
    .select("*")
    .order("created_at", { ascending: false });

  if (batchId) {
    query = query.eq("batch_id", batchId);
  }
  // Jika batchId null, mungkin tampilkan semua atau kosong? 
  // Asumsi: Tampilkan semua jika user tidak punya batch, atau sesuaikan logika bisnis.
  // Di sini kita biarkan filter jika batchId ada.

  const { data: timelines, error: tlErr } = await query;

  if (tlErr) {
    return buildErrorResponse(
      res,
      500,
      "Gagal mengambil timeline proyek.",
      "DB_SELECT_FAILED"
    );
  }

  return res.status(200).json({
    message: "Berhasil mengambil timeline proyek.",
    data: timelines,
    meta: { timestamp: new Date().toISOString() },
  });
}

/**
 * GET /api/user/use-cases
 * Mengambil daftar use cases yang tersedia.
 */
async function listUseCases(req, res) {
  const { data: useCases, error } = await supabase
    .from("capstone_use_case")
    .select("*");

  if (error) {
    return buildErrorResponse(
      res,
      500,
      "Gagal mengambil daftar use cases.",
      "DB_SELECT_FAILED"
    );
  }

  return res.status(200).json({
    message: "Berhasil mengambil daftar use cases.",
    data: useCases,
    meta: { timestamp: new Date().toISOString() },
  });
}

/**
 * POST /api/group/docs (Used by group.js)
 * Upload dokumen baru.
 */
async function createDoc(req, res) {
  const userId = req.user.userId;
  const { group_id, url } = req.body || {};

  if (!group_id || !url) {
    return buildErrorResponse(
      res,
      400,
      "group_id dan url wajib diisi.",
      "VALIDATION_FAILED"
    );
  }

  const payload = {
    // group_id, 
    
    url, // Input 'url' langsung ke kolom 'url'
    
    // uploaded_by: userId, 
    
    created_at: new Date().toISOString(),
  };

  // Tambahan: Jika tabel ini butuh title (not null), kita kasih default atau ambil dari body
  if (req.body.title) {
    payload.title = req.body.title;
  }
  
  const { data, error } = await supabase
    .from("capstone_docs")
    .insert({
        url,
        // group_id: group_id, 
        // uploaded_by: userId, 
        created_at: new Date().toISOString()
    })
    .select("id")
    .single();

  if (error) {
    console.error("Supabase INSERT Error (createDoc):", error);
    return buildErrorResponse(
      res,
      500,
      "Gagal mengupload dokumen.",
      "DB_INSERT_FAILED"
    );
  }

  return res.status(201).json({
    message: "Dokumen berhasil dibuat.",
    doc_id: data.id,
    meta: { timestamp: new Date().toISOString() },
  });
}

/**
 * GET /api/group/rules
 * Mengambil aturan komposisi tim yang aktif.
 */
async function getGroupRules(req, res) {
  const userId = req.user.userId;

  // Ambil batch_id user
  const { data: user } = await supabase.from("users").select("batch_id").eq("id", userId).single();
  
  if (!user || !user.batch_id) {
    return buildErrorResponse(res, 404, "Batch ID pengguna tidak ditemukan.", "USER_BATCH_NOT_FOUND");
  }

  const { data: rules, error } = await supabase
    .from("capstone_group_rules")
    .select("*")
    .eq("batch_id", user.batch_id)
    .eq("is_active", true);

  if (error) {
    return buildErrorResponse(res, 500, "Gagal mengambil aturan grup.", "DB_SELECT_FAILED");
  }

  return res.status(200).json({
    message: "Berhasil mengambil aturan grup.",
    data: rules,
    meta: { timestamp: new Date().toISOString() },
  });
}

/**
 * POST /api/group/register
 * Mendaftarkan tim capstone baru dengan validasi lengkap.
 */
async function registerTeam(req, res) {
  const creatorId = req.user.userId;
  const { group_name, member_ids } = req.body; // member_ids: array of user UUIDs

  // --- 1. Validasi Input Dasar ---
  if (!group_name || !Array.isArray(member_ids) || member_ids.length === 0) {
    return buildErrorResponse(res, 400, "Nama grup dan daftar anggota wajib diisi.", "VALIDATION_FAILED");
  }

  // --- 2. Cek Apakah Pendaftaran Dibuka (Optional: Cek Timeline/Rules) ---
  // (Logic ini bisa ditambahkan jika ada tabel periode pendaftaran)

  // --- 3. Validasi Anggota (ID Valid & Double Submission) ---
  // Ambil data semua anggota yang didaftarkan
  const { data: members, error: membersErr } = await supabase
    .from("users")
    .select("id, learning_path, batch_id")
    .in("id", member_ids);

  if (membersErr || members.length !== member_ids.length) {
    return buildErrorResponse(res, 400, "Satu atau lebih ID anggota tidak valid.", "INVALID_MEMBER_ID");
  }

  // Cek apakah anggota sudah punya tim yang VALID/ACCEPTED
  // Kita cari di capstone_group_member -> join capstone_groups
  const { data: existingMemberships, error: existErr } = await supabase
    .from("capstone_group_member")
    .select("user_ref, capstone_groups!inner(status)")
    .in("user_ref", member_ids)
    .eq("capstone_groups.status", "accepted"); // Hanya cek yang sudah diterima

  if (existErr) {
    console.error("Check existing members error:", existErr);
    return buildErrorResponse(res, 500, "Gagal memvalidasi keanggotaan.", "DB_ERROR");
  }

  if (existingMemberships && existingMemberships.length > 0) {
    const doubleUserIds = existingMemberships.map(m => m.user_ref);
    return buildErrorResponse(res, 400, "Beberapa anggota sudah terdaftar di tim lain yang valid.", "DOUBLE_SUBMISSION", { doubleUserIds });
  }

  // --- 4. Validasi Komposisi Tim (Berdasarkan Rules) ---
  // Ambil rules aktif untuk batch ini (asumsi semua member satu batch)
  const batchId = members[0].batch_id; 
  const { data: rules } = await supabase
    .from("capstone_group_rules")
    .select("*")
    .eq("batch_id", batchId)
    .eq("is_active", true);

  if (rules && rules.length > 0) {
    // Hitung komposisi tim saat ini
    const composition = {}; // { 'Machine Learning': 2, 'Cloud Computing': 1 }
    members.forEach(m => {
      const path = m.learning_path;
      composition[path] = (composition[path] || 0) + 1;
    });

    // Cek setiap rule
    for (const rule of rules) {
      if (rule.user_attribute === 'learning_path') {
        const requiredCount = parseInt(rule.value); // Asumsi value disimpan sebagai angka/string angka
        const actualCount = composition[rule.attribute_value] || 0;
        
        let isValid = false;
        if (rule.operator === '>=') isValid = actualCount >= requiredCount;
        else if (rule.operator === '<=') isValid = actualCount <= requiredCount;
        else if (rule.operator === '=') isValid = actualCount === requiredCount;

        if (!isValid) {
          return buildErrorResponse(res, 400, `Komposisi tim tidak memenuhi syarat: ${rule.attribute_value} harus ${rule.operator} ${rule.value}.`, "INVALID_COMPOSITION");
        }
      }
    }
  }

  // --- 5. Simpan Data Tim (Status: pending_validation) ---
  // Insert Group
  const { data: group, error: groupErr } = await supabase
    .from("capstone_groups")
    .insert({
      group_name,
      batch_id: batchId,
      creator_user_ref: creatorId,
      status: "pending_validation", // Menunggu validasi admin
      created_at: new Date().toISOString()
    })
    .select()
    .single();

  if (groupErr) {
    return buildErrorResponse(res, 500, "Gagal membuat grup.", "DB_INSERT_FAILED");
  }

  // Insert Members
  const memberInserts = member_ids.map(uid => ({
    group_ref: group.id,
    user_ref: uid,
    role: uid === creatorId ? 'leader' : 'member',
    state: 'active',
    joined_at: new Date().toISOString()
  }));

  const { error: memberInsertErr } = await supabase
    .from("capstone_group_member")
    .insert(memberInserts);

  if (memberInsertErr) {
    // Rollback group creation (manual delete) ideally, but for now just error
    console.error("Member insert error:", memberInsertErr);
    return buildErrorResponse(res, 500, "Gagal menambahkan anggota tim.", "DB_INSERT_FAILED");
  }

  return res.status(201).json({
    message: "Pendaftaran tim berhasil dikirim dan menunggu validasi.",
    data: { group_id: group.id, status: group.status },
    meta: { timestamp: new Date().toISOString() },
  });
}

module.exports = {
  getProfile,
  listAvailableDocs,
  listProjectTimeline,
  listUseCases,
  createDoc,
  getGroupRules,
  registerTeam,
};
