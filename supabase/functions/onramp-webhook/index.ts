// supabase/functions/onramp-webhook/index.ts
// Called by Due Network when a deposit (on-ramp) transfer status changes.
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

    // Verify webhook signature
    if (!verifyDueWebhook(rawBody, signature)) {
      return new Response("Invalid signature", { status: 401 });
    }

    const payload = JSON.parse(rawBody);
    const supabase = getSupabaseAdmin();

    const { id: dueTransferId, status: dueStatus } = payload;

    if (dueStatus === "completed" || dueStatus === "settled") {
      // Find the pending transaction by Due transfer ID stored in metadata
      const { data: tx } = await supabase
        .from("transactions")
        .select("id, recipient_id, metadata")
        .eq("metadata->>due_transfer_id", dueTransferId)
        .eq("status", "pending")
        .single();

      if (tx) {
        const destinationAmount = payload.destination?.amount;
        const amountUsdc = destinationAmount
          ? Math.round(parseFloat(destinationAmount) * 1_000_000)
          : tx.metadata?.quoted_amount_usdc;

        // Update transaction to completed
        await supabase
          .from("transactions")
          .update({
            status: "completed",
            amount_usdc: amountUsdc,
            completed_at: new Date().toISOString(),
            metadata: { ...tx.metadata, due_payload: payload },
          })
          .eq("id", tx.id);

        // Notify user
        await supabase.from("notifications").insert({
          user_id: tx.recipient_id,
          type: "deposit_completed",
          title: "Deposit Confirmed!",
          body: `Your deposit of $${(amountUsdc / 1_000_000).toFixed(2)} USDC has been credited`,
          data: { transaction_id: tx.id, amount_usdc: amountUsdc },
        });
      }
    } else if (dueStatus === "failed" || dueStatus === "rejected") {
      await supabase
        .from("transactions")
        .update({
          status: "failed",
          error_message: payload.failureReason || "Transfer failed",
          metadata: { due_payload: payload },
        })
        .eq("metadata->>due_transfer_id", dueTransferId)
        .eq("status", "pending");
    }

    return successResponse({ received: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return errorResponse(error);
  }
});
