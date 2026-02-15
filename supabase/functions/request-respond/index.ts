// supabase/functions/request-respond/index.ts
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
    const { request_id, action, pin } = body;

    if (!request_id) throw new AppError("request_id is required", 422);
    if (!action || !["pay", "decline"].includes(action)) {
      throw new AppError("action must be 'pay' or 'decline'", 422);
    }

    // Get payment request
    const { data: request, error } = await supabase
      .from("payment_requests")
      .select("*")
      .eq("id", request_id)
      .single();

    if (error || !request) throw new AppError("Payment request not found", 404);
    if (request.status !== "pending") throw new AppError(`Request is already ${request.status}`, 400);
    if (request.recipient_id !== user.id) throw new AppError("This request is not addressed to you", 403);

    if (action === "decline") {
      await supabase
        .from("payment_requests")
        .update({ status: "declined" })
        .eq("id", request_id);

      // Notify requester
      await supabase.from("notifications").insert({
        user_id: request.requester_id,
        type: "request_declined",
        title: "Request Declined",
        body: `Your payment request for $${(request.amount_usdc / 1_000_000).toFixed(2)} was declined`,
        data: { request_id },
      });

      return successResponse({ status: "declined" });
    }

    // action === "pay"
    if (!pin) throw new AppError("PIN is required for payment", 422);

    // Verify PIN
    const { data: pinData } = await supabase
      .from("users")
      .select("pin_hash")
      .eq("id", user.id)
      .single();
    if (!pinData?.pin_hash) throw new AppError("Set up your transaction PIN first", 403, "PIN_NOT_SET");

    // Calculate fee and check balance
    const fee = calculateFee(request.amount_usdc, "send");
    const totalDebit = request.amount_usdc + fee;

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
        recipient_id: request.requester_id,
        tx_type: "send",
        status: "completed",
        amount_usdc: request.amount_usdc,
        fee_usdc: fee,
        memo: `Payment for request: ${request.reason || ""}`.trim(),
        completed_at: new Date().toISOString(),
        related_entity_type: "payment_request",
        related_entity_id: request_id,
      })
      .select()
      .single();

    if (txError) throw txError;

    // Update request status
    await supabase
      .from("payment_requests")
      .update({ status: "paid", transaction_id: tx.id })
      .eq("id", request_id);

    // Notify requester
    await supabase.from("notifications").insert({
      user_id: request.requester_id,
      type: "request_paid",
      title: "Request Paid!",
      body: `Your request for $${(request.amount_usdc / 1_000_000).toFixed(2)} has been paid`,
      data: { request_id, transaction_id: tx.id },
    });

    const response = { status: "paid", transaction: tx, fee_usdc: fee };

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
