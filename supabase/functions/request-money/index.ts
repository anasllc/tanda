// supabase/functions/request-money/index.ts
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { verifyAuth } from "../_shared/auth.ts";
import { getSupabaseAdmin, getUserByPrivyDid } from "../_shared/supabase.ts";
import { errorResponse, successResponse, AppError } from "../_shared/errors.ts";
import { validate, normalizePhone, isValidE164 } from "../_shared/validation.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders() });
  }

  try {
    const auth = await verifyAuth(req);
    const supabase = getSupabaseAdmin();
    const requester = await getUserByPrivyDid(supabase, auth.privyDid);
    const body = await req.json();

    const errors = validate(body, [
      { field: "recipient", type: "string", required: true },
      { field: "amount_usdc", type: "number", required: true, min: 10000 },
      { field: "reason", type: "string", maxLength: 200 },
    ]);
    if (errors.length) throw new AppError(errors.join("; "), 422, "VALIDATION_ERROR");

    // Resolve recipient
    let recipientId: string | null = null;
    let recipientPhone: string | null = null;

    if (body.recipient.startsWith("@")) {
      const { data: user } = await supabase
        .from("users")
        .select("id")
        .eq("username", body.recipient.slice(1).toLowerCase())
        .single();
      if (!user) throw new AppError("User not found", 404);
      recipientId = user.id;
    } else {
      const phone = normalizePhone(body.recipient);
      if (!isValidE164(phone)) throw new AppError("Invalid phone number", 422);
      const { data: user } = await supabase
        .from("users")
        .select("id")
        .eq("phone", phone)
        .single();
      recipientId = user?.id || null;
      recipientPhone = phone;
    }

    if (recipientId === requester.id) throw new AppError("Cannot request money from yourself", 400);

    // Create payment request
    const { data: request, error } = await supabase
      .from("payment_requests")
      .insert({
        requester_id: requester.id,
        recipient_id: recipientId,
        recipient_phone: recipientPhone,
        amount_usdc: body.amount_usdc,
        amount_local: body.amount_local,
        local_currency: body.local_currency || "NGN",
        reason: body.reason,
        deadline: body.deadline,
      })
      .select()
      .single();

    if (error) throw error;

    // Notify recipient if registered
    if (recipientId) {
      await supabase.from("notifications").insert({
        user_id: recipientId,
        type: "money_request",
        title: "Money Request",
        body: `${requester.username ? "@" + requester.username : requester.phone} requested $${(body.amount_usdc / 1_000_000).toFixed(2)}${body.reason ? ` for "${body.reason}"` : ""}`,
        data: { request_id: request.id, requester_id: requester.id, amount_usdc: body.amount_usdc },
      });
    }

    return successResponse({ request });
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
