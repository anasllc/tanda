// supabase/functions/profile-update/index.ts
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { verifyAuth } from "../_shared/auth.ts";
import { getSupabaseAdmin, getUserByPrivyDid } from "../_shared/supabase.ts";
import { errorResponse, successResponse, AppError } from "../_shared/errors.ts";

const ALLOWED_FIELDS = [
  "full_name", "bio", "avatar_url", "email", "university", "city",
  "display_currency", "push_enabled",
  "privacy_profile", "privacy_friend_list", "privacy_who_can_send",
  "privacy_who_can_add", "privacy_searchable",
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders() });
  }

  try {
    const auth = await verifyAuth(req);
    const supabase = getSupabaseAdmin();
    const user = await getUserByPrivyDid(supabase, auth.privyDid);
    const body = await req.json();

    // Filter to allowed fields only
    const updates: Record<string, unknown> = {};
    for (const key of ALLOWED_FIELDS) {
      if (body[key] !== undefined) {
        updates[key] = body[key];
      }
    }

    if (Object.keys(updates).length === 0) {
      throw new AppError("No valid fields to update", 422);
    }

    // Validate bio length
    if (updates.bio && typeof updates.bio === "string" && updates.bio.length > 50) {
      throw new AppError("Bio must be 50 characters or less", 422);
    }

    // Validate display_currency
    const validCurrencies = ["NGN", "USD", "GBP", "EUR", "AED", "KES", "GHS"];
    if (updates.display_currency && !validCurrencies.includes(updates.display_currency as string)) {
      throw new AppError(`display_currency must be one of: ${validCurrencies.join(", ")}`, 422);
    }

    const { data: updated, error } = await supabase
      .from("users")
      .update(updates)
      .eq("id", user.id)
      .select("id, full_name, bio, avatar_url, email, university, city, display_currency, push_enabled, privacy_profile, privacy_friend_list, privacy_who_can_send, privacy_who_can_add, privacy_searchable")
      .single();

    if (error) throw error;

    return successResponse({ user: updated });
  } catch (error) {
    return errorResponse(error);
  }
});

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, content-type",
    "Access-Control-Allow-Methods": "PATCH, OPTIONS",
  };
}
