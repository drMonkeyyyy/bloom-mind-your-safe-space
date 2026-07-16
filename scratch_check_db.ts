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
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    console.error("Missing credentials (URL/Service Role Key) in .env file!");
    return;
  }

  const supabase = createClient(url, serviceKey);

  console.log("Updating active order link to new subdomain...");
  try {
    const { data, error } = await supabase
      .from("orders")
      .update({ payment_link: "https://jn-calm.myr.id/invoices/g9nxqk710c" })
      .eq("order_number", "BM-20260716-69044")
      .select("order_number", "payment_link");

    if (error) {
      console.error("Database update returned error:", error);
    } else {
      console.log("Success! Updated order:", data);
    }
  } catch (err) {
    console.error("Database update failed:", err);
  }
}

main();
