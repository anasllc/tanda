// supabase/functions/buy-data/index.ts
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

    const errors = validate(body, [
      { field: "phone", type: "string", required: true },
      { field: "amount_local", type: "number", required: true, min: 10000 },
      { field: "provider", type: "string", required: true, enum: ["MTN", "GLO", "AIRTEL", "9MOBILE"] },
      { field: "plan_id", type: "string", required: true },
      { field: "pin", type: "string", required: true, minLength: 4, maxLength: 6 },
    ]);
    if (errors.length) throw new AppError(errors.join("; "), 422, "VALIDATION_ERROR");

    const phone = normalizePhone(body.phone);
    if (!isValidE164(phone)) throw new AppError("Invalid phone number", 422);

    // Verify PIN
    const { data: pinData } = await supabase
      .from("users")
      .select("pin_hash")
      .eq("id", user.id)
      .single();
    if (!pinData?.pin_hash) throw new AppError("Set up your transaction PIN first", 403, "PIN_NOT_SET");

    // Get exchange rate
    const { data: rate } = await supabase
      .from("exchange_rates")
      .select("rate")
      .eq("base_currency", "USDC")
      .eq("quote_currency", "NGN")
      .order("fetched_at", { ascending: false })
      .limit(1)
      .single();

    const exchangeRate = rate?.rate || 1500;
    const amountUsdc = Math.ceil((body.amount_local / 100) / exchangeRate * 1_000_000);
    const fee = calculateFee(amountUsdc, "bill_payment");
    const totalDebit = amountUsdc + fee;

    // Check balance
    const { data: balance } = await supabase
      .from("user_balances")
      .select("available_balance_usdc")
      .eq("user_id", user.id)
      .single();
    if (!balance || balance.available_balance_usdc < totalDebit) {
      throw new AppError("Insufficient balance", 400, "INSUFFICIENT_BALANCE");
    }

    // Create bill payment
    const { data: billPayment, error: billError } = await supabase
      .from("bill_payments")
      .insert({
        user_id: user.id,
        bill_type: "data",
        provider: body.provider,
        recipient_identifier: phone,
        amount_usdc: amountUsdc,
        amount_local: body.amount_local,
        local_currency: "NGN",
        status: "processing",
        metadata: { network: body.provider, plan_id: body.plan_id, plan_name: body.plan_name },
      })
      .select()
      .single();

    if (billError) throw billError;

    // Create transaction
    const { data: tx, error: txError } = await supabase
      .from("transactions")
      .insert({
        idempotency_key: idempotencyKey,
        sender_id: user.id,
        tx_type: "data",
        status: "completed",
        amount_usdc: amountUsdc,
        amount_local: body.amount_local,
        local_currency: "NGN",
        exchange_rate_at_time: exchangeRate,
        fee_usdc: fee,
        memo: `${body.provider} data for ${phone}`,
        completed_at: new Date().toISOString(),
        related_entity_type: "bill_payment",
        related_entity_id: billPayment.id,
      })
      .select()
      .single();

    if (txError) throw txError;

    await supabase
      .from("bill_payments")
      .update({ transaction_id: tx.id, status: "completed" })
      .eq("id", billPayment.id);

    // Save for quick reorder
    await supabase
      .from("saved_bill_recipients")
      .upsert({
        user_id: user.id,
        bill_type: "data",
        provider: body.provider,
        recipient_identifier: phone,
        label: body.label || `${body.provider} ${phone}`,
        last_used_at: new Date().toISOString(),
      }, { onConflict: "user_id,bill_type,provider,recipient_identifier" });

    // TODO: Call actual data provider API

    const response = {
      bill_payment: billPayment,
      transaction: tx,
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
