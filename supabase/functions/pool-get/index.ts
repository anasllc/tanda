// supabase/functions/pool-get/index.ts
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

    const url = new URL(req.url);
    const poolId = url.searchParams.get("id");
    const shareToken = url.searchParams.get("token");

    if (poolId || shareToken) {
      // Get single pool
      let query = supabase
        .from("pools")
        .select(`
          *,
          organizer:users!organizer_id(id, username, username_display, full_name, avatar_url),
          members:pool_members(*, user:users(id, username, username_display, full_name, avatar_url)),
          contributions:pool_contributions(
            id, amount_usdc, is_anonymous, message, created_at,
            contributor:users!contributor_id(id, username, username_display, avatar_url)
          )
        `);

      if (poolId) query = query.eq("id", poolId);
      else query = query.eq("share_token", shareToken);

      const { data: pool, error } = await query.single();

      if (error || !pool) throw new AppError("Pool not found", 404);

      // Mask anonymous contributions
      if (pool.contributions) {
        pool.contributions = pool.contributions.map((c: any) => {
          if (c.is_anonymous && c.contributor?.id !== user.id && pool.organizer_id !== user.id) {
            return { ...c, contributor: null };
          }
          return c;
        });
      }

      const progress = pool.target_amount_usdc
        ? Math.min(100, Math.round((pool.collected_amount_usdc / pool.target_amount_usdc) * 100))
        : null;

      return successResponse({
        pool,
        summary: {
          collected_usdc: pool.collected_amount_usdc,
          target_usdc: pool.target_amount_usdc,
          progress_percent: progress,
          member_count: pool.members?.length || 0,
          contribution_count: pool.contributions?.length || 0,
        },
      });
    }

    // List user's pools
    const cursor = url.searchParams.get("cursor");
    const limit = 20;

    // Pools user is member of
    const { data: memberships } = await supabase
      .from("pool_members")
      .select("pool_id")
      .eq("user_id", user.id);

    const poolIds = memberships?.map((m: any) => m.pool_id) || [];

    if (poolIds.length === 0) {
      return successResponse({ pools: [], next_cursor: null });
    }

    let poolQuery = supabase
      .from("pools")
      .select("*, organizer:users!organizer_id(id, username, username_display, avatar_url)")
      .in("id", poolIds)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (cursor) poolQuery = poolQuery.lt("created_at", cursor);

    const { data: pools } = await poolQuery;

    return successResponse({
      pools: pools || [],
      next_cursor: pools && pools.length === limit ? pools[pools.length - 1].created_at : null,
    });
  } catch (error) {
    return errorResponse(error);
  }
});

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, content-type",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
  };
}
