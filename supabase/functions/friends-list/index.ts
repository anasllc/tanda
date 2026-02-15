// supabase/functions/friends-list/index.ts
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { verifyAuth } from "../_shared/auth.ts";
import { getSupabaseAdmin, getUserByPrivyDid } from "../_shared/supabase.ts";
import { errorResponse, successResponse, AppError } from "../_shared/errors.ts";

const PAGE_SIZE = 20;

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
    const status = url.searchParams.get("status") || "accepted";
    const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10));
    const offset = (page - 1) * PAGE_SIZE;

    if (!["accepted", "pending", "all"].includes(status)) {
      throw new AppError(
        "status must be one of: accepted, pending, all",
        422,
        "VALIDATION_ERROR",
      );
    }

    let friends: Record<string, unknown>[] = [];
    let total = 0;

    if (status === "accepted" || status === "all") {
      // Query the user_friends view for accepted friendships
      // Then look up profile info from the users table
      const { data: friendRows, error: fErr, count: fCount } = await supabase
        .from("user_friends")
        .select("friend_id, status, created_at", { count: "exact" })
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .range(offset, offset + PAGE_SIZE - 1);

      if (fErr) throw fErr;

      if (friendRows && friendRows.length > 0) {
        const ids = friendRows.map((f) => f.friend_id);
        const { data: profiles, error: pErr } = await supabase
          .from("users")
          .select("id, username, full_name, avatar_url")
          .in("id", ids);

        if (pErr) throw pErr;

        const profileMap = new Map(
          (profiles || []).map((p) => [p.id, p]),
        );

        friends = friendRows.map((f) => {
          const profile = profileMap.get(f.friend_id);
          return {
            id: f.friend_id,
            username: profile?.username || null,
            full_name: profile?.full_name || null,
            avatar_url: profile?.avatar_url || null,
            status: f.status,
            since: f.created_at,
          };
        });
      }

      total = fCount || 0;
    }

    if (status === "pending" || status === "all") {
      // Query incoming pending requests (where current user is the addressee)
      const pendingOffset = status === "all" ? 0 : offset;

      const { data: pendingRows, error: pendErr, count: pendCount } =
        await supabase
          .from("friendships")
          .select("id, requester_id, status, created_at", { count: "exact" })
          .eq("addressee_id", user.id)
          .eq("status", "pending")
          .order("created_at", { ascending: false })
          .range(pendingOffset, pendingOffset + PAGE_SIZE - 1);

      if (pendErr) throw pendErr;

      if (pendingRows && pendingRows.length > 0) {
        const requesterIds = pendingRows.map((r) => r.requester_id);
        const { data: requesterProfiles, error: rpErr } = await supabase
          .from("users")
          .select("id, username, full_name, avatar_url")
          .in("id", requesterIds);

        if (rpErr) throw rpErr;

        const profileMap = new Map(
          (requesterProfiles || []).map((p) => [p.id, p]),
        );

        const pendingFriends = pendingRows.map((r) => {
          const profile = profileMap.get(r.requester_id);
          return {
            id: r.requester_id,
            username: profile?.username || null,
            full_name: profile?.full_name || null,
            avatar_url: profile?.avatar_url || null,
            status: "pending" as const,
            since: r.created_at,
          };
        });

        if (status === "all") {
          friends = [...friends, ...pendingFriends];
          total += pendCount || 0;
        } else {
          friends = pendingFriends;
          total = pendCount || 0;
        }
      } else if (status === "pending") {
        friends = [];
        total = 0;
      }
    }

    return successResponse({
      friends,
      total,
      page,
      has_more: offset + PAGE_SIZE < total,
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
