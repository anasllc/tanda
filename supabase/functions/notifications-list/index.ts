// supabase/functions/notifications-list/index.ts
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
    const unreadOnly = url.searchParams.get("unread_only") === "true";
    const cursor = url.searchParams.get("cursor"); // ISO timestamp for cursor-based pagination
    const pageSize = 20;

    // Build query
    let query = supabase
      .from("notifications")
      .select("id, type, title, body, data, is_read, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(pageSize + 1); // fetch one extra to determine has_more

    // Apply unread filter
    if (unreadOnly) {
      query = query.eq("is_read", false);
    }

    // Apply cursor-based pagination (items older than cursor)
    if (cursor) {
      query = query.lt("created_at", cursor);
    }

    const { data: notifications, error } = await query;

    if (error) {
      throw new AppError(
        `Failed to fetch notifications: ${error.message}`,
        500,
        "DB_ERROR",
      );
    }

    // Determine if there are more results
    const hasMore = (notifications?.length || 0) > pageSize;
    const items = notifications?.slice(0, pageSize) || [];
    const nextCursor =
      items.length > 0 ? items[items.length - 1].created_at : null;

    // Get total unread count (always, regardless of filters)
    const { count: unreadCount, error: countError } = await supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("is_read", false);

    if (countError) {
      console.error("Failed to count unread notifications:", countError);
    }

    return successResponse({
      notifications: items,
      cursor: nextCursor,
      has_more: hasMore,
      unread_count: unreadCount || 0,
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
