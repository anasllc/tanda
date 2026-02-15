// src/lib/api.ts — Mobile app API client
import { getAccessToken } from "@privy-io/expo";

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

type HttpMethod = "GET" | "POST" | "PATCH" | "DELETE";

async function apiFetch<T>(
  functionName: string,
  method: HttpMethod = "POST",
  body?: Record<string, unknown>,
  idempotencyKey?: string,
): Promise<T> {
  const accessToken = await getAccessToken();
  if (!accessToken) throw new Error("Not authenticated");

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${accessToken}`,
    apikey: SUPABASE_ANON_KEY,
  };

  if (idempotencyKey) {
    headers["x-idempotency-key"] = idempotencyKey;
  }

  const url = `${SUPABASE_URL}/functions/v1/${functionName}`;
  const response = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new ApiError(
      data.error || "Request failed",
      data.code,
      response.status,
    );
  }

  return data as T;
}

export class ApiError extends Error {
  code: string;
  status: number;
  constructor(message: string, code: string, status: number) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

// === API Methods ===

export const api = {
  // Auth & Profile
  syncUser: (phone: string, walletAddress: string) =>
    apiFetch("auth-sync", "POST", { phone, wallet_address: walletAddress }),

  checkUsername: (username: string) =>
    apiFetch<{ available: boolean; suggestions?: string[] }>(
      `username-check?username=${encodeURIComponent(username)}`,
      "GET",
    ),

  registerUsername: (username: string) =>
    apiFetch("username-register", "POST", { username }),

  updateProfile: (fields: Record<string, unknown>) =>
    apiFetch("profile-update", "PATCH", fields),

  getProfile: (userId?: string) =>
    apiFetch(
      userId ? `profile-get?user_id=${userId}` : "profile-get",
      "GET",
    ),

  // Payments
  sendToRegistered: (
    recipient: string,
    amountUsdc: number,
    memo?: string,
    pin?: string,
  ) =>
    apiFetch(
      "send-to-registered",
      "POST",
      { recipient, amount_usdc: amountUsdc, memo, pin },
      crypto.randomUUID(),
    ),

  sendToUnregistered: (
    phone: string,
    amountUsdc: number,
    memo?: string,
    pin?: string,
  ) =>
    apiFetch(
      "send-to-unregistered",
      "POST",
      { phone, amount_usdc: amountUsdc, memo, pin },
      crypto.randomUUID(),
    ),

  claimPayment: (claimToken: string) =>
    apiFetch("claim-payment", "POST", { claim_token: claimToken }),

  cancelEscrow: (escrowId: string) =>
    apiFetch("cancel-escrow", "POST", { escrow_id: escrowId }),

  // Payment Requests
  requestMoney: (recipient: string, amountUsdc: number, reason?: string) =>
    apiFetch("request-money", "POST", {
      recipient,
      amount_usdc: amountUsdc,
      reason,
    }),

  respondToRequest: (requestId: string, action: "pay" | "decline", pin?: string) =>
    apiFetch("request-respond", "POST", {
      request_id: requestId,
      action,
      pin,
    }),

  // On/Off Ramp (Due Network)
  initiateOnramp: (amountNgn: number, method: string) =>
    apiFetch("onramp-initiate", "POST", { amount_ngn: amountNgn, method }),

  initiateOfframp: (amountUsdc: number, bankAccountId: string, pin: string) =>
    apiFetch(
      "offramp-initiate",
      "POST",
      { amount_usdc: amountUsdc, bank_account_id: bankAccountId, pin },
      crypto.randomUUID(),
    ),

  // Bill Splits
  createSplit: (params: {
    title: string;
    total_amount_usdc: number;
    split_type: "equal" | "custom" | "percentage";
    participants: Array<{
      user_id?: string;
      phone?: string;
      amount_usdc?: number;
      percentage?: number;
    }>;
    note?: string;
    payment_deadline?: string;
  }) => apiFetch("bill-split-create", "POST", params),

  paySplit: (splitId: string, pin: string) =>
    apiFetch(
      "bill-split-pay",
      "POST",
      { split_id: splitId, pin },
      crypto.randomUUID(),
    ),

  remindSplit: (splitId: string) =>
    apiFetch("bill-split-remind", "POST", { split_id: splitId }),

  getSplit: (splitId: string) =>
    apiFetch(`bill-split-get?id=${splitId}`, "GET"),

  // Pools
  createPool: (params: {
    title: string;
    description?: string;
    pool_type?: "open" | "closed" | "recurring";
    target_amount_usdc?: number;
    deadline?: string;
    allow_anonymous?: boolean;
    members?: Array<{ user_id?: string; phone?: string }>;
  }) => apiFetch("pool-create", "POST", params),

  contributeToPool: (
    poolId: string,
    amount: number,
    pin: string,
    message?: string,
    isAnonymous?: boolean,
  ) =>
    apiFetch(
      "pool-contribute",
      "POST",
      {
        pool_id: poolId,
        amount_usdc: amount,
        pin,
        message,
        is_anonymous: isAnonymous,
      },
      crypto.randomUUID(),
    ),

  withdrawFromPool: (poolId: string, pin: string, amountUsdc?: number) =>
    apiFetch("pool-withdraw", "POST", {
      pool_id: poolId,
      pin,
      amount_usdc: amountUsdc,
    }),

  getPool: (poolId?: string, shareToken?: string) =>
    apiFetch(
      poolId
        ? `pool-get?id=${poolId}`
        : `pool-get?share_token=${shareToken}`,
      "GET",
    ),

  // Transactions
  getTransactions: (params?: {
    page?: number;
    type?: string;
    status?: string;
    cursor?: string;
  }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", params.page.toString());
    if (params?.type) searchParams.set("type", params.type);
    if (params?.status) searchParams.set("status", params.status);
    if (params?.cursor) searchParams.set("cursor", params.cursor);
    return apiFetch(`transactions-list?${searchParams.toString()}`, "GET");
  },

  getTransactionDetail: (txId: string) =>
    apiFetch(`transaction-detail?id=${txId}`, "GET"),

  getBalance: () => apiFetch("balance", "GET"),

  // Social
  syncContacts: (phoneNumbers: string[]) =>
    apiFetch("contacts-sync", "POST", { phone_numbers: phoneNumbers }),

  searchUsers: (query: string) =>
    apiFetch(`user-search?q=${encodeURIComponent(query)}`, "GET"),

  sendFriendRequest: (userId: string) =>
    apiFetch("friend-request", "POST", {
      addressee_id: userId,
      action: "send",
    }),

  respondToFriendRequest: (userId: string, action: "accept" | "decline") =>
    apiFetch("friend-request", "POST", {
      addressee_id: userId,
      action,
    }),

  blockUser: (userId: string) =>
    apiFetch("friend-request", "POST", {
      addressee_id: userId,
      action: "block",
    }),

  unfriend: (userId: string) =>
    apiFetch("friend-request", "POST", {
      addressee_id: userId,
      action: "unfriend",
    }),

  getFriends: (status?: string, page?: number) => {
    const searchParams = new URLSearchParams();
    if (status) searchParams.set("status", status);
    if (page) searchParams.set("page", page.toString());
    return apiFetch(`friends-list?${searchParams.toString()}`, "GET");
  },

  // Bills
  buyAirtime: (phone: string, network: string, amountLocal: number, pin: string) =>
    apiFetch(
      "buy-airtime",
      "POST",
      { phone, network, amount_local: amountLocal, pin },
      crypto.randomUUID(),
    ),

  buyData: (
    phone: string,
    network: string,
    planId: string,
    amountLocal: number,
    pin: string,
  ) =>
    apiFetch(
      "buy-data",
      "POST",
      { phone, network, plan_id: planId, amount_local: amountLocal, pin },
      crypto.randomUUID(),
    ),

  payElectricity: (
    meterNumber: string,
    provider: string,
    amountLocal: number,
    meterType: "prepaid" | "postpaid",
    pin: string,
  ) =>
    apiFetch(
      "pay-electricity",
      "POST",
      {
        meter_number: meterNumber,
        provider,
        amount_local: amountLocal,
        meter_type: meterType,
        pin,
      },
      crypto.randomUUID(),
    ),

  payCable: (
    smartcardNumber: string,
    provider: string,
    packageCode: string,
    amountLocal: number,
    pin: string,
  ) =>
    apiFetch(
      "pay-cable",
      "POST",
      {
        smartcard_number: smartcardNumber,
        provider,
        package_code: packageCode,
        amount_local: amountLocal,
        pin,
      },
      crypto.randomUUID(),
    ),

  // Notifications
  getNotifications: (params?: { page?: number; cursor?: string; unreadOnly?: boolean }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", params.page.toString());
    if (params?.cursor) searchParams.set("cursor", params.cursor);
    if (params?.unreadOnly) searchParams.set("unread_only", "true");
    return apiFetch(`notifications-list?${searchParams.toString()}`, "GET");
  },

  markNotificationsRead: (ids?: string[], all?: boolean) =>
    apiFetch("notifications-read", "PATCH", all ? { all: true } : { ids }),

  registerPushToken: (token: string) =>
    apiFetch("register-push-token", "POST", { token }),

  // Rates
  getExchangeRates: () => apiFetch("exchange-rates", "GET"),

  // PIN
  setupPin: (pin: string) => apiFetch("pin-setup", "POST", { pin, action: "set" }),
  verifyPin: (pin: string) => apiFetch("pin-setup", "POST", { pin, action: "verify" }),

  // Bank accounts
  addBankAccount: (bankCode: string, accountNumber: string, bankName?: string) =>
    apiFetch("bank-account-add", "POST", {
      bank_code: bankCode,
      account_number: accountNumber,
      bank_name: bankName,
    }),

  listBankAccounts: () => apiFetch("bank-account-list", "GET"),

  // KYC
  submitKyc: (level: string, data: Record<string, unknown>) =>
    apiFetch("kyc-submit", "POST", { level, data }),
};
