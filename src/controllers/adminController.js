const { supabase } = require("../config/supabaseClient");

/**
 * Fungsi untuk menghasilkan respons error yang konsisten (Status 4xx/5xx).
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

// --- Fungsi Controller ---

/**
 * POST /api/admin/groups
 * Membuat grup capstone baru dan menetapkan user pembuat sebagai leader.
 */
async function createGroup(req, res) {
  // KOREKSI: Hapus mentor_id. Ambil batch_id (diasumsikan wajib).
  const { group_name, batch_id } = req.body || {};

  // --- 1. Validasi Input Dasar ---
  const errorFields = {};
  if (!group_name) errorFields.group_name = "Nama grup wajib diisi.";
  if (!batch_id) errorFields.batch_id = "Batch ID wajib diisi.";

  if (Object.keys(errorFields).length > 0) {
    return buildErrorResponse(
      res,
      400,
      "Permintaan tidak valid. Beberapa field wajib diisi.",
      "VALIDATION_FAILED",
      errorFields
    );
  }

  // --- 2. INSERT ke capstone_groups ---
  const { data: group, error: insertErr } = await supabase
    .from("capstone_groups")
    .insert({
      group_name,
      batch_id,
      creator_user_ref: req.user.userId, // FK Wajib: Admin yang membuat grup
      status: "draft", // Status harus diisi karena kemungkinan NOT NULL
      created_at: new Date().toISOString(),
    })
    .select("id, group_name, batch_id, creator_user_ref, status, created_at")
    .single();

  if (insertErr || !group) {
    console.error("Supabase INSERT Error (capstone_groups):", insertErr);
    return buildErrorResponse(
      res,
      500,
      "Gagal membuat grup karena masalah database. (Periksa batch_id atau FK users)",
      "DB_INSERT_FAILED"
    );
  }

  // --- 3. INSERT ke capstone_group_member (Menetapkan Leader) ---
  const leaderPayload = {
    // KOREKSI: Menggunakan group_ref dan user_ref (sesuai skema)
    group_ref: group.id,
    user_ref: req.user.userId,
    // Menetapkan field wajib lainnya
    role: "leader",
    state: "active",
    joined_at: new Date().toISOString(),
  };
  const { error: memberErr } = await supabase
    .from("capstone_group_member")
    .insert(leaderPayload);

  if (memberErr) {
    console.error("Supabase INSERT Error (group_member):", memberErr);
    return buildErrorResponse(
      res,
      500,
      "Grup berhasil dibuat, namun gagal menetapkan leader grup. (Masalah FK user/group)",
      "GROUP_MEMBER_INSERT_FAILED"
    );
  }

  // --- 4. Sukses (201 Created) ---
  return res.status(201).json({
    message: "Grup berhasil dibuat dan leader telah ditetapkan.",
    group: group,
    meta: { timestamp: new Date().toISOString() },
  });
}

/**
 * PUT /api/admin/project/:groupId
 * Mengupdate status proyek untuk grup tertentu menjadi 'in_progress'.
 */
async function updateProjectStatus(req, res) {
  const { groupId } = req.params;

  // --- 1. Validasi Input Dasar ---
  if (!groupId) {
    return buildErrorResponse(
      res,
      400,
      "ID Grup wajib disediakan di URL.",
      "VALIDATION_FAILED",
      { groupId: "groupId is required in URL parameter" }
    );
  }

  // --- 2. UPDATE capstone_groups (Schema Correction) ---
  // Note: Schema capstone_information tidak memiliki kolom status atau group_id.
  // Status proyek biasanya melekat pada grup itu sendiri di tabel capstone_groups.
  const { error } = await supabase
    .from("capstone_groups")
    .update({ status: "in_progress", updated_at: new Date().toISOString() })
    .eq("id", groupId);

  if (error) {
    return buildErrorResponse(
      res,
      500,
      "Gagal memperbarui status proyek.",
      "DB_UPDATE_FAILED"
    );
  }

  // --- 3. Sukses (200 OK) ---
  return res.status(200).json({
    message: `Status proyek untuk Grup ID ${groupId} berhasil diubah menjadi 'in_progress'.`,
    meta: { timestamp: new Date().toISOString() },
  });
}

/**
 * PUT /api/admin/groups/:groupId
 * Memperbarui data grup.
 */
async function updateGroup(req, res) {
  const { groupId } = req.params;
  // Hati-hati: Kolom mentor_id dan is_active kemungkinan TIDAK ADA di skema baru Anda
  const { group_name, batch_id, status } = req.body || {};

  // --- 1. Validasi Input Parameter ---
  if (!groupId) {
    return buildErrorResponse(
      res,
      400,
      "ID Grup wajib disediakan di URL.",
      "VALIDATION_FAILED",
      { groupId: "groupId is required in URL parameter" }
    );
  }

  // --- 2. Validasi Body (Membangun objek updates) ---
  const updates = {};
  let isUpdateSent = false;

  if (group_name !== undefined) {
    updates.group_name = group_name;
    isUpdateSent = true;
  }
  if (batch_id !== undefined) {
    updates.batch_id = batch_id;
    isUpdateSent = true;
  }
  if (status !== undefined) {
    updates.status = status;
    isUpdateSent = true;
  }

  if (!isUpdateSent) {
    return buildErrorResponse(
      res,
      400,
      "Data yang akan diubah wajib disediakan di body.",
      "NO_DATA_PROVIDED"
    );
  }

  // Tambahkan timestamp update
  updates.updated_at = new Date().toISOString();

  // --- 3. UPDATE capstone_groups di Supabase ---
  const { data: updatedGroup, error } = await supabase
    .from("capstone_groups")
    .update(updates)
    .eq("id", groupId)
    .select("id, group_name, batch_id, updated_at")
    .single();

  if (error) {
    console.error("Supabase UPDATE Error:", error);
    return buildErrorResponse(
      res,
      500,
      "Gagal memperbarui data grup karena masalah database.",
      "DB_UPDATE_FAILED"
    );
  }

  if (!updatedGroup) {
    return buildErrorResponse(
      res,
      404,
      `Grup dengan ID ${groupId} tidak ditemukan.`,
      "NOT_FOUND"
    );
  }

  // --- 4. Sukses (200 OK) ---
  return res.status(200).json({
    message: `Grup ID ${groupId} berhasil diperbarui.`,
    group: updatedGroup,
    meta: { timestamp: updates.updated_at },
  });
}

/**
 * GET /api/admin/groups
 * Mengambil semua grup beserta nama pembuatnya.
 */
async function listAllGroups(req, res) {
  // --- 1. SELECT semua grup dengan join ke users ---
  // Asumsi: creator_user_ref adalah FK ke users.id
  // Syntax: select('*, users:creator_user_ref(name)')
  const { data: groups, error } = await supabase
    .from("capstone_groups")
    .select("*, users:creator_user_ref(name)")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Supabase SELECT Error:", error);
    return buildErrorResponse(
      res,
      500,
      "Gagal mengambil daftar grup.",
      "DB_SELECT_FAILED"
    );
  }

  // --- 2. Format Data (Flattening user name if needed) ---
  const formattedGroups = groups.map((g) => ({
    ...g,
    creator_name: g.users ? g.users.name : null,
    users: undefined, // Hapus objek users nested jika ingin struktur datar
  }));

  // --- 3. Sukses (200 OK) ---
  return res.status(200).json({
    message: "Berhasil mengambil semua grup.",
    data: formattedGroups,
    meta: { timestamp: new Date().toISOString() },
  });
}

/**
 * POST /api/admin/rules
 * Mengatur aturan komposisi tim (Group Rules).
 */
async function setGroupRules(req, res) {
  const { batch_id, rules } = req.body || {};

  // rules expected format: [{ user_attribute: 'learning_path', attribute_value: 'Machine Learning', operator: '>=', value: '2' }, ...]

  if (!batch_id || !Array.isArray(rules) || rules.length === 0) {
    return buildErrorResponse(
      res,
      400,
      "batch_id dan rules (array) wajib diisi.",
      "VALIDATION_FAILED"
    );
  }

  // 1. Nonaktifkan rules lama untuk batch ini (opsional, tergantung requirement, disini kita replace)
  await supabase
    .from("capstone_group_rules")
    .update({ is_active: false })
    .eq("batch_id", batch_id);

  // 2. Insert rules baru
  const newRules = rules.map((r) => ({
    batch_id,
    user_attribute: r.user_attribute,
    attribute_value: r.attribute_value,
    operator: r.operator,
    value: r.value, // Pastikan tipe data kolom 'value' di DB mendukung (Text/Number). Jika Timestamp, ini akan error.
    is_active: true,
    is_required: true,
    created_at: new Date().toISOString(),
  }));

  const { data, error } = await supabase
    .from("capstone_group_rules")
    .insert(newRules)
    .select();

  if (error) {
    console.error("Supabase INSERT Error (rules):", error);
    return buildErrorResponse(
      res,
      500,
      "Gagal menyimpan aturan grup.",
      "DB_INSERT_FAILED"
    );
  }

  return res.status(201).json({
    message: "Aturan grup berhasil disimpan.",
    data: data,
    meta: { timestamp: new Date().toISOString() },
  });
}

/**
 * POST /api/admin/groups/:groupId/validate
 * Memvalidasi pendaftaran tim (Terima/Tolak).
 */
async function validateGroupRegistration(req, res) {
  const { groupId } = req.params;
  const { status, rejection_reason } = req.body; // status: 'accepted' | 'rejected'

  if (!groupId || !["accepted", "rejected"].includes(status)) {
    return buildErrorResponse(
      res,
      400,
      "Status harus 'accepted' atau 'rejected'.",
      "VALIDATION_FAILED"
    );
  }

  // 1. Update status grup
  const updatePayload = {
    status: status, // 'accepted' (valid) atau 'rejected'
    updated_at: new Date().toISOString(),
  };

  const { data: group, error } = await supabase
    .from("capstone_groups")
    .update(updatePayload)
    .eq("id", groupId)
    .select("*, creator_user_ref(email, name)") // Ambil info creator untuk email
    .single();

  if (error) {
    return buildErrorResponse(
      res,
      500,
      "Gagal memvalidasi grup.",
      "DB_UPDATE_FAILED"
    );
  }

  // 2. Kirim Email Notifikasi (Mocking)
  // Di real implementation, panggil service email di sini.
  const emailSubject = status === "accepted" ? "Pendaftaran Tim Diterima" : "Pendaftaran Tim Ditolak";
  const emailBody = status === "accepted" 
    ? `Selamat! Tim Anda ${group.group_name} telah diterima.` 
    : `Maaf, tim Anda ditolak. Alasan: ${rejection_reason || "Tidak memenuhi kriteria."}`;
  
  console.log(`[MOCK EMAIL] To: ${group.creator_user_ref?.email}, Subject: ${emailSubject}, Body: ${emailBody}`);

  return res.status(200).json({
    message: `Grup berhasil divalidasi sebagai ${status}.`,
    data: group,
    meta: { timestamp: new Date().toISOString() },
  });
}

module.exports = { createGroup, updateProjectStatus, updateGroup, listAllGroups, setGroupRules, validateGroupRegistration };
