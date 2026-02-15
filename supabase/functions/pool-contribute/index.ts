// supabase/functions/pool-contribute/index.ts
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { verifyAuth } from "../_shared/auth.ts";
import { getSupabaseAdmin, getUserByPrivyDid } from "../_shared/supabase.ts";
import { errorResponse, successResponse, AppError } from "../_shared/errors.ts";
import { calculateFee } from "../_shared/fees.ts";
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
    const { pool_id, amount_usdc, pin, is_anonymous, message } = body;

    if (!pool_id) throw new AppError("pool_id is required", 422);
    if (!amount_usdc || amount_usdc < 10000) throw new AppError("amount_usdc must be at least 10000", 422);
    if (!pin) throw new AppError("PIN is required", 422);

    // Verify PIN
    const { data: pinData } = await supabase
      .from("users")
      .select("pin_hash")
      .eq("id", user.id)
      .single();
    if (!pinData?.pin_hash) throw new AppError("Set up your transaction PIN first", 403, "PIN_NOT_SET");

    // Get pool
    const { data: pool } = await supabase
      .from("pools")
      .select("*")
      .eq("id", pool_id)
      .single();

    if (!pool) throw new AppError("Pool not found", 404);
    if (pool.status !== "active") throw new AppError(`Pool is ${pool.status}`, 400);
    if (pool.deadline && new Date(pool.deadline) < new Date()) {
      throw new AppError("Pool deadline has passed", 400);
    }

    // Check membership for closed pools
    if (pool.pool_type === "closed") {
      const { data: member } = await supabase
        .from("pool_members")
        .select("id")
        .eq("pool_id", pool_id)
        .eq("user_id", user.id)
        .single();

      if (!member) throw new AppError("You are not a member of this pool", 403);
    } else {
      // Auto-add as member for open pools
      const { data: existingMember } = await supabase
        .from("pool_members")
        .select("id")
        .eq("pool_id", pool_id)
        .eq("user_id", user.id)
        .single();

      if (!existingMember) {
        await supabase.from("pool_members").insert({
          pool_id, user_id: user.id, role: "member",
        });
      }
    }

    // Check balance
    const fee = calculateFee(amount_usdc, "send");
    const totalDebit = amount_usdc + fee;

    const { data: balance } = await supabase
      .from("user_balances")
      .select("available_balance_usdc")
      .eq("user_id", user.id)
      .single();
    if (!balance || balance.available_balance_usdc < totalDebit) {
      throw new AppError("Insufficient balance", 400, "INSUFFICIENT_BALANCE");
    }

    // Create transaction
    const { data: tx, error: txError } = await supabase
      .from("transactions")
      .insert({
        idempotency_key: idempotencyKey,
        sender_id: user.id,
        recipient_id: pool.organizer_id,
        tx_type: "pool_contribute",
        status: "completed",
        amount_usdc,
        fee_usdc: fee,
        memo: `Pool: ${pool.title}`,
        completed_at: new Date().toISOString(),
        related_entity_type: "pool",
        related_entity_id: pool_id,
      })
      .select()
      .single();

    if (txError) throw txError;

    // Create contribution record (triggers update_pool_collected)
    await supabase.from("pool_contributions").insert({
      pool_id,
      contributor_id: user.id,
      amount_usdc,
      is_anonymous: is_anonymous || false,
      message: message || null,
      transaction_id: tx.id,
    });

    // Check if target reached
    const newCollected = pool.collected_amount_usdc + amount_usdc;
    if (pool.target_amount_usdc && newCollected >= pool.target_amount_usdc) {
      await supabase
        .from("pools")
        .update({ status: "completed" })
        .eq("id", pool_id);

      await supabase.from("notifications").insert({
        user_id: pool.organizer_id,
        type: "pool_target_reached",
        title: "Pool Target Reached!",
        body: `"${pool.title}" has reached its target of $${(pool.target_amount_usdc / 1_000_000).toFixed(2)}`,
        data: { pool_id },
      });
    }

    // Notify organizer
    if (pool.organizer_id !== user.id) {
      const displayName = is_anonymous ? "Anonymous" : (user.username ? `@${user.username}` : user.phone);
      await supabase.from("notifications").insert({
        user_id: pool.organizer_id,
        type: "pool_contribution",
        title: "New Pool Contribution",
        body: `${displayName} contributed $${(amount_usdc / 1_000_000).toFixed(2)} to "${pool.title}"`,
        data: { pool_id, transaction_id: tx.id },
      });
    }

    const response = {
      contribution: { pool_id, amount_usdc, transaction_id: tx.id },
      pool_collected_usdc: newCollected,
      fee_usdc: fee,
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
