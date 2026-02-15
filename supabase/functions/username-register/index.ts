// supabase/functions/username-register/index.ts
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

    const { username, username_display } = body;

    if (!username) throw new AppError("username is required", 422);
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
      throw new AppError("Username must be 3-20 characters: letters, numbers, underscores only", 422);
    }

    const lower = username.toLowerCase();

    // Check if user already has a locked username
    const { data: currentUser } = await supabase
      .from("users")
      .select("username, username_locked_at")
      .eq("id", user.id)
      .single();

    if (currentUser?.username && currentUser?.username_locked_at) {
      const lockDate = new Date(currentUser.username_locked_at);
      if (lockDate < new Date()) {
        throw new AppError("Username is locked and cannot be changed", 403, "USERNAME_LOCKED");
      }
    }

    // Check profanity
    const { data: profane } = await supabase.rpc("check_profanity", { input_text: lower });
    if (profane) throw new AppError("Username contains prohibited words", 422, "PROFANITY");

    // Check availability
    const { data: existing } = await supabase
      .from("users")
      .select("id")
      .eq("username", lower)
      .neq("id", user.id)
      .single();

    if (existing) throw new AppError("Username is already taken", 409, "USERNAME_TAKEN");

    // Update user
    const { data: updated, error } = await supabase
      .from("users")
      .update({
        username: lower,
        username_display: username_display || username,
      })
      .eq("id", user.id)
      .select("id, username, username_display, username_locked_at")
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
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
}
