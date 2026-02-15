// supabase/functions/_shared/types.ts

export interface User {
  id: string;
  privy_did: string;
  phone: string;
  phone_country_code: string;
  username: string | null;
  username_display: string | null;
  full_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  email: string | null;
  email_verified: boolean;
  wallet_address: string | null;
  due_account_id: string | null;
  due_wallet_id: string | null;
  status: "active" | "suspended" | "deactivated";
  kyc_level: "none" | "email_verified" | "full_kyc" | "enhanced";
  pin_hash: string | null;
  display_currency: string;
  push_token: string | null;
  push_enabled: boolean;
  last_active_at: string;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  idempotency_key: string | null;
  sender_id: string | null;
  recipient_id: string | null;
  tx_type: TxType;
  status: TxStatus;
  amount_usdc: number;
  amount_local: number | null;
  local_currency: string;
  exchange_rate_at_time: number | null;
  fee_usdc: number;
  fee_local: number;
  memo: string | null;
  blockchain_tx_hash: string | null;
  blockchain_status: string | null;
  metadata: Record<string, unknown>;
  related_entity_type: string | null;
  related_entity_id: string | null;
  error_message: string | null;
  created_at: string;
  completed_at: string | null;
  updated_at: string;
}

export type TxType =
  | "send" | "receive" | "escrow_send" | "escrow_claim" | "escrow_refund"
  | "onramp" | "offramp" | "bill_split_pay" | "bill_split_receive"
  | "pool_contribute" | "pool_withdraw"
  | "airtime" | "data" | "electricity" | "cable" | "fee";

export type TxStatus = "pending" | "processing" | "completed" | "failed" | "cancelled" | "expired";

export interface EscrowPayment {
  id: string;
  sender_id: string;
  recipient_phone: string;
  recipient_id: string | null;
  amount_usdc: number;
  fee_usdc: number;
  status: "pending" | "claimed" | "expired" | "cancelled" | "refunded";
  claim_token: string;
  expires_at: string;
  cancellable_until: string;
  transaction_id: string | null;
  created_at: string;
}

export interface BillSplit {
  id: string;
  organizer_id: string;
  title: string;
  total_amount_usdc: number;
  split_type: "equal" | "custom" | "percentage";
  is_complete: boolean;
  created_at: string;
}

export interface Pool {
  id: string;
  organizer_id: string;
  title: string;
  description: string | null;
  pool_type: "open" | "closed" | "recurring";
  target_amount_usdc: number | null;
  collected_amount_usdc: number;
  status: "active" | "completed" | "cancelled";
  share_token: string | null;
  deadline: string | null;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string;
  data: Record<string, unknown>;
  is_read: boolean;
  created_at: string;
}

export interface BankAccount {
  id: string;
  user_id: string;
  bank_name: string;
  bank_code: string;
  account_number: string;
  account_name: string;
  is_verified: boolean;
  is_default: boolean;
  status: "pending" | "verified" | "failed";
  due_reference: string | null;
  due_recipient_id: string | null;
}

export interface PaymentRequest {
  id: string;
  requester_id: string;
  recipient_id: string | null;
  recipient_phone: string | null;
  amount_usdc: number;
  reason: string | null;
  status: "pending" | "paid" | "declined" | "expired" | "partially_paid";
  created_at: string;
}

export interface UserBalance {
  user_id: string;
  available_balance_usdc: number;
  locked_in_escrow_usdc: number;
  pending_incoming_usdc: number;
}
