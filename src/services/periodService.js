const { supabase } = require("../config/supabaseClient");

/**
 * Create a new period (Admin)
 */
async function createPeriodService({ batch_id, title, start_date, end_date }) {
  const { data, error } = await supabase
    .from("capstone_periods")
    .insert({
      batch_id,
      title,
      start_date,
      end_date,
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error("Create period error:", error);
    throw { code: "DB_INSERT_FAILED", message: "Gagal membuat periode check-in." };
  }

  return data;
}

/**
 * List active periods for a batch
 */
async function listPeriodsService({ batch_id }) {
  let query = supabase
    .from("capstone_periods")
    .select("*")
    .order("start_date", { ascending: true });

  if (batch_id) {
    query = query.eq("batch_id", batch_id);
  }

  const { data, error } = await query;

  if (error) {
    throw { code: "DB_SELECT_FAILED", message: "Gagal mengambil daftar periode." };
  }

  return data;
}

/**
 * Get period details by ID
 */
async function getPeriodByIdService(periodId) {
  const { data, error } = await supabase
    .from("capstone_periods")
    .select("*")
    .eq("id", periodId)
    .single();

  if (error || !data) {
    throw { code: "PERIOD_NOT_FOUND", message: "Periode tidak ditemukan." };
  }

  return data;
}

module.exports = {
  createPeriodService,
  listPeriodsService,
  getPeriodByIdService,
};
