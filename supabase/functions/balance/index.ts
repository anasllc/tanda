// supabase/functions/balance/index.ts
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { verifyAuth } from "../_shared/auth.ts";
import { getSupabaseAdmin, getUserByPrivyDid } from "../_shared/supabase.ts";
import { errorResponse, successResponse, AppError } from "../_shared/errors.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders() });
  }

  try {
    if (req.method !== "GET") {
      throw new AppError("Method not allowed", 405, "METHOD_NOT_ALLOWED");
    }

    // Auth + user lookup
    const auth = await verifyAuth(req);
    const supabase = getSupabaseAdmin();
    const user = await getUserByPrivyDid(supabase, auth.privyDid);

    // Query user_balances view for this user
    const { data: balanceData, error: balanceError } = await supabase
      .from("user_balances")
      .select(
        "available_balance_usdc, locked_in_escrow_usdc, pending_incoming_usdc",
      )
      .eq("user_id", user.id)
      .single();

    if (balanceError) {
      throw new AppError(
        `Failed to fetch balance: ${balanceError.message}`,
        500,
        "DB_ERROR",
      );
    }

    const availableUsdc = Number(balanceData?.available_balance_usdc || 0);
    const lockedUsdc = Number(balanceData?.locked_in_escrow_usdc || 0);
    const pendingUsdc = Number(balanceData?.pending_incoming_usdc || 0);
    const totalUsdc = availableUsdc + lockedUsdc + pendingUsdc;

    // Get the user's display currency preference
    const { data: userData } = await supabase
      .from("users")
      .select("display_currency")
      .eq("id", user.id)
      .single();

    const displayCurrency = userData?.display_currency || "NGN";

    // Query latest exchange rate for USDC -> display currency
    const { data: rateData, error: rateError } = await supabase
      .from("exchange_rates")
      .select("rate, fetched_at")
      .eq("base_currency", "USDC")
      .eq("quote_currency", displayCurrency)
      .order("fetched_at", { ascending: false })
      .limit(1)
      .single();

    if (rateError) {
      console.error("Failed to fetch exchange rate:", rateError);
    }

    // Default to 1.0 if no rate found (e.g., for USD display)
    const rate = rateData?.rate ? Number(rateData.rate) : 1.0;

    // Calculate display values in local currency
    // USDC amounts are in smallest units (6 decimals: 1 USDC = 1_000_000)
    // Rate is per 1 USDC, so: local_amount = (usdc_amount / 1_000_000) * rate
    // We store local amounts in smallest units too (kobo for NGN: 1 NGN = 100 kobo)
    // So: local_smallest = (usdc_amount / 1_000_000) * rate * 100
    const usdcToLocal = (usdcAmount: number): number => {
      return Math.round((usdcAmount / 1_000_000) * rate * 100);
    };

    return successResponse({
      balance: {
        available_usdc: availableUsdc,
        locked_in_escrow_usdc: lockedUsdc,
        pending_incoming_usdc: pendingUsdc,
        total_usdc: totalUsdc,
      },
      display: {
        available_local: usdcToLocal(availableUsdc),
        locked_local: usdcToLocal(lockedUsdc),
        pending_local: usdcToLocal(pendingUsdc),
        total_local: usdcToLocal(totalUsdc),
        currency: displayCurrency,
        rate: rate,
      },
    });
  } catch (error) {
    return errorResponse(error);
  }
});

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
      "authorization, content-type, x-idempotency-key",
    "Access-Control-Allow-Methods": "POST, GET, PATCH, OPTIONS",
  };
}
