// supabase/functions/user-search/index.ts
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { verifyAuth } from "../_shared/auth.ts";
import { getSupabaseAdmin, getUserByPrivyDid } from "../_shared/supabase.ts";
import { errorResponse, successResponse, AppError } from "../_shared/errors.ts";
import { normalizePhone, isValidE164 } from "../_shared/validation.ts";

const RESULT_LIMIT = 20;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders() });
  }

  try {
    if (req.method !== "GET") {
      throw new AppError("Method not allowed", 405, "METHOD_NOT_ALLOWED");
    }

    const auth = await verifyAuth(req);
    const supabase = getSupabaseAdmin();
    const user = await getUserByPrivyDid(supabase, auth.privyDid);

    const url = new URL(req.url);
    const q = (url.searchParams.get("q") || "").trim();

    if (q.length < 2) {
      throw new AppError(
        "Search query must be at least 2 characters",
        422,
        "VALIDATION_ERROR",
      );
    }

    // Build search: username ILIKE, full_name ILIKE, or exact phone match
    const searchPattern = `%${q}%`;

    // Try to normalize the query as a phone number for phone matching
    let phoneFilter: string | null = null;
    const normalizedQ = normalizePhone(q);
    if (isValidE164(normalizedQ)) {
      phoneFilter = normalizedQ;
    }

    // Build the or filter
    let orConditions = `username.ilike.${searchPattern},full_name.ilike.${searchPattern}`;
    if (phoneFilter) {
      orConditions += `,phone.eq.${phoneFilter}`;
    }

    const { data: results, error: searchErr } = await supabase
      .from("users")
      .select("id, username, full_name, avatar_url")
      .eq("privacy_searchable", true)
      .neq("id", user.id)
      .or(orConditions)
      .limit(RESULT_LIMIT);

    if (searchErr) throw searchErr;

    if (!results || results.length === 0) {
      return successResponse({ users: [] });
    }

    // For each result, check friendship status
    const resultIds = results.map((r) => r.id);

    // Query friendships where current user is involved with any of the result users
    const { data: friendships, error: frErr } = await supabase
      .from("friendships")
      .select("id, requester_id, addressee_id, status")
      .or(
        `and(requester_id.eq.${user.id},addressee_id.in.(${resultIds.join(",")})),and(addressee_id.eq.${user.id},requester_id.in.(${resultIds.join(",")}))`,
      );

    if (frErr) throw frErr;

    // Build a map: other_user_id -> friendship info
    const friendshipMap = new Map<
      string,
      { is_friend: boolean; friendship_status: string | null }
    >();

    for (const f of friendships || []) {
      const otherId =
        f.requester_id === user.id ? f.addressee_id : f.requester_id;
      friendshipMap.set(otherId, {
        is_friend: f.status === "accepted",
        friendship_status: f.status,
      });
    }

    const users = results.map((r) => {
      const fInfo = friendshipMap.get(r.id);
      return {
        id: r.id,
        username: r.username,
        full_name: r.full_name,
        avatar_url: r.avatar_url,
        is_friend: fInfo?.is_friend || false,
        friendship_status: fInfo?.friendship_status || null,
      };
    });

    return successResponse({ users });
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
