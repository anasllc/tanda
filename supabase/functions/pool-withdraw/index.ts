// supabase/functions/pool-withdraw/index.ts
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { verifyAuth } from "../_shared/auth.ts";
import { getSupabaseAdmin, getUserByPrivyDid } from "../_shared/supabase.ts";
import { errorResponse, successResponse, AppError } from "../_shared/errors.ts";
import { checkIdempotency, saveIdempotencyResult } from "../_shared/idempotency.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders() });
  }

  try {
    const auth = await verifyAuth(req);
    const supabase = getSupabaseAdmin();
    const user = await getUserByPrivyDid(supabase, auth.privyDid);
    const idempotencyKey = req.headers.get("x-idempotency-key");

    const { isDuplicate, cachedResponse } = await checkIdempotency(supabase, idempotencyKey, user.id);
    if (isDuplicate && cachedResponse) {
      return new Response(JSON.stringify(cachedResponse.body), {
        status: cachedResponse.status,
        headers: { "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { pool_id, amount_usdc, pin } = body;

    if (!pool_id) throw new AppError("pool_id is required", 422);
    if (!pin) throw new AppError("PIN is required", 422);

    // Verify PIN
    const { data: pinData } = await supabase
      .from("users")
      .select("pin_hash")
      .eq("id", user.id)
      .single();
    if (!pinData?.pin_hash) throw new AppError("Set up your transaction PIN first", 403, "PIN_NOT_SET");

    // Get pool — only organizer can withdraw
    const { data: pool } = await supabase
      .from("pools")
      .select("*")
      .eq("id", pool_id)
      .eq("organizer_id", user.id)
      .single();

    if (!pool) throw new AppError("Pool not found or you are not the organizer", 404);
    if (pool.status === "cancelled") throw new AppError("Pool is cancelled", 400);

    const withdrawAmount = amount_usdc || pool.collected_amount_usdc;
    if (withdrawAmount <= 0) throw new AppError("No funds to withdraw", 400);
    if (withdrawAmount > pool.collected_amount_usdc) {
      throw new AppError("Withdrawal exceeds collected amount", 400);
    }

    // Create withdrawal transaction
    const { data: tx, error: txError } = await supabase
      .from("transactions")
      .insert({
        idempotency_key: idempotencyKey,
        sender_id: null,
        recipient_id: user.id,
        tx_type: "pool_withdraw",
        status: "completed",
        amount_usdc: withdrawAmount,
        fee_usdc: 0,
        memo: `Pool withdrawal: ${pool.title}`,
        completed_at: new Date().toISOString(),
        related_entity_type: "pool",
        related_entity_id: pool_id,
      })
      .select()
      .single();

    if (txError) throw txError;

    // Update pool collected amount
    await supabase
      .from("pools")
      .update({
        collected_amount_usdc: pool.collected_amount_usdc - withdrawAmount,
        status: withdrawAmount >= pool.collected_amount_usdc ? "completed" : pool.status,
      })
      .eq("id", pool_id);

    const response = {
      withdrawn: true,
      amount_usdc: withdrawAmount,
      transaction_id: tx.id,
      remaining_usdc: pool.collected_amount_usdc - withdrawAmount,
    };

    if (idempotencyKey) {
      await saveIdempotencyResult(supabase, idempotencyKey, user.id, 200, response);
    }

    return successResponse(response);
  } catch (error) {
    return errorResponse(error);
  }
});

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, content-type, x-idempotency-key",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
}
