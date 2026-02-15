// supabase/functions/_shared/due-client.ts

const DUE_API_URL = "https://api.due.network/v1";
const DUE_API_KEY = Deno.env.get("DUE_API_KEY")!;
const DUE_WEBHOOK_SECRET = Deno.env.get("DUE_WEBHOOK_SECRET")!;

// Tempo blockchain rail identifier for Due API.
// If Due doesn't yet support "tempo" as a rail, fall back to the EVM-compatible identifier
// they provide (e.g., "base", "ethereum"). This is the ONLY place to change it.
const BLOCKCHAIN_RAIL = "tempo";

// --- Core request helper ---

async function dueRequest(
  path: string,
  method: string,
  dueAccountId?: string,
  body?: unknown,
) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${DUE_API_KEY}`,
  };
  if (dueAccountId) {
    headers["Due-Account-Id"] = dueAccountId;
  }

  const res = await fetch(`${DUE_API_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(`Due API error [${res.status}]: ${JSON.stringify(data)}`);
  }
  return data;
}

// --- Account Management ---

/** Create a Due customer account for a new user. Store the returned `id` as `due_account_id` in your users table. */
export async function createDueAccount(params: {
  email: string;
  firstName: string;
  lastName: string;
}) {
  return dueRequest("/accounts", "POST", undefined, {
    type: "individual",
    email: params.email,
    details: {
      firstName: params.firstName,
      lastName: params.lastName,
    },
  });
}

/** Link a Privy embedded wallet address to the user's Due account. Store the returned wallet `id` (e.g., "wlt_xxx") as `due_wallet_id`. */
export async function linkWalletToDue(
  dueAccountId: string,
  walletAddress: string,
) {
  return dueRequest("/wallets", "POST", dueAccountId, {
    address: walletAddress,
  });
}

// --- Quotes ---

/** Get an on-ramp quote: NGN (via NIP) -> USDC (on Tempo). */
export async function getOnrampQuote(dueAccountId: string, amountNgn: string) {
  return dueRequest("/transfers/quote", "POST", dueAccountId, {
    source: { rail: "nip", currency: "NGN", amount: amountNgn },
    destination: { rail: BLOCKCHAIN_RAIL, currency: "USDC" },
  });
}

/** Get an off-ramp quote: USDC (on Tempo) -> NGN (via NIP). */
export async function getOfframpQuote(
  dueAccountId: string,
  params: { amountUsdc?: string; amountNgn?: string },
) {
  const source: Record<string, string> = {
    rail: BLOCKCHAIN_RAIL,
    currency: "USDC",
  };
  const destination: Record<string, string> = { rail: "nip", currency: "NGN" };

  if (params.amountUsdc) source.amount = params.amountUsdc;
  if (params.amountNgn) destination.amount = params.amountNgn;

  return dueRequest("/transfers/quote", "POST", dueAccountId, {
    source,
    destination,
  });
}

// --- On-Ramp (NGN -> USDC) ---

export async function createOnrampTransfer(
  dueAccountId: string,
  quoteToken: string,
  dueWalletId: string,
) {
  return dueRequest("/transfers", "POST", dueAccountId, {
    quote: quoteToken,
    recipient: dueWalletId,
  });
}

export async function createVirtualAccount(
  dueAccountId: string,
  dueWalletId: string,
  reference: string,
) {
  return dueRequest("/virtual_accounts", "POST", dueAccountId, {
    destination: dueWalletId,
    schemaIn: "bank_nip",
    currencyIn: "NGN",
    railOut: BLOCKCHAIN_RAIL,
    currencyOut: "USDC",
    reference,
  });
}

// --- Off-Ramp (USDC -> NGN) ---

export async function createRecipient(
  dueAccountId: string,
  params: {
    accountName: string;
    accountNumber: string;
    bankCode: string;
    firstName: string;
    lastName: string;
  },
) {
  return dueRequest("/recipients", "POST", dueAccountId, {
    name: params.accountName,
    details: {
      schema: "bank_nip",
      accountType: "individual",
      firstName: params.firstName,
      lastName: params.lastName,
      accountNumber: params.accountNumber,
      bankCode: params.bankCode,
    },
  });
}

export async function createOfframpTransfer(
  dueAccountId: string,
  quoteToken: string,
  dueWalletId: string,
  recipientId: string,
  memo?: string,
) {
  return dueRequest("/transfers", "POST", dueAccountId, {
    quote: quoteToken,
    sender: dueWalletId,
    recipient: recipientId,
    memo: memo || undefined,
  });
}

export async function getFundingAddress(
  dueAccountId: string,
  transferId: string,
) {
  return dueRequest(
    `/transfers/${transferId}/funding_address`,
    "POST",
    dueAccountId,
  );
}

export async function createTransferIntent(
  dueAccountId: string,
  transferId: string,
) {
  return dueRequest(
    `/transfers/${transferId}/transfer_intent`,
    "POST",
    dueAccountId,
  );
}

export async function submitTransferIntent(
  dueAccountId: string,
  signedIntent: unknown,
) {
  return dueRequest(
    "/transfer_intents/submit",
    "POST",
    dueAccountId,
    signedIntent,
  );
}

// --- Transfer Status ---

export async function getTransferStatus(
  dueAccountId: string,
  transferId: string,
) {
  return dueRequest(`/transfers/${transferId}`, "GET", dueAccountId);
}

// --- FX Rates ---

/** Get live exchange rate from Due's FX engine. */
export async function getExchangeRate(
  sourceCurrency: string,
  destCurrency: string,
) {
  return dueRequest(
    `/fx/rate?source=${sourceCurrency}&destination=${destCurrency}`,
    "GET",
  );
}

// --- Webhook Verification ---

export function verifyDueWebhook(rawBody: string, signature: string): boolean {
  // Due uses HMAC-SHA256 for webhook signatures.
  // Verify against DUE_WEBHOOK_SECRET.
  // TODO: Implement using Deno's crypto.subtle once Due documents exact signing scheme.
  // For now, at minimum validate the signature header exists.
  if (!signature || !DUE_WEBHOOK_SECRET) return false;

  // Placeholder -- replace with actual HMAC verification:
  // const key = await crypto.subtle.importKey(
  //   "raw", new TextEncoder().encode(DUE_WEBHOOK_SECRET),
  //   { name: "HMAC", hash: "SHA-256" }, false, ["verify"]
  // );
  // const sig = hexToArrayBuffer(signature);
  // return crypto.subtle.verify("HMAC", key, sig, new TextEncoder().encode(rawBody));
  return true;
}
