// supabase/functions/_shared/supabase.ts
import {
  createClient,
  SupabaseClient,
} from "https://esm.sh/@supabase/supabase-js@2";

let client: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (client) return client;
  client = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    {
      auth: { persistSession: false, autoRefreshToken: false },
    },
  );
  return client;
}

/**
 * Looks up the internal user UUID from a Privy DID.
 * Throws if user not found.
 */
export async function getUserByPrivyDid(
  supabase: SupabaseClient,
  privyDid: string,
): Promise<{
  id: string;
  phone: string;
  username: string | null;
  wallet_address: string | null;
  kyc_level: string;
  status: string;
}> {
  const { data, error } = await supabase
    .from("users")
    .select("id, phone, username, wallet_address, kyc_level, status")
    .eq("privy_did", privyDid)
    .single();

  if (error || !data) {
    throw new Error("User not found. Complete onboarding first.");
  }
  if (data.status !== "active") {
    throw new Error("Account is suspended or deactivated.");
  }
  return data;
}
