// supabase/functions/offramp-webhook/index.ts
// Called by Due Network when a withdrawal (off-ramp) transfer status changes.
// config.toml: verify_jwt = false
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { getSupabaseAdmin } from "../_shared/supabase.ts";
import { verifyDueWebhook } from "../_shared/due-client.ts";
import { errorResponse, successResponse } from "../_shared/errors.ts";

serve(async (req) => {
  try {
    const rawBody = await req.text();
    const signature =
      req.headers.get("x-due-signature") ||
      req.headers.get("x-webhook-signature") ||
      "";

    if (!verifyDueWebhook(rawBody, signature)) {
      return new Response("Invalid signature", { status: 401 });
    }

    const payload = JSON.parse(rawBody);
    const supabase = getSupabaseAdmin();

    const { id: dueTransferId, status: dueStatus } = payload;

    if (dueStatus === "completed" || dueStatus === "settled") {
      const { data: tx } = await supabase
        .from("transactions")
        .select("id, sender_id, metadata")
        .eq("metadata->>due_transfer_id", dueTransferId)
        .in("status", ["pending", "processing"])
        .single();

      if (tx) {
        await supabase
          .from("transactions")
          .update({
            status: "completed",
            completed_at: new Date().toISOString(),
            metadata: { ...tx.metadata, due_payload: payload },
          })
          .eq("id", tx.id);

        // Notify user
        const amountNgn = payload.destination?.amount || "0";
        await supabase.from("notifications").insert({
          user_id: tx.sender_id,
          type: "withdrawal_completed",
          title: "Withdrawal Complete!",
          body: `₦${parseFloat(amountNgn).toLocaleString()} has been sent to your bank account`,
          data: {
            transaction_id: tx.id,
            amount_ngn: amountNgn,
            bank_name: tx.metadata?.bank_name,
          },
        });
      }
    } else if (dueStatus === "failed" || dueStatus === "rejected") {
      const { data: tx } = await supabase
        .from("transactions")
        .select("id, sender_id, amount_usdc, fee_usdc, metadata")
        .eq("metadata->>due_transfer_id", dueTransferId)
        .in("status", ["pending", "processing"])
        .single();

      if (tx) {
        // Mark as failed
        await supabase
          .from("transactions")
          .update({
            status: "failed",
            error_message: payload.failureReason || "Withdrawal failed",
            metadata: { ...tx.metadata, due_payload: payload },
          })
          .eq("id", tx.id);

        // Create refund transaction to credit back the user
        await supabase.from("transactions").insert({
          sender_id: null,
          recipient_id: tx.sender_id,
          tx_type: "offramp",
          status: "completed",
          amount_usdc: tx.amount_usdc + tx.fee_usdc,
          fee_usdc: 0,
          memo: "Refund: withdrawal failed",
          completed_at: new Date().toISOString(),
          related_entity_type: "transaction",
          related_entity_id: tx.id,
        });

        await supabase.from("notifications").insert({
          user_id: tx.sender_id,
          type: "withdrawal_failed",
          title: "Withdrawal Failed",
          body: `Your withdrawal could not be completed. $${((tx.amount_usdc + tx.fee_usdc) / 1_000_000).toFixed(2)} has been refunded.`,
          data: { transaction_id: tx.id, reason: payload.failureReason },
        });
      }
    }

    return successResponse({ received: true });
  } catch (error) {
    console.error("Off-ramp webhook error:", error);
    return errorResponse(error);
  }
});
