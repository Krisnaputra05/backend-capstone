const { supabase } = require("../src/config/supabaseClient");
require("dotenv").config();

const GROUP_ID = process.argv[2]; // Pass ID as argument

async function checkGroupEmails() {
  console.log("--- Debug Group Emails ---");
  if (!GROUP_ID) {
    console.error("Please provide a Group ID as an argument.");
    console.log("Usage: node scripts/debug_group_emails.js <GROUP_ID>");
    return;
  }

  console.log(`Checking Group ID: ${GROUP_ID}`);

  // 1. Check Group exists
  const { data: group, error: gError } = await supabase
    .from("capstone_groups")
    .select("id, group_name, status")
    .eq("id", GROUP_ID)
    .single();

  if (gError || !group) {
    console.error("Group not found or error:", gError);
    return;
  }
  console.log("Group Found:", group);

  // 2. Check Members (Raw)
  const { data: membersRaw } = await supabase
    .from("capstone_group_member")
    .select("*")
    .eq("group_ref", GROUP_ID);
  
  console.log(`Total Members in table: ${membersRaw?.length}`);
  console.log("Raw Members:", membersRaw);

  // 3. Check Members + User Email + Active Filter
  const { data: membersActive } = await supabase
    .from("capstone_group_member")
    .select("user_ref, is_active, users:user_ref(email, name)")
    .eq("group_ref", GROUP_ID)
    .eq("is_active", true);

  console.log("--- Active Members Query Result ---");
  if (membersActive && membersActive.length > 0) {
    membersActive.forEach(m => {
      console.log(`- Member: ${m.users?.name}, Email: ${m.users?.email}, Active: ${m.is_active}`);
    });
  } else {
    console.log("No active members found with the current query.");
    console.log("Possible causes: 'is_active' is false, or 'user_ref' link is broken.");
  }
}

checkGroupEmails();
