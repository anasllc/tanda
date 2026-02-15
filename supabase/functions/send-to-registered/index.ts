// supabase/functions/send-to-registered/index.ts
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { verifyAuth } from "../_shared/auth.ts";
import { getSupabaseAdmin, getUserByPrivyDid } from "../_shared/supabase.ts";
import { errorResponse, successResponse, AppError } from "../_shared/errors.ts";
import { validate, normalizePhone, isValidE164 } from "../_shared/validation.ts";
import { calculateFee } from "../_shared/fees.ts";
import { checkIdempotency, saveIdempotencyResult } from "../_shared/idempotency.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders() });
  }

  try {
    const auth = await verifyAuth(req);
    const supabase = getSupabaseAdmin();
    const sender = await getUserByPrivyDid(supabase, auth.privyDid);
    const idempotencyKey = req.headers.get("x-idempotency-key");

    // Check idempotency
    const { isDuplicate, cachedResponse } = await checkIdempotency(supabase, idempotencyKey, sender.id);
    if (isDuplicate && cachedResponse) {
      return new Response(JSON.stringify(cachedResponse.body), {
        status: cachedResponse.status,
        headers: { "Content-Type": "application/json" },
      });
    }

    const body = await req.json();

    // Validate input
    const errors = validate(body, [
      { field: "recipient", type: "string", required: true },
      { field: "amount_usdc", type: "number", required: true, min: 10000 },
      { field: "memo", type: "string", maxLength: 100 },
      { field: "pin", type: "string", required: true, minLength: 4, maxLength: 6 },
    ]);
    if (errors.length) throw new AppError(errors.join("; "), 422, "VALIDATION_ERROR");

    // Verify PIN
    const { data: pinData } = await supabase
      .from("users")
      .select("pin_hash")
      .eq("id", sender.id)
      .single();

    if (!pinData?.pin_hash) throw new AppError("Set up your transaction PIN first", 403, "PIN_NOT_SET");

    // Resolve recipient
    let recipientQuery;
    if (body.recipient.startsWith("@")) {
      recipientQuery = supabase
        .from("users")
        .select("id, phone, username, full_name, wallet_address")
        .eq("username", body.recipient.slice(1).toLowerCase())
        .single();
    } else {
      const phone = normalizePhone(body.recipient);
      if (!isValidE164(phone)) throw new AppError("Invalid phone number", 422);
      recipientQuery = supabase
        .from("users")
        .select("id, phone, username, full_name, wallet_address")
        .eq("phone", phone)
        .single();
    }

    const { data: recipient } = await recipientQuery;
    if (!recipient) throw new AppError("Recipient not found. Use 'send to unregistered' for new users.", 404, "RECIPIENT_NOT_FOUND");
    if (recipient.id === sender.id) throw new AppError("Cannot send to yourself", 400);

    // Calculate fee
    const fee = calculateFee(body.amount_usdc, "send");
    const totalDebit = body.amount_usdc + fee;

    // Check balance
    const { data: balance } = await supabase
      .from("user_balances")
      .select("available_balance_usdc")
      .eq("user_id", sender.id)
      .single();
    if (!balance || balance.available_balance_usdc < totalDebit) {
      throw new AppError("Insufficient balance", 400, "INSUFFICIENT_BALANCE");
    }

    // Create transaction
    const { data: tx, error: txError } = await supabase
      .from("transactions")
      .insert({
        idempotency_key: idempotencyKey,
        sender_id: sender.id,
        recipient_id: recipient.id,
        tx_type: "send",
        status: "completed",
        amount_usdc: body.amount_usdc,
        fee_usdc: fee,
        memo: body.memo,
        completed_at: new Date().toISOString(),
        metadata: {
          sender_phone: sender.phone,
          recipient_phone: recipient.phone,
        },
      })
      .select()
      .single();

    if (txError) throw txError;

    // Create notification for recipient
    await supabase.from("notifications").insert({
      user_id: recipient.id,
      type: "payment_received",
      title: "Money Received!",
      body: `${sender.username ? "@" + sender.username : sender.phone} sent you $${(body.amount_usdc / 1_000_000).toFixed(2)}`,
      data: { transaction_id: tx.id, sender_id: sender.id, amount_usdc: body.amount_usdc },
    });

    const response = {
      transaction: tx,
      fee_usdc: fee,
      new_balance_usdc: balance.available_balance_usdc - totalDebit,
    };

    if (idempotencyKey) {
      await saveIdempotencyResult(supabase, idempotencyKey, sender.id, 200, response);
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
