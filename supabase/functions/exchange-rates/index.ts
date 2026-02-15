// supabase/functions/exchange-rates/index.ts
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { getSupabaseAdmin } from "../_shared/supabase.ts";
import { errorResponse, successResponse, AppError } from "../_shared/errors.ts";
import { getExchangeRate } from "../_shared/due-client.ts";

// Supported currency pairs (base is always USDC)
const SUPPORTED_CURRENCIES = ["NGN", "USD", "GBP", "EUR"];

// Rate freshness threshold in seconds
const RATE_FRESHNESS_SECONDS = 30;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders() });
  }

  try {
    if (req.method !== "GET") {
      throw new AppError("Method not allowed", 405, "METHOD_NOT_ALLOWED");
    }

    // Auth is optional for this endpoint (public rates)
    // If auth header is provided, we can still verify it, but we don't require it
    const supabase = getSupabaseAdmin();

    // Fetch the latest rate for each supported currency from the DB
    const rates: Record<string, number> = {};
    let latestUpdatedAt: string | null = null;

    for (const currency of SUPPORTED_CURRENCIES) {
      // USD is always 1:1 with USDC
      if (currency === "USD") {
        rates["USD"] = 1.0;
        continue;
      }

      // Query latest cached rate
      const { data: rateData, error: rateError } = await supabase
        .from("exchange_rates")
        .select("rate, fetched_at")
        .eq("base_currency", "USDC")
        .eq("quote_currency", currency)
        .order("fetched_at", { ascending: false })
        .limit(1)
        .single();

      if (rateError && rateError.code !== "PGRST116") {
        // PGRST116 = no rows found
        console.error(`Failed to fetch ${currency} rate:`, rateError);
      }

      const now = new Date();
      const fetchedAt = rateData?.fetched_at
        ? new Date(rateData.fetched_at)
        : null;
      const ageSeconds = fetchedAt
        ? (now.getTime() - fetchedAt.getTime()) / 1000
        : Infinity;

      // Check if rate is stale (older than threshold)
      if (ageSeconds > RATE_FRESHNESS_SECONDS) {
        // Try to fetch fresh rate from Due API
        try {
          const freshRate = await getExchangeRate("USDC", currency);

          if (freshRate?.rate) {
            const rateValue = Number(freshRate.rate);

            // Insert new rate record
            const { error: insertError } = await supabase
              .from("exchange_rates")
              .insert({
                base_currency: "USDC",
                quote_currency: currency,
                rate: rateValue,
                source: "due",
                fetched_at: new Date().toISOString(),
              });

            if (insertError) {
              console.error(
                `Failed to insert ${currency} rate:`,
                insertError,
              );
            }

            rates[currency] = rateValue;
            const newTimestamp = new Date().toISOString();
            if (!latestUpdatedAt || newTimestamp > latestUpdatedAt) {
              latestUpdatedAt = newTimestamp;
            }
            continue;
          }
        } catch (dueError) {
          console.error(
            `Due API rate fetch failed for ${currency}:`,
            dueError,
          );
          // Fall through to use cached rate
        }
      }

      // Use cached rate (or null if no rate exists)
      if (rateData?.rate) {
        rates[currency] = Number(rateData.rate);
        if (
          rateData.fetched_at &&
          (!latestUpdatedAt || rateData.fetched_at > latestUpdatedAt)
        ) {
          latestUpdatedAt = rateData.fetched_at;
        }
      } else {
        // No rate available at all -- set a placeholder
        // In production, you'd want to handle this more gracefully
        rates[currency] = 0;
      }
    }

    return successResponse({
      rates,
      updated_at: latestUpdatedAt || new Date().toISOString(),
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
