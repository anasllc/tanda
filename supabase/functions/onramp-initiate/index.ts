// supabase/functions/onramp-initiate/index.ts
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { verifyAuth } from "../_shared/auth.ts";
import { getSupabaseAdmin, getUserByPrivyDid } from "../_shared/supabase.ts";
import { errorResponse, successResponse, AppError } from "../_shared/errors.ts";
import {
  createDueAccount,
  linkWalletToDue,
  getOnrampQuote,
  createOnrampTransfer,
} from "../_shared/due-client.ts";
import { checkIdempotency, saveIdempotencyResult } from "../_shared/idempotency.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders() });
  }

  try {
    const auth = await verifyAuth(req);
    const supabase = getSupabaseAdmin();
    const user = await getUserByPrivyDid(supabase, auth.privyDid);
    const idempotencyKey = req.headers.get("x-idempotency-key");

    const { isDuplicate, cachedResponse } = await checkIdempotency(supabase, idempotencyKey, user.id);
    if (isDuplicate && cachedResponse) {
      return new Response(JSON.stringify(cachedResponse.body), {
        status: cachedResponse.status,
        headers: { "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { amount_ngn, method } = body;

    if (!amount_ngn || amount_ngn < 100) {
      throw new AppError("amount_ngn must be at least 100", 422);
    }

    // Get full user record for Due account setup
    const { data: fullUser } = await supabase
      .from("users")
      .select("id, due_account_id, due_wallet_id, wallet_address, full_name, email")
      .eq("id", user.id)
      .single();

    if (!fullUser?.wallet_address) {
      throw new AppError("Wallet not set up. Please complete onboarding.", 400, "NO_WALLET");
    }

    let dueAccountId = fullUser.due_account_id;
    let dueWalletId = fullUser.due_wallet_id;

    // Create Due account if first time
    if (!dueAccountId) {
      const nameParts = (fullUser.full_name || "User").split(" ");
      const dueAccount = await createDueAccount({
        email: fullUser.email || `${user.id}@tanda.app`,
        firstName: nameParts[0] || "User",
        lastName: nameParts.slice(1).join(" ") || "Tanda",
      });
      dueAccountId = dueAccount.id;

      // Link wallet
      const wallet = await linkWalletToDue(dueAccountId, fullUser.wallet_address);
      dueWalletId = wallet.id;

      // Save Due IDs to user record
      await supabase
        .from("users")
        .update({ due_account_id: dueAccountId, due_wallet_id: dueWalletId })
        .eq("id", user.id);
    }

    // Get on-ramp quote: NGN → USDC
    const quote = await getOnrampQuote(dueAccountId, amount_ngn.toString());

    // Create transfer using quote token
    const transfer = await createOnrampTransfer(
      dueAccountId,
      quote.token,
      dueWalletId!,
    );

    // Create pending transaction record
    const { data: tx, error: txError } = await supabase
      .from("transactions")
      .insert({
        idempotency_key: idempotencyKey,
        sender_id: null,
        recipient_id: user.id,
        tx_type: "onramp",
        status: "pending",
        amount_usdc: Math.round(parseFloat(quote.destination?.amount || "0") * 1_000_000),
        amount_local: amount_ngn * 100, // kobo
        local_currency: "NGN",
        exchange_rate_at_time: parseFloat(quote.fxRate || "0"),
        metadata: {
          due_transfer_id: transfer.id,
          due_quote_token: quote.token,
          quoted_amount_usdc: Math.round(parseFloat(quote.destination?.amount || "0") * 1_000_000),
          method: method || "bank_transfer",
        },
      })
      .select()
      .single();

    if (txError) throw txError;

    const response = {
      transaction_id: tx.id,
      transfer_id: transfer.id,
      banking_details: transfer.bankingDetails || transfer.source?.bankingDetails,
      quote: {
        source_amount: quote.source?.amount,
        source_currency: "NGN",
        destination_amount: quote.destination?.amount,
        destination_currency: "USDC",
        fx_rate: quote.fxRate,
        fee: quote.fee,
      },
      instructions: "Transfer the exact NGN amount to the bank account provided. Your USDC will be credited automatically.",
    };

    if (idempotencyKey) {
      await saveIdempotencyResult(supabase, idempotencyKey, user.id, 200, response);
    }

    return successResponse(response);
  } catch (error) {
    return errorResponse(error);
  }
});

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, content-type, x-idempotency-key",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
}
