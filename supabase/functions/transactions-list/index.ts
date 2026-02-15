// supabase/functions/transactions-list/index.ts
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
    const typeFilter = url.searchParams.get("type") || "all";
    const statusFilter = url.searchParams.get("status") || "all";
    const cursor = url.searchParams.get("cursor"); // ISO timestamp
    const pageSize = 20;

    // Determine tx_type filters based on category
    const typeFilters: Record<string, string[]> = {
      send: ["send", "escrow_send"],
      receive: ["receive", "escrow_claim"],
      onramp: ["onramp"],
      offramp: ["offramp"],
      bills: ["airtime", "data", "electricity", "cable"],
    };

    // Build query -- we need transactions where user is sender OR recipient
    // Use an OR filter to match either role
    let query = supabase
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
        metadata,
        related_entity_type,
        related_entity_id,
        created_at,
        completed_at,
        sender:users!transactions_sender_id_fkey(id, username, full_name, avatar_url),
        recipient:users!transactions_recipient_id_fkey(id, username, full_name, avatar_url)
      `,
      )
      .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
      .order("created_at", { ascending: false })
      .limit(pageSize + 1);

    // Apply type filter
    if (typeFilter !== "all") {
      const allowedTypes = typeFilters[typeFilter];
      if (allowedTypes) {
        query = query.in("tx_type", allowedTypes);
      } else {
        throw new AppError(
          `Invalid type filter: ${typeFilter}. Must be one of: all, send, receive, onramp, offramp, bills`,
          400,
          "VALIDATION_ERROR",
        );
      }
    }

    // Apply status filter
    if (statusFilter !== "all") {
      const validStatuses = [
        "pending",
        "processing",
        "completed",
        "failed",
        "cancelled",
        "expired",
      ];
      if (!validStatuses.includes(statusFilter)) {
        throw new AppError(
          `Invalid status filter: ${statusFilter}. Must be one of: all, ${validStatuses.join(", ")}`,
          400,
          "VALIDATION_ERROR",
        );
      }
      query = query.eq("status", statusFilter);
    }

    // Apply cursor-based pagination
    if (cursor) {
      query = query.lt("created_at", cursor);
    }

    const { data: transactions, error } = await query;

    if (error) {
      throw new AppError(
        `Failed to fetch transactions: ${error.message}`,
        500,
        "DB_ERROR",
      );
    }

    // Determine if there are more results
    const hasMore = (transactions?.length || 0) > pageSize;
    const items = transactions?.slice(0, pageSize) || [];
    const nextCursor =
      items.length > 0 ? items[items.length - 1].created_at : null;

    // Transform to include sender_info and recipient_info
    const formattedTransactions = items.map((tx: any) => ({
      id: tx.id,
      tx_type: tx.tx_type,
      status: tx.status,
      amount_usdc: tx.amount_usdc,
      amount_local: tx.amount_local,
      local_currency: tx.local_currency,
      exchange_rate_at_time: tx.exchange_rate_at_time,
      fee_usdc: tx.fee_usdc,
      fee_local: tx.fee_local,
      memo: tx.memo,
      blockchain_tx_hash: tx.blockchain_tx_hash,
      metadata: tx.metadata,
      related_entity_type: tx.related_entity_type,
      related_entity_id: tx.related_entity_id,
      created_at: tx.created_at,
      completed_at: tx.completed_at,
      sender_info: tx.sender
        ? {
            id: tx.sender.id,
            username: tx.sender.username,
            full_name: tx.sender.full_name,
            avatar_url: tx.sender.avatar_url,
          }
        : null,
      recipient_info: tx.recipient
        ? {
            id: tx.recipient.id,
            username: tx.recipient.username,
            full_name: tx.recipient.full_name,
            avatar_url: tx.recipient.avatar_url,
          }
        : null,
    }));

    return successResponse({
      transactions: formattedTransactions,
      cursor: nextCursor,
      has_more: hasMore,
    });
  } catch (error) {
    return errorResponse(error);
  }
});

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
      "authorization, content-type, x-idempotency-key",
    "Access-Control-Allow-Methods": "POST, GET, PATCH, OPTIONS",
  };
}
