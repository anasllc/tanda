// supabase/functions/bill-split-remind/index.ts
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
    const body = await req.json();

    const { split_id } = body;
    if (!split_id) throw new AppError("split_id is required", 422);

    // Verify user is the organizer
    const { data: split } = await supabase
      .from("bill_splits")
      .select("*")
      .eq("id", split_id)
      .eq("organizer_id", user.id)
      .single();

    if (!split) throw new AppError("Split not found or you are not the organizer", 404);
    if (split.is_complete) throw new AppError("Split is already complete", 400);

    // Get unpaid participants
    const { data: unpaidParticipants } = await supabase
      .from("bill_split_participants")
      .select("id, user_id, phone, amount_usdc, reminder_count")
      .eq("split_id", split_id)
      .eq("status", "pending")
      .neq("user_id", user.id);

    if (!unpaidParticipants || unpaidParticipants.length === 0) {
      return successResponse({ reminded: 0, message: "No unpaid participants" });
    }

    let reminded = 0;

    for (const p of unpaidParticipants) {
      if (p.user_id) {
        // Send in-app notification
        await supabase.from("notifications").insert({
          user_id: p.user_id,
          type: "split_reminder",
          title: "Payment Reminder",
          body: `${user.username ? "@" + user.username : user.phone} is reminding you to pay $${(p.amount_usdc / 1_000_000).toFixed(2)} for "${split.title}"`,
          data: { split_id, amount_usdc: p.amount_usdc },
        });

        // Update reminder count
        await supabase
          .from("bill_split_participants")
          .update({
            reminder_count: (p.reminder_count || 0) + 1,
            last_reminded_at: new Date().toISOString(),
          })
          .eq("id", p.id);

        reminded++;
      }
    }

    return successResponse({ reminded, total_unpaid: unpaidParticipants.length });
  } catch (error) {
    return errorResponse(error);
  }
});

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
}
