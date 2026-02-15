// supabase/functions/transaction-detail/index.ts
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { verifyAuth } from "../_shared/auth.ts";
import { getSupabaseAdmin, getUserByPrivyDid } from "../_shared/supabase.ts";
import { errorResponse, successResponse, AppError } from "../_shared/errors.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders() });
  }

  try {
    if (req.method !== "GET") {
      throw new AppError("Method not allowed", 405, "METHOD_NOT_ALLOWED");
    }

    // Auth + user lookup
    const auth = await verifyAuth(req);
    const supabase = getSupabaseAdmin();
    const user = await getUserByPrivyDid(supabase, auth.privyDid);

    // Parse query params
    const url = new URL(req.url);
    const txId = url.searchParams.get("id");

    if (!txId) {
      throw new AppError(
        "Transaction ID is required (?id=xxx)",
        400,
        "VALIDATION_ERROR",
      );
    }

    // Validate UUID format
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(txId)) {
      throw new AppError(
        "Invalid transaction ID format",
        400,
        "VALIDATION_ERROR",
      );
    }

    // Fetch the transaction with sender/recipient info
    const { data: transaction, error } = await supabase
      .from("transactions")
      .select(
        `
        id,
        idempotency_key,
        sender_id,
        recipient_id,
        tx_type,
        status,
        amount_usdc,
        amount_local,
        local_currency,
        exchange_rate_at_time,
        fee_usdc,
        fee_local,
        memo,
        blockchain_tx_hash,
        blockchain_status,
        metadata,
        related_entity_type,
        related_entity_id,
        error_message,
        created_at,
        completed_at,
        updated_at,
        sender:users!transactions_sender_id_fkey(id, username, username_display, full_name, avatar_url, phone),
        recipient:users!transactions_recipient_id_fkey(id, username, username_display, full_name, avatar_url, phone)
      `,
      )
      .eq("id", txId)
      .single();

    if (error || !transaction) {
      throw new AppError("Transaction not found", 404, "NOT_FOUND");
    }

    // Verify the requesting user is either the sender or recipient
    if (
      transaction.sender_id !== user.id &&
      transaction.recipient_id !== user.id
    ) {
      throw new AppError(
        "You do not have access to this transaction",
        403,
        "FORBIDDEN",
      );
    }

    // Build sender and recipient info
    const senderInfo = (transaction as any).sender
      ? {
          id: (transaction as any).sender.id,
          username: (transaction as any).sender.username,
          username_display: (transaction as any).sender.username_display,
          full_name: (transaction as any).sender.full_name,
          avatar_url: (transaction as any).sender.avatar_url,
          phone: (transaction as any).sender.phone,
        }
      : null;

    const recipientInfo = (transaction as any).recipient
      ? {
          id: (transaction as any).recipient.id,
          username: (transaction as any).recipient.username,
          username_display: (transaction as any).recipient.username_display,
          full_name: (transaction as any).recipient.full_name,
          avatar_url: (transaction as any).recipient.avatar_url,
          phone: (transaction as any).recipient.phone,
        }
      : null;

    // Fetch related entity if exists
    let relatedEntity = null;
    if (transaction.related_entity_type && transaction.related_entity_id) {
      relatedEntity = await fetchRelatedEntity(
        supabase,
        transaction.related_entity_type,
        transaction.related_entity_id,
      );
    }

    // Build clean transaction object (without nested sender/recipient from join)
    const txData = {
      id: transaction.id,
      tx_type: transaction.tx_type,
      status: transaction.status,
      amount_usdc: transaction.amount_usdc,
      amount_local: transaction.amount_local,
      local_currency: transaction.local_currency,
      exchange_rate_at_time: transaction.exchange_rate_at_time,
      fee_usdc: transaction.fee_usdc,
      fee_local: transaction.fee_local,
      memo: transaction.memo,
      blockchain_tx_hash: transaction.blockchain_tx_hash,
      blockchain_status: transaction.blockchain_status,
      metadata: transaction.metadata,
      related_entity_type: transaction.related_entity_type,
      related_entity_id: transaction.related_entity_id,
      error_message: transaction.error_message,
      created_at: transaction.created_at,
      completed_at: transaction.completed_at,
      updated_at: transaction.updated_at,
    };

    return successResponse({
      transaction: txData,
      sender: senderInfo,
      recipient: recipientInfo,
      related_entity: relatedEntity,
    });
  } catch (error) {
    return errorResponse(error);
  }
});

/**
 * Fetch the related entity (escrow, split, pool, bill_payment) for a transaction.
 */
async function fetchRelatedEntity(
  supabase: any,
  entityType: string,
  entityId: string,
): Promise<any> {
  try {
    switch (entityType) {
      case "escrow": {
        const { data } = await supabase
          .from("escrow_payments")
          .select(
            "id, recipient_phone, status, claim_token, expires_at, claimed_at, cancellable_until, created_at",
          )
          .eq("id", entityId)
          .single();
        return data ? { type: "escrow", ...data } : null;
      }

      case "split": {
        const { data } = await supabase
          .from("bill_splits")
          .select(
            `
            id, title, total_amount_usdc, total_amount_local, local_currency,
            split_type, is_complete, payment_deadline, created_at,
            participants:bill_split_participants(
              id, user_id, amount_usdc, amount_local, status, paid_at
            )
          `,
          )
          .eq("id", entityId)
          .single();
        return data ? { type: "split", ...data } : null;
      }

      case "pool": {
        const { data } = await supabase
          .from("pools")
          .select(
            "id, title, description, pool_type, target_amount_usdc, collected_amount_usdc, status, deadline, created_at",
          )
          .eq("id", entityId)
          .single();
        return data ? { type: "pool", ...data } : null;
      }

      case "bill_payment": {
        const { data } = await supabase
          .from("bill_payments")
          .select(
            "id, bill_type, provider, recipient_identifier, amount_usdc, amount_local, status, provider_reference, metadata, created_at",
          )
          .eq("id", entityId)
          .single();
        return data ? { type: "bill_payment", ...data } : null;
      }

      default:
        return null;
    }
  } catch (err) {
    console.error(`Failed to fetch related entity (${entityType}):`, err);
    return null;
  }
}

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
      "authorization, content-type, x-idempotency-key",
    "Access-Control-Allow-Methods": "POST, GET, PATCH, OPTIONS",
  };
}
