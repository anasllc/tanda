// supabase/functions/escrow-expiry-cron/index.ts
// CRON function — verify_jwt = false in config.toml
// Runs periodically to auto-refund expired escrow payments (7 days)
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { getSupabaseAdmin } from "../_shared/supabase.ts";
import { successResponse, errorResponse } from "../_shared/errors.ts";

serve(async (_req) => {
  try {
    const supabase = getSupabaseAdmin();

    // Find all expired pending escrows
    const { data: expiredEscrows, error } = await supabase
      .from("escrow_payments")
      .select("id, sender_id, amount_usdc, transaction_id, recipient_phone")
      .eq("status", "pending")
      .lt("expires_at", new Date().toISOString());

    if (error) throw error;
    if (!expiredEscrows || expiredEscrows.length === 0) {
      return successResponse({ processed: 0 });
    }

    let processed = 0;

    for (const escrow of expiredEscrows) {
      try {
        // Mark escrow as expired
        await supabase
          .from("escrow_payments")
          .update({ status: "expired" })
          .eq("id", escrow.id)
          .eq("status", "pending"); // Optimistic concurrency

        // Create refund transaction
        const { data: refundTx } = await supabase
          .from("transactions")
          .insert({
            sender_id: null,
            recipient_id: escrow.sender_id,
            tx_type: "escrow_refund",
            status: "completed",
            amount_usdc: escrow.amount_usdc,
            fee_usdc: 0,
            completed_at: new Date().toISOString(),
            related_entity_type: "escrow",
            related_entity_id: escrow.id,
            memo: "Auto-refund: escrow expired after 7 days",
          })
          .select("id")
          .single();

        // Update escrow with refund info
        await supabase
          .from("escrow_payments")
          .update({
            refund_transaction_id: refundTx?.id,
            refunded_at: new Date().toISOString(),
          })
          .eq("id", escrow.id);

        // Cancel original send transaction
        if (escrow.transaction_id) {
          await supabase
            .from("transactions")
            .update({ status: "expired" })
            .eq("id", escrow.transaction_id);
        }

        // Notify sender
        await supabase.from("notifications").insert({
          user_id: escrow.sender_id,
          type: "escrow_expired",
          title: "Payment Expired & Refunded",
          body: `Your payment to ${escrow.recipient_phone} expired and $${(escrow.amount_usdc / 1_000_000).toFixed(2)} has been refunded`,
          data: { escrow_id: escrow.id, refund_transaction_id: refundTx?.id },
        });

        processed++;
      } catch (e) {
        console.error(`Failed to process escrow ${escrow.id}:`, e);
      }
    }

    return successResponse({ processed, total_expired: expiredEscrows.length });
  } catch (error) {
    return errorResponse(error);
  }
});
