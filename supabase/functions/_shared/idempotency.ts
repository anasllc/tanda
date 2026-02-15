// supabase/functions/_shared/idempotency.ts
import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

export async function checkIdempotency(
  supabase: SupabaseClient,
  key: string | null,
  userId: string,
): Promise<{
  isDuplicate: boolean;
  cachedResponse?: { status: number; body: unknown };
}> {
  if (!key) return { isDuplicate: false };

  const { data } = await supabase
    .from("idempotency_keys")
    .select("response_status, response_body")
    .eq("key", key)
    .eq("user_id", userId)
    .gt("expires_at", new Date().toISOString())
    .single();

  if (data) {
    return {
      isDuplicate: true,
      cachedResponse: {
        status: data.response_status,
        body: data.response_body,
      },
    };
  }

  return { isDuplicate: false };
}

export async function saveIdempotencyResult(
  supabase: SupabaseClient,
  key: string,
  userId: string,
  status: number,
  body: unknown,
): Promise<void> {
  await supabase.from("idempotency_keys").upsert({
    key,
    user_id: userId,
    response_status: status,
    response_body: body,
    expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  });
}
