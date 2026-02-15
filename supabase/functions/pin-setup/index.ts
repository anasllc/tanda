// supabase/functions/pin-setup/index.ts
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

    const { action, pin, current_pin } = body;

    if (!pin || typeof pin !== "string" || !/^\d{4,6}$/.test(pin)) {
      throw new AppError("PIN must be 4-6 digits", 422, "INVALID_PIN");
    }

    // Get current PIN hash
    const { data: userData } = await supabase
      .from("users")
      .select("pin_hash")
      .eq("id", user.id)
      .single();

    if (action === "change") {
      // Changing existing PIN — verify current first
      if (!userData?.pin_hash) {
        throw new AppError("No PIN set. Use action 'set' instead.", 400);
      }
      if (!current_pin) {
        throw new AppError("current_pin is required when changing PIN", 422);
      }
      // Simple hash comparison (in production, use bcrypt)
      const currentHash = await hashPin(current_pin);
      if (currentHash !== userData.pin_hash) {
        throw new AppError("Current PIN is incorrect", 403, "INVALID_PIN");
      }
    } else if (action === "verify") {
      // Just verify the PIN
      if (!userData?.pin_hash) {
        throw new AppError("No PIN set", 400, "PIN_NOT_SET");
      }
      const hash = await hashPin(pin);
      const valid = hash === userData.pin_hash;
      return successResponse({ valid });
    } else {
      // Setting new PIN
      if (userData?.pin_hash) {
        throw new AppError("PIN already set. Use action 'change' to update.", 400, "PIN_EXISTS");
      }
    }

    // Hash and store PIN
    const pinHash = await hashPin(pin);
    const { error } = await supabase
      .from("users")
      .update({ pin_hash: pinHash })
      .eq("id", user.id);

    if (error) throw error;

    return successResponse({ success: true, message: action === "change" ? "PIN changed" : "PIN set" });
  } catch (error) {
    return errorResponse(error);
  }
});

// Simple SHA-256 hash for PIN (in production, use bcrypt with salt)
async function hashPin(pin: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(pin);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
}
