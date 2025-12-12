require("dotenv").config();
const { supabase } = require("../src/config/supabaseClient");

async function checkGroupSchema() {
  const { data, error } = await supabase
    .from("capstone_groups")
    .select("*")
    .limit(1);

  if (data && data.length > 0) {
    console.log("Groups columns:", Object.keys(data[0]));
  } else {
    console.log("No data or columns found.");
  }
}

checkGroupSchema();
