// supabase/functions/bill-split-create/index.ts
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { verifyAuth } from "../_shared/auth.ts";
import { getSupabaseAdmin, getUserByPrivyDid } from "../_shared/supabase.ts";
import { errorResponse, successResponse, AppError } from "../_shared/errors.ts";
import { validate } from "../_shared/validation.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders() });
  }

  try {
    const auth = await verifyAuth(req);
    const supabase = getSupabaseAdmin();
    const organizer = await getUserByPrivyDid(supabase, auth.privyDid);
    const body = await req.json();

    const errors = validate(body, [
      { field: "title", type: "string", required: true, minLength: 1, maxLength: 100 },
      { field: "total_amount_usdc", type: "number", required: true, min: 10000 },
      { field: "split_type", type: "string", required: true, enum: ["equal", "custom", "percentage"] },
      { field: "participants", type: "array", required: true },
    ]);
    if (errors.length) throw new AppError(errors.join("; "), 422, "VALIDATION_ERROR");

    if (!Array.isArray(body.participants) || body.participants.length < 1) {
      throw new AppError("At least one participant is required", 422);
    }

    // Create the bill split
    const { data: split, error: splitError } = await supabase
      .from("bill_splits")
      .insert({
        organizer_id: organizer.id,
        title: body.title,
        total_amount_usdc: body.total_amount_usdc,
        total_amount_local: body.total_amount_local,
        local_currency: body.local_currency || "NGN",
        split_type: body.split_type,
        receipt_image_url: body.receipt_image_url,
        note: body.note,
        payment_deadline: body.payment_deadline,
        reminder_frequency_hours: body.reminder_frequency_hours || 24,
      })
      .select()
      .single();

    if (splitError) throw splitError;

    // Calculate per-participant amounts
    const participants = body.participants;
    const participantRecords = [];

    if (body.split_type === "equal") {
      const perPerson = Math.floor(body.total_amount_usdc / (participants.length + 1)); // +1 for organizer
      const remainder = body.total_amount_usdc - perPerson * (participants.length + 1);

      // Add organizer as first participant (auto-paid)
      participantRecords.push({
        split_id: split.id,
        user_id: organizer.id,
        amount_usdc: perPerson + remainder, // organizer gets remainder
        status: "paid",
        paid_at: new Date().toISOString(),
      });

      for (const p of participants) {
        participantRecords.push({
          split_id: split.id,
          user_id: p.user_id || null,
          phone: p.phone || null,
          amount_usdc: perPerson,
        });
      }
    } else {
      // Custom or percentage — amounts provided per participant
      participantRecords.push({
        split_id: split.id,
        user_id: organizer.id,
        amount_usdc: body.organizer_amount_usdc || 0,
        status: body.organizer_amount_usdc ? "paid" : "pending",
        paid_at: body.organizer_amount_usdc ? new Date().toISOString() : null,
      });

      for (const p of participants) {
        participantRecords.push({
          split_id: split.id,
          user_id: p.user_id || null,
          phone: p.phone || null,
          amount_usdc: p.amount_usdc,
          amount_local: p.amount_local,
          percentage: p.percentage,
          item_description: p.item_description,
        });
      }
    }

    const { error: participantError } = await supabase
      .from("bill_split_participants")
      .insert(participantRecords);

    if (participantError) throw participantError;

    // Notify all registered participants
    for (const p of participants) {
      if (p.user_id) {
        await supabase.from("notifications").insert({
          user_id: p.user_id,
          type: "split_request",
          title: "Bill Split Request",
          body: `${organizer.username ? "@" + organizer.username : organizer.phone} wants to split "${body.title}" with you`,
          data: { split_id: split.id, organizer_id: organizer.id },
        });
      }
    }

    // Fetch full split with participants
    const { data: fullSplit } = await supabase
      .from("bill_splits")
      .select("*, participants:bill_split_participants(*)")
      .eq("id", split.id)
      .single();

    return successResponse({ split: fullSplit }, 201);
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
