import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

function loadEnv() {
  const envPath = path.resolve(process.cwd(), ".env");
  const envContent = fs.readFileSync(envPath, "utf-8");
  const config: Record<string, string> = {};
  envContent.split("\n").forEach((line) => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      let key = match[1];
      let value = match[2] || "";
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.substring(1, value.length - 1);
      }
      config[key] = value;
    }
  });
  return config;
}

async function main() {
  const env = loadEnv();
  const url = env.VITE_SUPABASE_URL;
  const anonKey = env.VITE_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !anonKey) {
    console.error("Missing credentials in .env file!");
    return;
  }

  console.log("Supabase URL:", url);
  const supabase = createClient(url, anonKey);

  console.log("Checking profiles table schema...");
  try {
    // We select sync_journal_memory specifically to test if it exists
    const { data, error } = await supabase
      .from("profiles")
      .select("id, name, sync_journal_memory")
      .limit(1);

    if (error) {
      console.error("Database query returned error:", error);
    } else {
      console.log("Success! Columns exist in the database. Data:", data);
    }
  } catch (err) {
    console.error("Thrown exception:", err);
  }
}

main();
