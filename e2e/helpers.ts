import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { createClient } from "@supabase/supabase-js";

type EnvMap = Record<string, string>;

function parseEnvFile(path: string): EnvMap {
  try {
    return readFileSync(path, "utf8")
      .split(/\r?\n/)
      .reduce<EnvMap>((values, line) => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) return values;

        const separatorIndex = trimmed.indexOf("=");
        if (separatorIndex === -1) return values;

        const key = trimmed.slice(0, separatorIndex).trim();
        const rawValue = trimmed.slice(separatorIndex + 1).trim();
        values[key] = rawValue.replace(/^['"]|['"]$/g, "");
        return values;
      }, {});
  } catch {
    return {};
  }
}

export function loadTestEnv() {
  const fileEnv = parseEnvFile(resolve(process.cwd(), ".env.local"));

  return {
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? fileEnv.NEXT_PUBLIC_SUPABASE_URL,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? fileEnv.SUPABASE_SERVICE_ROLE_KEY,
  };
}

export async function getActiveTableQrToken() {
  const { supabaseUrl, serviceRoleKey } = loadTestEnv();

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("E2E needs NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const { data, error } = await supabase
    .from("dining_tables")
    .select("qr_token")
    .eq("is_active", true)
    .order("code", { ascending: true })
    .limit(1)
    .single();

  if (error || !data?.qr_token) {
    throw new Error("E2E needs at least one active dining table.");
  }

  return data.qr_token as string;
}
