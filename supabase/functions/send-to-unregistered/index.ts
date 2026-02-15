// supabase/functions/send-to-unregistered/index.ts
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { verifyAuth } from "../_shared/auth.ts";
import { getSupabaseAdmin, getUserByPrivyDid } from "../_shared/supabase.ts";
import { errorResponse, successResponse, AppError } from "../_shared/errors.ts";
import { validate, normalizePhone, isValidE164 } from "../_shared/validation.ts";
import { calculateFee } from "../_shared/fees.ts";
import { checkIdempotency, saveIdempotencyResult } from "../_shared/idempotency.ts";
import { sendSMS } from "../_shared/sms.ts";

const APP_URL = Deno.env.get("APP_URL") || "https://tanda.app";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders() });
  }

  try {
    const auth = await verifyAuth(req);
    const supabase = getSupabaseAdmin();
    const sender = await getUserByPrivyDid(supabase, auth.privyDid);
    const idempotencyKey = req.headers.get("x-idempotency-key");

    const { isDuplicate, cachedResponse } = await checkIdempotency(supabase, idempotencyKey, sender.id);
    if (isDuplicate && cachedResponse) {
      return new Response(JSON.stringify(cachedResponse.body), {
        status: cachedResponse.status,
        headers: { "Content-Type": "application/json" },
      });
    }

    const body = await req.json();

    const errors = validate(body, [
      { field: "phone", type: "string", required: true },
      { field: "amount_usdc", type: "number", required: true, min: 10000 },
      { field: "memo", type: "string", maxLength: 100 },
      { field: "pin", type: "string", required: true, minLength: 4, maxLength: 6 },
    ]);
    if (errors.length) throw new AppError(errors.join("; "), 422, "VALIDATION_ERROR");

    const phone = normalizePhone(body.phone);
    if (!isValidE164(phone)) throw new AppError("Invalid phone number", 422);

    // Check if recipient is actually registered
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("phone", phone)
      .single();

    if (existingUser) {
      throw new AppError("Recipient is registered. Use send-to-registered instead.", 400, "USER_EXISTS");
    }

    // Verify PIN
    const { data: pinData } = await supabase
      .from("users")
      .select("pin_hash")
      .eq("id", sender.id)
      .single();
    if (!pinData?.pin_hash) throw new AppError("Set up your transaction PIN first", 403, "PIN_NOT_SET");

    // Calculate fee (escrow includes SMS fee)
    const fee = calculateFee(body.amount_usdc, "escrow");
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

    const now = new Date();
    const claimToken = crypto.randomUUID();

    // Create escrow transaction
    const { data: tx, error: txError } = await supabase
      .from("transactions")
      .insert({
        idempotency_key: idempotencyKey,
        sender_id: sender.id,
        tx_type: "escrow_send",
        status: "pending",
        amount_usdc: body.amount_usdc,
        fee_usdc: fee,
        memo: body.memo,
        metadata: { recipient_phone: phone },
      })
      .select()
      .single();

    if (txError) throw txError;

    // Create escrow payment record
    const { data: escrow, error: escrowError } = await supabase
      .from("escrow_payments")
      .insert({
        sender_id: sender.id,
        recipient_phone: phone,
        amount_usdc: body.amount_usdc,
        fee_usdc: fee,
        claim_token: claimToken,
        expires_at: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        cancellable_until: new Date(now.getTime() + 60 * 60 * 1000).toISOString(),
        transaction_id: tx.id,
      })
      .select()
      .single();

    if (escrowError) throw escrowError;

    // Update transaction with related entity
    await supabase
      .from("transactions")
      .update({ related_entity_type: "escrow", related_entity_id: escrow.id })
      .eq("id", tx.id);

    // Send SMS to recipient
    const claimUrl = `${APP_URL}/claim/${claimToken}`;
    const senderName = sender.username ? `@${sender.username}` : "Someone";
    const amount = (body.amount_usdc / 1_000_000).toFixed(2);
    const smsMessage = `${senderName} sent you $${amount} USDC on Tanda! Claim it here: ${claimUrl}`;

    const smsResult = await sendSMS(phone, smsMessage);

    // Update escrow with SMS status
    await supabase
      .from("escrow_payments")
      .update({
        sms_sent_at: new Date().toISOString(),
        sms_delivery_status: smsResult.success ? "sent" : "failed",
      })
      .eq("id", escrow.id);

    const response = {
      escrow: {
        id: escrow.id,
        amount_usdc: body.amount_usdc,
        fee_usdc: fee,
        recipient_phone: phone,
        expires_at: escrow.expires_at,
        cancellable_until: escrow.cancellable_until,
        status: "pending",
      },
      transaction_id: tx.id,
      sms_sent: smsResult.success,
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
