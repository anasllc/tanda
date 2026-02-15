// supabase/functions/contacts-sync/index.ts
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { verifyAuth } from "../_shared/auth.ts";
import { getSupabaseAdmin, getUserByPrivyDid } from "../_shared/supabase.ts";
import { errorResponse, successResponse, AppError } from "../_shared/errors.ts";
import { normalizePhone, isValidE164 } from "../_shared/validation.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders() });
  }

  try {
    if (req.method !== "POST") {
      throw new AppError("Method not allowed", 405, "METHOD_NOT_ALLOWED");
    }

    const auth = await verifyAuth(req);
    const supabase = getSupabaseAdmin();
    const user = await getUserByPrivyDid(supabase, auth.privyDid);

    const body = await req.json();
    const { phone_numbers } = body;

    if (!Array.isArray(phone_numbers) || phone_numbers.length === 0) {
      throw new AppError(
        "phone_numbers must be a non-empty array of strings",
        422,
        "VALIDATION_ERROR",
      );
    }

    // Cap the batch size to prevent abuse
    if (phone_numbers.length > 500) {
      throw new AppError(
        "Maximum 500 phone numbers per sync",
        422,
        "VALIDATION_ERROR",
      );
    }

    // Normalize and hash each phone number
    const phoneEntries: { normalized: string; hash: string }[] = [];

    for (const raw of phone_numbers) {
      if (typeof raw !== "string") continue;

      const normalized = normalizePhone(raw);
      if (!isValidE164(normalized)) continue;

      const hash = await hashPhone(normalized);
      phoneEntries.push({ normalized, hash });
    }

    if (phoneEntries.length === 0) {
      return successResponse({
        matched_users: [],
        total_synced: 0,
        matched_count: 0,
      });
    }

    // Upsert all contact hashes into contact_syncs
    const upsertRows = phoneEntries.map((entry) => ({
      user_id: user.id,
      phone_hash: entry.hash,
      synced_at: new Date().toISOString(),
    }));

    const { error: upsertError } = await supabase
      .from("contact_syncs")
      .upsert(upsertRows, { onConflict: "user_id,phone_hash" });

    if (upsertError) throw upsertError;

    // Build a map from hash -> normalized phone for the response
    const hashToPhone = new Map<string, string>();
    for (const entry of phoneEntries) {
      hashToPhone.set(entry.hash, entry.normalized);
    }

    // Match against registered users by normalized phone
    const normalizedPhones = phoneEntries.map((e) => e.normalized);
    const { data: matchedUsers, error: matchError } = await supabase
      .from("users")
      .select("id, username, full_name, avatar_url, phone")
      .in("phone", normalizedPhones)
      .neq("id", user.id);

    if (matchError) throw matchError;

    // Update contact_syncs with matched_user_id for each match
    if (matchedUsers && matchedUsers.length > 0) {
      for (const matched of matchedUsers) {
        const matchedHash = await hashPhone(matched.phone);
        await supabase
          .from("contact_syncs")
          .update({ matched_user_id: matched.id })
          .eq("user_id", user.id)
          .eq("phone_hash", matchedHash);
      }
    }

    return successResponse({
      matched_users: (matchedUsers || []).map((u) => ({
        id: u.id,
        username: u.username,
        full_name: u.full_name,
        avatar_url: u.avatar_url,
        phone: u.phone,
      })),
      total_synced: phoneEntries.length,
      matched_count: matchedUsers?.length || 0,
    });
  } catch (error) {
    return errorResponse(error);
  }
});

/**
 * Hash a phone number with SHA-256 using the Web Crypto API.
 */
async function hashPhone(phone: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(phone);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
      "authorization, content-type, x-idempotency-key",
    "Access-Control-Allow-Methods": "POST, GET, PATCH, OPTIONS",
  };
}
