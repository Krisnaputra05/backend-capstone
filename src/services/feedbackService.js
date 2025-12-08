const { supabase } = require("../config/supabaseClient");

/**
 * Submit 360 Feedback for a team member
 * @param {string} reviewerId - ID of the user giving feedback
 * @param {object} data - { reviewee_source_id, is_member_active, contribution_level, reason }
 */
async function submitFeedbackService(reviewerId, data) {
  const { reviewee_source_id, is_member_active, contribution_level, reason } = data;

  // 1. Resolve Reviewee ID (from Source ID)
  const { data: reviewee, error: rErr } = await supabase
    .from("users")
    .select("id, batch_id")
    .eq("users_source_id", reviewee_source_id)
    .single();

  if (rErr || !reviewee) {
    throw { code: "USER_NOT_FOUND", message: "ID anggota yang dinilai tidak ditemukan." };
  }

  const revieweeId = reviewee.id;

  if (reviewerId === revieweeId) {
    throw { code: "SELF_REVIEW", message: "Anda tidak dapat menilai diri sendiri." };
  }

  // 2. Validate Membership (Must be in same accepted group)
  // Check Reviewer Group
  const { data: reviewerGroup } = await supabase
    .from("capstone_group_member")
    .select("group_ref, capstone_groups!inner(status)")
    .eq("user_ref", reviewerId)
    .eq("capstone_groups.status", "accepted")
    .single();

  // Check Reviewee Group
  const { data: revieweeGroup } = await supabase
    .from("capstone_group_member")
    .select("group_ref")
    .eq("user_ref", revieweeId)
    .single();

  if (!reviewerGroup || !revieweeGroup || reviewerGroup.group_ref !== revieweeGroup.group_ref) {
    throw { code: "DIFFERENT_TEAM", message: "Anda hanya dapat menilai anggota tim Anda sendiri." };
  }

  // 3. Check if already submitted
  const { data: existing } = await supabase
    .from("capstone_360_feedback")
    .select("id")
    .eq("reviewer_user_ref", reviewerId)
    .eq("reviewee_user_ref", revieweeId)
    .single();

  if (existing) {
    throw { code: "ALREADY_SUBMITTED", message: "Anda sudah menilai anggota ini." };
  }

  // 4. Insert Feedback
  const { data: feedback, error } = await supabase
    .from("capstone_360_feedback")
    .insert({
      reviewer_user_ref: reviewerId,
      reviewee_user_ref: revieweeId,
      group_ref: reviewerGroup.group_ref,
      batch_id: reviewee.batch_id,
      is_member_active,
      contribution_level,
      reason,
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error("Feedback insert error:", error);
    throw { code: "DB_INSERT_FAILED", message: "Gagal mengirim penilaian." };
  }

  return feedback;
}

/**
 * Get Feedback Status for a user (Who have I reviewed?)
 */
async function getFeedbackStatusService(userId) {
  // Get all team members
  const { data: myGroup } = await supabase
    .from("capstone_group_member")
    .select("group_ref")
    .eq("user_ref", userId)
    .single();

  if (!myGroup) return [];

  const { data: teamMembers } = await supabase
    .from("capstone_group_member")
    .select("user_ref, users:user_ref(name, users_source_id)")
    .eq("group_ref", myGroup.group_ref)
    .neq("user_ref", userId); // Exclude self

  // Get completed reviews
  const { data: completedReviews } = await supabase
    .from("capstone_360_feedback")
    .select("reviewee_user_ref")
    .eq("reviewer_user_ref", userId);

  const completedIds = new Set(completedReviews?.map(r => r.reviewee_user_ref));

  return teamMembers.map(m => ({
    name: m.users.name,
    source_id: m.users.users_source_id,
    status: completedIds.has(m.user_ref) ? "completed" : "pending"
  }));
}

/**
 * Admin: Get Feedback Data (Export)
 */
async function getFeedbackExportService() {
  const { data, error } = await supabase
    .from("capstone_360_feedback")
    .select(`
      id,
      created_at,
      batch_id,
      is_member_active,
      contribution_level,
      reason,
      reviewer:reviewer_user_ref(name, email, users_source_id),
      reviewee:reviewee_user_ref(name, email, users_source_id),
      group:group_ref(group_name)
    `)
    .order("created_at", { ascending: false });

  if (error) {
    throw { code: "DB_SELECT_FAILED", message: "Gagal mengambil data feedback." };
  }

  return data;
}

module.exports = {
  submitFeedbackService,
  getFeedbackStatusService,
  getFeedbackExportService,
};
