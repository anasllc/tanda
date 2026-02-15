// supabase/functions/auth-sync/index.ts
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { verifyAuth } from "../_shared/auth.ts";
import { getSupabaseAdmin } from "../_shared/supabase.ts";
import { errorResponse, successResponse } from "../_shared/errors.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders() });
  }

  try {
    const auth = await verifyAuth(req);
    const supabase = getSupabaseAdmin();
    const body = await req.json();

    const { phone, wallet_address } = body;

    // Upsert user — creates on first login, updates wallet on subsequent
    const { data: user, error } = await supabase
      .from("users")
      .upsert(
        {
          privy_did: auth.privyDid,
          phone,
          phone_country_code: phone.match(/^\+(\d{1,3})/)?.[0] || "+234",
          wallet_address,
          last_active_at: new Date().toISOString(),
        },
        { onConflict: "privy_did" },
      )
      .select(
        "id, phone, username, wallet_address, kyc_level, display_currency, created_at",
      )
      .single();

    if (error) throw error;

    // Check for any pending escrow payments for this phone number
    const { data: pendingEscrows } = await supabase
      .from("escrow_payments")
      .select("id, amount_usdc, sender_id")
      .eq("recipient_phone", phone)
      .eq("status", "pending");

    return successResponse({
      user,
      pending_claims: pendingEscrows?.length || 0,
      needs_username: !user.username,
      needs_pin: false,
    });
  } catch (error) {
    return errorResponse(error);
  }
});

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
      "authorization, content-type, x-idempotency-key",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
}
