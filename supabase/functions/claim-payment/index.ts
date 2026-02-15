// supabase/functions/claim-payment/index.ts
// verify_jwt = false in config.toml (claimants may not be logged in yet)
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { getSupabaseAdmin } from "../_shared/supabase.ts";
import { errorResponse, successResponse, AppError } from "../_shared/errors.ts";
import { verifyAuth } from "../_shared/auth.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders() });
  }

  try {
    const supabase = getSupabaseAdmin();
    const body = await req.json();

    const { claim_token } = body;
    if (!claim_token) throw new AppError("claim_token is required", 422);

    // Look up escrow
    const { data: escrow, error: escrowError } = await supabase
      .from("escrow_payments")
      .select("*, sender:users!sender_id(username, phone)")
      .eq("claim_token", claim_token)
      .single();

    if (escrowError || !escrow) throw new AppError("Invalid or expired claim link", 404, "ESCROW_NOT_FOUND");
    if (escrow.status !== "pending") throw new AppError(`Payment already ${escrow.status}`, 400, "ALREADY_CLAIMED");
    if (new Date(escrow.expires_at) < new Date()) {
      throw new AppError("This payment has expired", 410, "ESCROW_EXPIRED");
    }

    // Try to authenticate the claimer (optional — they may be claiming during onboarding)
    let claimerId: string | null = null;
    try {
      const auth = await verifyAuth(req);
      const { data: claimer } = await supabase
        .from("users")
        .select("id, phone")
        .eq("privy_did", auth.privyDid)
        .single();

      if (claimer) {
        claimerId = claimer.id;
        // Verify phone matches
        if (claimer.phone !== escrow.recipient_phone) {
          throw new AppError("This payment was sent to a different phone number", 403, "PHONE_MISMATCH");
        }
      }
    } catch (e) {
      // If auth fails and it's not a phone mismatch, allow claim without auth
      if (e instanceof AppError && e.code === "PHONE_MISMATCH") throw e;
    }

    if (!claimerId) {
      // Look up user by recipient phone
      const { data: recipient } = await supabase
        .from("users")
        .select("id")
        .eq("phone", escrow.recipient_phone)
        .single();

      if (!recipient) {
        throw new AppError("Please register with the phone number this payment was sent to", 403, "NOT_REGISTERED");
      }
      claimerId = recipient.id;
    }

    // Update escrow status
    const { error: updateError } = await supabase
      .from("escrow_payments")
      .update({
        status: "claimed",
        recipient_id: claimerId,
        claimed_at: new Date().toISOString(),
      })
      .eq("id", escrow.id)
      .eq("status", "pending"); // Optimistic concurrency

    if (updateError) throw updateError;

    // Create credit transaction for recipient
    const { data: creditTx } = await supabase
      .from("transactions")
      .insert({
        sender_id: escrow.sender_id,
        recipient_id: claimerId,
        tx_type: "escrow_claim",
        status: "completed",
        amount_usdc: escrow.amount_usdc,
        fee_usdc: 0,
        completed_at: new Date().toISOString(),
        related_entity_type: "escrow",
        related_entity_id: escrow.id,
        metadata: { claim_token: escrow.claim_token },
      })
      .select()
      .single();

    // Update original escrow_send transaction to completed
    if (escrow.transaction_id) {
      await supabase
        .from("transactions")
        .update({ status: "completed", completed_at: new Date().toISOString() })
        .eq("id", escrow.transaction_id);
    }

    // Notify sender
    await supabase.from("notifications").insert({
      user_id: escrow.sender_id,
      type: "escrow_claimed",
      title: "Payment Claimed!",
      body: `Your payment of $${(escrow.amount_usdc / 1_000_000).toFixed(2)} to ${escrow.recipient_phone} has been claimed`,
      data: { escrow_id: escrow.id, transaction_id: creditTx?.id },
    });

    return successResponse({
      claimed: true,
      amount_usdc: escrow.amount_usdc,
      transaction_id: creditTx?.id,
    });
  } catch (error) {
    return errorResponse(error);
  }
});

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
}
