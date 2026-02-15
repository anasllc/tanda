// supabase/functions/profile-get/index.ts
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
    const currentUser = await getUserByPrivyDid(supabase, auth.privyDid);

    const url = new URL(req.url);
    const targetUserId = url.searchParams.get("user_id");

    // Own profile — return full data
    if (!targetUserId || targetUserId === currentUser.id) {
      const { data: profile, error } = await supabase
        .from("users")
        .select(`
          id, phone, username, username_display, full_name, bio, avatar_url,
          email, email_verified, university, city, wallet_address,
          kyc_level, display_currency, push_enabled,
          privacy_profile, privacy_friend_list, privacy_who_can_send,
          privacy_who_can_add, privacy_searchable,
          created_at, last_active_at
        `)
        .eq("id", currentUser.id)
        .single();

      if (error) throw error;

      // Get balance
      const { data: balance } = await supabase
        .from("user_balances")
        .select("available_balance_usdc, locked_in_escrow_usdc, pending_incoming_usdc")
        .eq("user_id", currentUser.id)
        .single();

      // Get friend count
      const { count: friendCount } = await supabase
        .from("friendships")
        .select("id", { count: "exact", head: true })
        .eq("status", "accepted")
        .or(`requester_id.eq.${currentUser.id},addressee_id.eq.${currentUser.id}`);

      return successResponse({
        profile,
        balance: balance || { available_balance_usdc: 0, locked_in_escrow_usdc: 0, pending_incoming_usdc: 0 },
        friend_count: friendCount || 0,
      });
    }

    // Other user's profile — return public view
    const { data: profile, error } = await supabase
      .from("users")
      .select("id, username, username_display, full_name, bio, avatar_url, university, city, privacy_profile")
      .eq("id", targetUserId)
      .single();

    if (error || !profile) throw new AppError("User not found", 404);

    if (profile.privacy_profile === "private") {
      return successResponse({
        profile: { id: profile.id, username: profile.username, username_display: profile.username_display },
      });
    }

    // Check friendship status
    const { data: friendship } = await supabase
      .from("friendships")
      .select("status")
      .or(
        `and(requester_id.eq.${currentUser.id},addressee_id.eq.${targetUserId}),and(requester_id.eq.${targetUserId},addressee_id.eq.${currentUser.id})`,
      )
      .single();

    if (profile.privacy_profile === "friends_only" && friendship?.status !== "accepted") {
      return successResponse({
        profile: { id: profile.id, username: profile.username, username_display: profile.username_display },
        friendship_status: friendship?.status || null,
      });
    }

    return successResponse({
      profile,
      friendship_status: friendship?.status || null,
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
