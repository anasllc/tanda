// supabase/functions/notifications-read/index.ts
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { verifyAuth } from "../_shared/auth.ts";
import { getSupabaseAdmin, getUserByPrivyDid } from "../_shared/supabase.ts";
import { errorResponse, successResponse, AppError } from "../_shared/errors.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders() });
  }

  try {
    if (req.method !== "PATCH") {
      throw new AppError("Method not allowed", 405, "METHOD_NOT_ALLOWED");
    }

    // Auth + user lookup
    const auth = await verifyAuth(req);
    const supabase = getSupabaseAdmin();
    const user = await getUserByPrivyDid(supabase, auth.privyDid);

    const body = await req.json();
    const { ids, all } = body as { ids?: string[]; all?: boolean };

    // Validate input: must provide either ids array or all=true
    if (!all && (!ids || !Array.isArray(ids) || ids.length === 0)) {
      throw new AppError(
        "Provide either { ids: string[] } or { all: true }",
        400,
        "VALIDATION_ERROR",
      );
    }

    let updatedCount = 0;

    if (all) {
      // Mark all unread notifications as read for this user
      const { data, error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("user_id", user.id)
        .eq("is_read", false)
        .select("id");

      if (error) {
        throw new AppError(
          `Failed to mark notifications as read: ${error.message}`,
          500,
          "DB_ERROR",
        );
      }

      updatedCount = data?.length || 0;
    } else {
      // Validate IDs are UUIDs (basic check)
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      for (const id of ids!) {
        if (!uuidRegex.test(id)) {
          throw new AppError(
            `Invalid notification ID: ${id}`,
            400,
            "VALIDATION_ERROR",
          );
        }
      }

      // Mark specific notifications as read (only if they belong to this user)
      const { data, error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .in("id", ids!)
        .eq("user_id", user.id)
        .eq("is_read", false)
        .select("id");

      if (error) {
        throw new AppError(
          `Failed to mark notifications as read: ${error.message}`,
          500,
          "DB_ERROR",
        );
      }

      updatedCount = data?.length || 0;
    }

    return successResponse({ updated_count: updatedCount });
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
