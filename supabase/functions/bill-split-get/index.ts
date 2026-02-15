// supabase/functions/bill-split-get/index.ts
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
    const splitId = url.searchParams.get("id");

    if (splitId) {
      // Get single split with full details
      const { data: split, error } = await supabase
        .from("bill_splits")
        .select(`
          *,
          organizer:users!organizer_id(id, username, username_display, full_name, avatar_url),
          participants:bill_split_participants(
            *,
            user:users(id, username, username_display, full_name, avatar_url)
          )
        `)
        .eq("id", splitId)
        .single();

      if (error || !split) throw new AppError("Split not found", 404);

      // Verify user is organizer or participant
      const isParticipant = split.participants.some(
        (p: any) => p.user_id === user.id
      );
      if (split.organizer_id !== user.id && !isParticipant) {
        throw new AppError("You don't have access to this split", 403);
      }

      // Calculate totals
      const paidAmount = split.participants
        .filter((p: any) => p.status === "paid")
        .reduce((sum: number, p: any) => sum + p.amount_usdc, 0);

      return successResponse({
        split,
        summary: {
          total_amount_usdc: split.total_amount_usdc,
          paid_amount_usdc: paidAmount,
          remaining_usdc: split.total_amount_usdc - paidAmount,
          total_participants: split.participants.length,
          paid_count: split.participants.filter((p: any) => p.status === "paid").length,
          pending_count: split.participants.filter((p: any) => p.status === "pending").length,
        },
      });
    }

    // List user's splits (as organizer or participant)
    const cursor = url.searchParams.get("cursor");
    const limit = 20;

    // Splits where user is organizer
    let orgQuery = supabase
      .from("bill_splits")
      .select("*, participants:bill_split_participants(status)")
      .eq("organizer_id", user.id)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (cursor) orgQuery = orgQuery.lt("created_at", cursor);

    const { data: organizedSplits } = await orgQuery;

    // Splits where user is participant
    const { data: participantSplits } = await supabase
      .from("bill_split_participants")
      .select("split:bill_splits(*, participants:bill_split_participants(status))")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(limit);

    const allSplits = [
      ...(organizedSplits || []).map((s: any) => ({ ...s, role: "organizer" })),
      ...(participantSplits || []).map((p: any) => ({ ...p.split, role: "participant" })),
    ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, limit);

    return successResponse({
      splits: allSplits,
      next_cursor: allSplits.length === limit ? allSplits[allSplits.length - 1].created_at : null,
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
