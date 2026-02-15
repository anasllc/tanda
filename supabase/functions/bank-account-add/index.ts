// supabase/functions/bank-account-add/index.ts
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
    const user = await getUserByPrivyDid(supabase, auth.privyDid);
    const body = await req.json();

    const errors = validate(body, [
      { field: "bank_code", type: "string", required: true },
      { field: "account_number", type: "string", required: true, minLength: 10, maxLength: 10 },
      { field: "bank_name", type: "string", required: true },
      { field: "account_name", type: "string", required: true },
    ]);
    if (errors.length) throw new AppError(errors.join("; "), 422, "VALIDATION_ERROR");

    // Check for duplicate
    const { data: existing } = await supabase
      .from("bank_accounts")
      .select("id")
      .eq("user_id", user.id)
      .eq("bank_code", body.bank_code)
      .eq("account_number", body.account_number)
      .single();

    if (existing) throw new AppError("This bank account is already added", 409, "DUPLICATE");

    // Check how many accounts user has (limit to 5)
    const { count } = await supabase
      .from("bank_accounts")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id);

    if (count && count >= 5) {
      throw new AppError("Maximum of 5 bank accounts allowed", 400, "LIMIT_REACHED");
    }

    // Determine if this should be default (first account)
    const isDefault = !count || count === 0;

    // Create bank account
    const { data: bankAccount, error } = await supabase
      .from("bank_accounts")
      .insert({
        user_id: user.id,
        bank_name: body.bank_name,
        bank_code: body.bank_code,
        account_number: body.account_number,
        account_name: body.account_name,
        is_default: isDefault,
        is_verified: true, // Mark as verified (in production, verify via bank API)
        status: "verified",
      })
      .select()
      .single();

    if (error) throw error;

    return successResponse({ bank_account: bankAccount }, 201);
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
