require("dotenv").config();
const { supabase } = require("../src/config/supabaseClient");

const BATCH_ID = process.argv[2] || "asah-batch-1";

async function checkBatchData() {
  console.log(`--- Debugging Batch: ${BATCH_ID} ---`);

  // 1. Get All Students in Batch
  const { data: students, error: uErr } = await supabase
    .from("users")
    .select("id, name, email, role")
    .eq("batch_id", BATCH_ID);
    // .eq("role", "student"); // Let's check ALL roles first to catch case issues

  if (uErr) {
    console.error("Error fetching users:", uErr);
    return;
  }
  
  console.log(`\nTotal Users in Batch '${BATCH_ID}': ${students?.length}`);
  
  // LOG ROLES
  const uniqueRoles = [...new Set(students.map(u => u.role))];
  console.log("Roles found in this batch:", uniqueRoles);

  if (students?.length === 0) {
    console.warn(">> WARNING: No users found in this batch! Check if batch_id matches exactly.");
    return;
  }

  const studentRoleCount = students.filter(u => u.role === 'student').length;
  console.log(`Users with role='student': ${studentRoleCount}`);

  // 2. Get All Active Memberships
  // We want to see if these specific users are in the member table
  const userIds = students.map(u => u.id);
  
  const { data: memberships, error: mErr } = await supabase
    .from("capstone_group_member")
    .select("user_ref, state, group_ref")
    .in("user_ref", userIds)
    .eq("state", "active");

  if (mErr) {
    console.error("Error fetching memberships:", mErr);
    return;
  }

  console.log(`Total Active Memberships found for these users: ${memberships?.length}`);

  // 3. Identification
  const activeUserIds = new Set(memberships.map(m => m.user_ref));
  const unassigned = students.filter(s => !activeUserIds.has(s.id) && s.role === 'student');

  console.log(`\n--- Unassigned Students (${unassigned.length}) ---`);
  unassigned.forEach(s => console.log(`- ${s.name} (${s.email})`));

  if (unassigned.length === 0) {
    console.log("\n>> RESULT: All students in this batch are already assigned to a team.");
  }
}

checkBatchData();
