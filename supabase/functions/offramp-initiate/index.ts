// supabase/functions/offramp-initiate/index.ts
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { verifyAuth } from "../_shared/auth.ts";
import { getSupabaseAdmin, getUserByPrivyDid } from "../_shared/supabase.ts";
import { errorResponse, successResponse, AppError } from "../_shared/errors.ts";
import {
  getOfframpQuote,
  createOfframpTransfer,
  getFundingAddress,
  createRecipient,
} from "../_shared/due-client.ts";
import { calculateFee } from "../_shared/fees.ts";
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
    const { amount_usdc, bank_account_id, pin } = body;

    if (!amount_usdc || amount_usdc < 100000) {
      throw new AppError("amount_usdc must be at least 100000 ($0.10)", 422);
    }
    if (!bank_account_id) throw new AppError("bank_account_id is required", 422);
    if (!pin) throw new AppError("PIN is required", 422);

    // Verify PIN
    const { data: pinData } = await supabase
      .from("users")
      .select("pin_hash")
      .eq("id", user.id)
      .single();
    if (!pinData?.pin_hash) throw new AppError("Set up your transaction PIN first", 403, "PIN_NOT_SET");

    // Get full user record
    const { data: fullUser } = await supabase
      .from("users")
      .select("due_account_id, due_wallet_id, wallet_address, full_name")
      .eq("id", user.id)
      .single();

    if (!fullUser?.due_account_id || !fullUser?.due_wallet_id) {
      throw new AppError("Due account not set up. Make a deposit first.", 400, "NO_DUE_ACCOUNT");
    }

    // Get bank account
    const { data: bankAccount } = await supabase
      .from("bank_accounts")
      .select("*")
      .eq("id", bank_account_id)
      .eq("user_id", user.id)
      .single();

    if (!bankAccount) throw new AppError("Bank account not found", 404);

    // Calculate fee and check balance
    const fee = calculateFee(amount_usdc, "withdrawal");
    const totalDebit = amount_usdc + fee;

    const { data: balance } = await supabase
      .from("user_balances")
      .select("available_balance_usdc")
      .eq("user_id", user.id)
      .single();
    if (!balance || balance.available_balance_usdc < totalDebit) {
      throw new AppError("Insufficient balance", 400, "INSUFFICIENT_BALANCE");
    }

    // Create Due recipient if not already created
    let recipientId = bankAccount.due_recipient_id;
    if (!recipientId) {
      const nameParts = (fullUser.full_name || bankAccount.account_name).split(" ");
      const recipient = await createRecipient(fullUser.due_account_id, {
        accountName: bankAccount.account_name,
        accountNumber: bankAccount.account_number,
        bankCode: bankAccount.bank_code,
        firstName: nameParts[0] || "User",
        lastName: nameParts.slice(1).join(" ") || "",
      });
      recipientId = recipient.id;

      await supabase
        .from("bank_accounts")
        .update({ due_recipient_id: recipientId })
        .eq("id", bankAccount.id);
    }

    // Get off-ramp quote
    const amountUsdcStr = (amount_usdc / 1_000_000).toFixed(6);
    const quote = await getOfframpQuote(fullUser.due_account_id, { amountUsdc: amountUsdcStr });

    // Create transfer
    const transfer = await createOfframpTransfer(
      fullUser.due_account_id,
      quote.token,
      fullUser.due_wallet_id,
      recipientId,
    );

    // Get funding address (simpler approach for MVP)
    const fundingInfo = await getFundingAddress(fullUser.due_account_id, transfer.id);

    // Create processing transaction
    const { data: tx, error: txError } = await supabase
      .from("transactions")
      .insert({
        idempotency_key: idempotencyKey,
        sender_id: user.id,
        recipient_id: null,
        tx_type: "offramp",
        status: "processing",
        amount_usdc,
        amount_local: Math.round(parseFloat(quote.destination?.amount || "0") * 100), // kobo
        local_currency: "NGN",
        exchange_rate_at_time: parseFloat(quote.fxRate || "0"),
        fee_usdc: fee,
        metadata: {
          due_transfer_id: transfer.id,
          bank_account_id: bankAccount.id,
          bank_name: bankAccount.bank_name,
          account_number: bankAccount.account_number,
          funding_address: fundingInfo.address,
        },
      })
      .select()
      .single();

    if (txError) throw txError;

    const response = {
      transaction_id: tx.id,
      transfer_id: transfer.id,
      quote: {
        source_amount: amountUsdcStr,
        source_currency: "USDC",
        destination_amount: quote.destination?.amount,
        destination_currency: "NGN",
        fx_rate: quote.fxRate,
        fee_usdc: fee,
      },
      funding_address: fundingInfo.address,
      bank_account: {
        bank_name: bankAccount.bank_name,
        account_number: bankAccount.account_number,
        account_name: bankAccount.account_name,
      },
      estimated_arrival: "5-30 minutes",
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
