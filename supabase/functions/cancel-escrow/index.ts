// supabase/functions/cancel-escrow/index.ts
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { verifyAuth } from "../_shared/auth.ts";
import { getSupabaseAdmin, getUserByPrivyDid } from "../_shared/supabase.ts";
import { errorResponse, successResponse, AppError } from "../_shared/errors.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders() });
  }

  try {
    const auth = await verifyAuth(req);
    const supabase = getSupabaseAdmin();
    const user = await getUserByPrivyDid(supabase, auth.privyDid);
    const body = await req.json();

    const { escrow_id } = body;
    if (!escrow_id) throw new AppError("escrow_id is required", 422);

    // Get escrow
    const { data: escrow, error } = await supabase
      .from("escrow_payments")
      .select("*")
      .eq("id", escrow_id)
      .eq("sender_id", user.id)
      .single();

    if (error || !escrow) throw new AppError("Escrow not found", 404);
    if (escrow.status !== "pending") throw new AppError(`Cannot cancel: escrow is ${escrow.status}`, 400);
    if (new Date(escrow.cancellable_until) < new Date()) {
      throw new AppError("Cancellation window has passed (1 hour)", 400, "CANCEL_WINDOW_EXPIRED");
    }

    // Cancel escrow
    await supabase
      .from("escrow_payments")
      .update({ status: "cancelled" })
      .eq("id", escrow.id);

    // Create refund transaction
    const { data: refundTx } = await supabase
      .from("transactions")
      .insert({
        sender_id: null,
        recipient_id: user.id,
        tx_type: "escrow_refund",
        status: "completed",
        amount_usdc: escrow.amount_usdc,
        fee_usdc: 0,
        completed_at: new Date().toISOString(),
        related_entity_type: "escrow",
        related_entity_id: escrow.id,
        memo: "Escrow cancelled by sender",
      })
      .select()
      .single();

    // Update original transaction
    if (escrow.transaction_id) {
      await supabase
        .from("transactions")
        .update({ status: "cancelled" })
        .eq("id", escrow.transaction_id);
    }

    // Update escrow with refund tx
    await supabase
      .from("escrow_payments")
      .update({ refund_transaction_id: refundTx?.id, refunded_at: new Date().toISOString() })
      .eq("id", escrow.id);

    return successResponse({
      cancelled: true,
      refund_amount_usdc: escrow.amount_usdc,
      refund_transaction_id: refundTx?.id,
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
