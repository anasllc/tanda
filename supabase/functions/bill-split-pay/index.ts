// supabase/functions/bill-split-pay/index.ts
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
    const { split_id, pin } = body;

    if (!split_id) throw new AppError("split_id is required", 422);
    if (!pin) throw new AppError("PIN is required", 422);

    // Verify PIN
    const { data: pinData } = await supabase
      .from("users")
      .select("pin_hash")
      .eq("id", user.id)
      .single();
    if (!pinData?.pin_hash) throw new AppError("Set up your transaction PIN first", 403, "PIN_NOT_SET");

    // Get participant record
    const { data: participant } = await supabase
      .from("bill_split_participants")
      .select("*, split:bill_splits(*)")
      .eq("split_id", split_id)
      .eq("user_id", user.id)
      .single();

    if (!participant) throw new AppError("You are not a participant in this split", 404);
    if (participant.status === "paid") throw new AppError("You already paid your share", 400);

    const split = participant.split;
    if (split.is_complete) throw new AppError("This split is already complete", 400);

    // Calculate fee and check balance
    const fee = calculateFee(participant.amount_usdc, "send");
    const totalDebit = participant.amount_usdc + fee;

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
        recipient_id: split.organizer_id,
        tx_type: "bill_split_pay",
        status: "completed",
        amount_usdc: participant.amount_usdc,
        fee_usdc: fee,
        memo: `Split: ${split.title}`,
        completed_at: new Date().toISOString(),
        related_entity_type: "split",
        related_entity_id: split_id,
      })
      .select()
      .single();

    if (txError) throw txError;

    // Update participant status
    await supabase
      .from("bill_split_participants")
      .update({
        status: "paid",
        paid_at: new Date().toISOString(),
        transaction_id: tx.id,
      })
      .eq("id", participant.id);

    // Notify organizer
    await supabase.from("notifications").insert({
      user_id: split.organizer_id,
      type: "split_paid",
      title: "Split Payment Received",
      body: `${user.username ? "@" + user.username : user.phone} paid their share of "${split.title}"`,
      data: { split_id, transaction_id: tx.id },
    });

    const response = { paid: true, transaction: tx, fee_usdc: fee };

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
