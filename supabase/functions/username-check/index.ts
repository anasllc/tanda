// supabase/functions/username-check/index.ts
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { verifyAuth } from "../_shared/auth.ts";
import { getSupabaseAdmin } from "../_shared/supabase.ts";
import { errorResponse, successResponse, AppError } from "../_shared/errors.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders() });
  }

  try {
    await verifyAuth(req);
    const supabase = getSupabaseAdmin();

    const url = new URL(req.url);
    const username = url.searchParams.get("username")?.toLowerCase();

    if (!username) throw new AppError("username parameter is required", 422);
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
      throw new AppError("Username must be 3-20 characters: letters, numbers, underscores only", 422);
    }

    // Check profanity
    const { data: profane } = await supabase.rpc("check_profanity", { input_text: username });
    if (profane) {
      return successResponse({ available: false, reason: "Username contains prohibited words" });
    }

    // Check availability
    const { data: existing } = await supabase
      .from("users")
      .select("id")
      .eq("username", username)
      .single();

    if (existing) {
      // Generate suggestions
      const suggestions = [
        `${username}_`,
        `${username}${Math.floor(Math.random() * 99)}`,
        `_${username}`,
      ];
      return successResponse({ available: false, suggestions });
    }

    return successResponse({ available: true });
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
