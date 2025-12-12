require("dotenv").config();
const { supabase } = require("../src/config/supabaseClient");

async function checkSchema() {
  const { data, error } = await supabase
    .from("capstone_timeline")
    .select("*")
    .limit(1);

  if (error) {
    console.error("Error fetching timeline:", error);
    return;
  }

  if (data && data.length > 0) {
    console.log("Timeline columns:", Object.keys(data[0]));
  } else {
    console.log("No data in timeline, cannot infer columns easily via select *.");
    // Try inserting a dummy with description to see if it fails? 
    // Or just assume user knows what they are talking about.
  }
}

checkSchema();
