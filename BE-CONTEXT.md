# Full-Scale Backend Implementation Prompt — Stablecoin Social Payment Platform

> **Give this entire file to your Claude Code agent as a single prompt.**

---

## ROLE & CONTEXT

You are a senior backend architect implementing the full Supabase backend for a **stablecoin social payment platform** — an Expo React Native app targeting Nigeria and diaspora markets. The app lets users send USDC to anyone via phone number (even unregistered users), split bills, pool funds, pay bills, and on/off-ramp between NGN ↔ USDC.

**Tech stack decisions (non-negotiable):**

- **Database & Edge Functions:** Supabase (PostgreSQL + Edge Functions in Deno/TypeScript)
- **Authentication & Wallets:** Privy Expo SDK (`@privy-io/expo`) — phone OTP login via `useLoginWithSMS`, embedded Ethereum wallets via `useEmbeddedEthereumWallet`
- **Session Protection:** Privy's `AuthBoundary` component (replaces old `Screen.Protected` pattern) wrapping authenticated route groups
- **On-ramp / Off-ramp:** Due (fiat↔crypto provider integrated server-side via Supabase Edge Functions, webhook-driven)
- **Blockchain:** Tempo network (Stripe/Paradigm payments-first L1) for stablecoin transfers — sub-second finality, dedicated payment lanes, fees paid in stablecoins (no native gas token)
  - Chain ID: `42431`
  - RPC: `https://rpc.moderato.tempo.xyz` (testnet — update to mainnet RPC when available)
  - Explorer: `https://explore.tempo.xyz`
  - Token standard: TIP-20 (extends ERC-20 with built-in memos, transfer policies, rewards)
  - pathUSD (first stablecoin): `0x20c0000000000000000000000000000000000000`
  - viem chain: `tempoModerato` from `viem/chains`
  - viem SDK: `import { Actions, Abis } from 'viem/tempo'`
  - Gas fees are paid in any USD-denominated TIP-20 token (e.g., USDC) — NO separate gas token needed
- **SMS:** Termii (primary, Nigeria) with Twilio fallback (international)

---

## IMPORTANT ARCHITECTURAL PRINCIPLES

1. **Privy is the auth source of truth.** Privy issues ES256 JWTs. The Supabase backend verifies Privy JWTs in Edge Functions using the `jose` library against Privy's verification key. Supabase Auth is NOT used for user login — only Supabase's service_role client is used server-side.
2. **No spaghetti code.** Every Edge Function follows the same structure: auth middleware → validation → business logic → response. Shared code lives in `supabase/functions/_shared/`.
3. **Edge Functions are the API layer.** The mobile app calls Edge Functions. Edge Functions use the Supabase service_role client to read/write the database. RLS is a secondary defense layer.
4. **Webhooks are first-class citizens.** Due payment webhooks, blockchain event listeners, and SMS delivery receipts all have dedicated Edge Functions with signature verification.
5. **Idempotency everywhere.** Every mutating endpoint accepts an `idempotency_key` header. Transaction creation is idempotent by design.
6. **All money amounts stored as integers (cents/smallest unit).** USDC amounts are stored as `bigint` representing the smallest unit (6 decimals). NGN amounts stored as `bigint` in kobo.

---

## KEY REFERENCE DOCUMENTATION (consult these if needed)

| Service                                       | Documentation URL                                                                  |
| --------------------------------------------- | ---------------------------------------------------------------------------------- |
| **Privy Expo SDK**                            | `https://docs.privy.io/basics/react-native/setup`                                  |
| **Privy SMS Login**                           | `https://docs.privy.io/guide/expo/authentication/sms`                              |
| **Privy Embedded Wallets**                    | `https://docs.privy.io/wallets/wallets/create/create-a-wallet`                     |
| **Privy AuthBoundary**                        | `https://docs.privy.io/basics/react-native/setup#protect-routes-with-authboundary` |
| **Privy Access Token Verification**           | `https://docs.privy.io/guide/server/authorization/verification`                    |
| **Privy × Due On/Off Ramp Recipe**            | `https://docs.privy.io/recipes/due-on-off-ramp`                                    |
| **Privy × Supabase Recipe**                   | `https://docs.privy.io/recipes/authentication/using-supabase-for-custom-auth`      |
| **Due Network API**                           | `https://due.readme.io/docs/overview`                                              |
| **Due API Base URL**                          | `https://api.due.network/v1`                                                       |
| **Tempo Docs**                                | `https://docs.tempo.xyz/`                                                          |
| **Tempo Connection Details**                  | `https://docs.tempo.xyz/quickstart/connection-details`                             |
| **Tempo EVM Differences**                     | `https://docs.tempo.xyz/quickstart/evm-compatibility`                              |
| **Tempo Predeployed Contracts**               | `https://docs.tempo.xyz/quickstart/predeployed-contracts`                          |
| **Tempo TIP-20 Token Standard**               | `https://docs.tempo.xyz/protocol/tip20/overview`                                   |
| **Tempo Transfer Memos**                      | `https://docs.tempo.xyz/guide/payments/transfer-memos`                             |
| **Tempo Transactions (fee tokens, batching)** | `https://docs.tempo.xyz/guide/tempo-transaction`                                   |
| **Supabase Edge Functions**                   | `https://supabase.com/docs/guides/functions`                                       |
| **Supabase Edge Functions Auth**              | `https://supabase.com/docs/guides/functions/auth`                                  |

---

Create this exact folder structure:

```
supabase/
├── config.toml
├── seed.sql
├── migrations/
│   ├── 00001_create_enums.sql
│   ├── 00002_create_users.sql
│   ├── 00003_create_contacts_friends.sql
│   ├── 00004_create_transactions.sql
│   ├── 00005_create_escrow.sql
│   ├── 00006_create_bill_splits.sql
│   ├── 00007_create_pools.sql
│   ├── 00008_create_payment_requests.sql
│   ├── 00009_create_bill_payments.sql
│   ├── 00010_create_notifications.sql
│   ├── 00011_create_bank_accounts.sql
│   ├── 00012_create_exchange_rates.sql
│   ├── 00013_create_kyc.sql
│   ├── 00014_create_rls_policies.sql
│   ├── 00015_create_indexes.sql
│   ├── 00016_create_functions_triggers.sql
│   └── 00017_create_views.sql
├── functions/
│   ├── _shared/
│   │   ├── auth.ts              # Privy JWT verification middleware
│   │   ├── supabase.ts          # Service-role Supabase client factory
│   │   ├── validation.ts        # Zod schemas + validator helper
│   │   ├── errors.ts            # Standardized error responses
│   │   ├── due-client.ts        # Due API client wrapper
│   │   ├── sms.ts               # Termii/Twilio SMS abstraction
│   │   ├── rates.ts             # Exchange rate fetcher + cache
│   │   ├── fees.ts              # Fee calculation engine
│   │   ├── idempotency.ts       # Idempotency key checker
│   │   ├── blockchain.ts        # Tempo network USDC/TIP-20 contract helpers
│   │   └── types.ts             # Shared TypeScript types
│   │
│   ├── auth-sync/index.ts                # POST — sync Privy user to Supabase on first login
│   ├── username-check/index.ts           # GET  — real-time username availability
│   ├── username-register/index.ts        # POST — claim username
│   ├── profile-update/index.ts           # PATCH — update profile fields
│   ├── profile-get/index.ts              # GET  — get user profile (own or public view)
│   │
│   ├── send-to-registered/index.ts       # POST — send USDC to registered user
│   ├── send-to-unregistered/index.ts     # POST — send USDC to unregistered phone (escrow)
│   ├── claim-payment/index.ts            # POST — claim escrowed payment
│   ├── cancel-escrow/index.ts            # POST — cancel unclaimed escrow (within 1hr)
│   ├── escrow-expiry-cron/index.ts       # CRON — auto-refund expired escrows (7 days)
│   │
│   ├── request-money/index.ts            # POST — create payment request
│   ├── request-respond/index.ts          # POST — pay or decline a request
│   │
│   ├── bill-split-create/index.ts        # POST — create bill split
│   ├── bill-split-pay/index.ts           # POST — pay your share of a split
│   ├── bill-split-remind/index.ts        # POST — send reminder to non-payers
│   ├── bill-split-get/index.ts           # GET  — get split details + statuses
│   │
│   ├── pool-create/index.ts              # POST — create contribution pool
│   ├── pool-contribute/index.ts          # POST — contribute to pool
│   ├── pool-withdraw/index.ts            # POST — organizer withdraws pool funds
│   ├── pool-get/index.ts                 # GET  — get pool details
│   │
│   ├── onramp-initiate/index.ts          # POST — initiate Due on-ramp (bank transfer / card)
│   ├── onramp-webhook/index.ts           # POST — Due webhook for deposit confirmation
│   ├── offramp-initiate/index.ts         # POST — initiate withdrawal to bank
│   ├── offramp-webhook/index.ts          # POST — Due webhook for withdrawal confirmation
│   │
│   ├── bank-account-add/index.ts         # POST — add + verify bank account via Due
│   ├── bank-account-list/index.ts        # GET  — list user's saved bank accounts
│   │
│   ├── buy-airtime/index.ts              # POST — purchase airtime
│   ├── buy-data/index.ts                 # POST — purchase data bundle
│   ├── pay-electricity/index.ts          # POST — pay electricity bill
│   ├── pay-cable/index.ts                # POST — pay cable TV
│   │
│   ├── transactions-list/index.ts        # GET  — paginated transaction history
│   ├── transaction-detail/index.ts       # GET  — single transaction detail
│   │
│   ├── contacts-sync/index.ts            # POST — sync phone contacts, find registered users
│   ├── friend-request/index.ts           # POST — send/accept/decline friend request
│   ├── friends-list/index.ts             # GET  — list friends
│   ├── user-search/index.ts              # GET  — search users by username/phone
│   │
│   ├── notifications-list/index.ts       # GET  — list notifications
│   ├── notifications-read/index.ts       # PATCH — mark notifications as read
│   ├── register-push-token/index.ts      # POST — register Expo push token
│   │
│   ├── exchange-rates/index.ts           # GET  — current exchange rates
│   ├── balance/index.ts                  # GET  — wallet balance breakdown
│   │
│   ├── kyc-submit/index.ts               # POST — submit KYC data
│   ├── kyc-webhook/index.ts              # POST — KYC provider webhook
│   │
│   └── pin-setup/index.ts               # POST — set/verify transaction PIN
```

---

## STEP 2 — DATABASE MIGRATIONS

### Migration 00001: Enums

```sql
-- 00001_create_enums.sql

CREATE TYPE user_status AS ENUM ('active', 'suspended', 'deactivated');
CREATE TYPE kyc_level AS ENUM ('none', 'email_verified', 'full_kyc', 'enhanced');
CREATE TYPE privacy_level AS ENUM ('public', 'friends_only', 'private');
CREATE TYPE tx_type AS ENUM (
  'send', 'receive', 'escrow_send', 'escrow_claim', 'escrow_refund',
  'onramp', 'offramp', 'bill_split_pay', 'bill_split_receive',
  'pool_contribute', 'pool_withdraw',
  'airtime', 'data', 'electricity', 'cable',
  'fee'
);
CREATE TYPE tx_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'cancelled', 'expired');
CREATE TYPE escrow_status AS ENUM ('pending', 'claimed', 'expired', 'cancelled', 'refunded');
CREATE TYPE split_type AS ENUM ('equal', 'custom', 'percentage');
CREATE TYPE split_participant_status AS ENUM ('pending', 'paid', 'declined');
CREATE TYPE pool_type AS ENUM ('open', 'closed', 'recurring');
CREATE TYPE pool_status AS ENUM ('active', 'completed', 'cancelled');
CREATE TYPE payment_request_status AS ENUM ('pending', 'paid', 'declined', 'expired', 'partially_paid');
CREATE TYPE friend_status AS ENUM ('pending', 'accepted', 'declined', 'blocked');
CREATE TYPE notification_type AS ENUM (
  'payment_received', 'payment_sent', 'escrow_created', 'escrow_claimed',
  'escrow_expired', 'split_request', 'split_paid', 'split_reminder',
  'pool_invite', 'pool_contribution', 'pool_target_reached',
  'friend_request', 'friend_accepted',
  'money_request', 'request_paid', 'request_declined',
  'deposit_completed', 'withdrawal_completed', 'withdrawal_failed',
  'security_alert', 'low_balance', 'kyc_status'
);
CREATE TYPE bank_account_status AS ENUM ('pending', 'verified', 'failed');
CREATE TYPE onramp_method AS ENUM ('bank_transfer', 'card', 'mobile_money');
```

### Migration 00002: Users

```sql
-- 00002_create_users.sql

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  privy_did TEXT UNIQUE NOT NULL,                   -- Privy's DID (e.g., "did:privy:xxxx")
  phone TEXT UNIQUE NOT NULL,                        -- E.164 format (+2348012345678)
  phone_country_code TEXT NOT NULL,                  -- e.g., "+234"
  username TEXT UNIQUE,                              -- lowercase, 3-20 chars
  username_display TEXT,                             -- preserves original casing
  username_locked_at TIMESTAMPTZ,                    -- locks 7 days after creation
  full_name TEXT,
  bio TEXT CHECK (char_length(bio) <= 50),
  avatar_url TEXT,
  email TEXT,
  email_verified BOOLEAN DEFAULT FALSE,
  university TEXT,
  city TEXT,
  wallet_address TEXT,                               -- Privy embedded wallet address (Tempo network)
  due_account_id TEXT,                               -- Due Network customer account ID (e.g., "acc_xxx")
  due_wallet_id TEXT,                                -- Due wallet ID linked to Privy wallet (e.g., "wlt_xxx")
  status user_status DEFAULT 'active',
  kyc_level kyc_level DEFAULT 'none',
  pin_hash TEXT,                                     -- bcrypt hash of transaction PIN
  privacy_profile privacy_level DEFAULT 'public',
  privacy_friend_list privacy_level DEFAULT 'friends_only',
  privacy_who_can_send TEXT DEFAULT 'everyone' CHECK (privacy_who_can_send IN ('everyone', 'friends', 'contacts')),
  privacy_who_can_add TEXT DEFAULT 'everyone' CHECK (privacy_who_can_add IN ('everyone', 'friends', 'contacts')),
  privacy_searchable BOOLEAN DEFAULT TRUE,
  display_currency TEXT DEFAULT 'NGN' CHECK (display_currency IN ('NGN', 'USD', 'GBP', 'EUR', 'AED', 'KES', 'GHS')),
  push_token TEXT,                                   -- Expo push notification token
  push_enabled BOOLEAN DEFAULT TRUE,
  last_active_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Username validation trigger
CREATE OR REPLACE FUNCTION validate_username()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.username IS NOT NULL THEN
    -- Enforce format: letters, numbers, underscores only, 3-20 chars
    IF NEW.username !~ '^[a-zA-Z0-9_]{3,20}$' THEN
      RAISE EXCEPTION 'Username must be 3-20 characters: letters, numbers, underscores only';
    END IF;
    -- Store lowercase for uniqueness, preserve display
    NEW.username := lower(NEW.username);
    IF NEW.username_display IS NULL THEN
      NEW.username_display := NEW.username;
    END IF;
    -- Set lock timer on first username set
    IF OLD.username IS NULL AND NEW.username IS NOT NULL THEN
      NEW.username_locked_at := now() + INTERVAL '7 days';
    END IF;
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validate_username
  BEFORE INSERT OR UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION validate_username();

-- Profanity check function (basic — extend with word list)
CREATE OR REPLACE FUNCTION check_profanity(input_text TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  banned_words TEXT[] := ARRAY[
    'admin', 'moderator', 'support', 'official', 'system',
    'fuck', 'shit', 'ass', 'bitch', 'nigga', 'nigger',
    'penis', 'vagina', 'porn', 'sex', 'nude'
    -- Extend this list significantly in production
  ];
  word TEXT;
BEGIN
  FOREACH word IN ARRAY banned_words LOOP
    IF lower(input_text) LIKE '%' || word || '%' THEN
      RETURN TRUE;
    END IF;
  END LOOP;
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;
```

### Migration 00003: Contacts & Friends

```sql
-- 00003_create_contacts_friends.sql

CREATE TABLE friendships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  addressee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status friend_status DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(requester_id, addressee_id),
  CHECK (requester_id <> addressee_id)
);

CREATE TABLE contact_syncs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  phone_hash TEXT NOT NULL,  -- SHA-256 of normalized phone number
  matched_user_id UUID REFERENCES users(id),
  synced_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, phone_hash)
);

-- Favorites for quick-access recipients
CREATE TABLE favorite_recipients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  nickname TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, recipient_id)
);
```

### Migration 00004: Transactions

```sql
-- 00004_create_transactions.sql

CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  idempotency_key TEXT UNIQUE,                       -- prevent duplicate processing
  sender_id UUID REFERENCES users(id),
  recipient_id UUID REFERENCES users(id),
  tx_type tx_type NOT NULL,
  status tx_status DEFAULT 'pending',
  amount_usdc BIGINT NOT NULL CHECK (amount_usdc >= 0),       -- in 6-decimal units (1 USDC = 1000000)
  amount_local BIGINT,                                         -- in smallest local unit (kobo for NGN)
  local_currency TEXT DEFAULT 'NGN',
  exchange_rate_at_time NUMERIC(18, 8),                        -- rate used at transaction time
  fee_usdc BIGINT DEFAULT 0 CHECK (fee_usdc >= 0),
  fee_local BIGINT DEFAULT 0,
  memo TEXT CHECK (char_length(memo) <= 100),
  blockchain_tx_hash TEXT,
  blockchain_status TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,                          -- flexible additional data
  related_entity_type TEXT,                                     -- 'escrow', 'split', 'pool', 'bill_payment'
  related_entity_id UUID,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Idempotency table for all write operations
CREATE TABLE idempotency_keys (
  key TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  response_status INT,
  response_body JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ DEFAULT (now() + INTERVAL '24 hours')
);
```

### Migration 00005: Escrow

```sql
-- 00005_create_escrow.sql

CREATE TABLE escrow_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES users(id),
  recipient_phone TEXT NOT NULL,                   -- E.164 format
  recipient_id UUID REFERENCES users(id),          -- filled when claimed
  amount_usdc BIGINT NOT NULL CHECK (amount_usdc > 0),
  fee_usdc BIGINT DEFAULT 0,
  status escrow_status DEFAULT 'pending',
  claim_token TEXT UNIQUE NOT NULL,                -- secure random token for claim link
  claim_short_url TEXT,                            -- shortened URL for SMS
  sms_sent_at TIMESTAMPTZ,
  sms_delivery_status TEXT,
  claimed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL,                 -- 7 days from creation
  refunded_at TIMESTAMPTZ,
  cancellable_until TIMESTAMPTZ,                   -- 1 hour from creation
  transaction_id UUID REFERENCES transactions(id),
  refund_transaction_id UUID REFERENCES transactions(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### Migration 00006: Bill Splits

```sql
-- 00006_create_bill_splits.sql

CREATE TABLE bill_splits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organizer_id UUID NOT NULL REFERENCES users(id),
  title TEXT NOT NULL,
  total_amount_usdc BIGINT NOT NULL CHECK (total_amount_usdc > 0),
  total_amount_local BIGINT,
  local_currency TEXT DEFAULT 'NGN',
  split_type split_type NOT NULL,
  receipt_image_url TEXT,
  note TEXT CHECK (char_length(note) <= 200),
  payment_deadline TIMESTAMPTZ,
  reminder_frequency_hours INT DEFAULT 24,
  is_complete BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE bill_split_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  split_id UUID NOT NULL REFERENCES bill_splits(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  phone TEXT,                                      -- for unregistered participants
  amount_usdc BIGINT NOT NULL CHECK (amount_usdc > 0),
  amount_local BIGINT,
  percentage NUMERIC(5, 2),                        -- for percentage splits
  item_description TEXT,                           -- for custom splits ("pizza - ₦3000")
  status split_participant_status DEFAULT 'pending',
  paid_at TIMESTAMPTZ,
  transaction_id UUID REFERENCES transactions(id),
  reminder_count INT DEFAULT 0,
  last_reminded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### Migration 00007: Pools

```sql
-- 00007_create_pools.sql

CREATE TABLE pools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organizer_id UUID NOT NULL REFERENCES users(id),
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  pool_type pool_type DEFAULT 'closed',
  target_amount_usdc BIGINT,                       -- NULL = open-ended
  collected_amount_usdc BIGINT DEFAULT 0,
  status pool_status DEFAULT 'active',
  allow_anonymous BOOLEAN DEFAULT FALSE,
  deadline TIMESTAMPTZ,
  share_token TEXT UNIQUE,                         -- for shareable link (open pools)
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE pool_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pool_id UUID NOT NULL REFERENCES pools(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  phone TEXT,                                      -- for invited non-users
  role TEXT DEFAULT 'member' CHECK (role IN ('organizer', 'member')),
  invited_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE pool_contributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pool_id UUID NOT NULL REFERENCES pools(id) ON DELETE CASCADE,
  contributor_id UUID NOT NULL REFERENCES users(id),
  amount_usdc BIGINT NOT NULL CHECK (amount_usdc > 0),
  is_anonymous BOOLEAN DEFAULT FALSE,
  message TEXT CHECK (char_length(message) <= 100),
  transaction_id UUID REFERENCES transactions(id),
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### Migration 00008: Payment Requests

```sql
-- 00008_create_payment_requests.sql

CREATE TABLE payment_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID NOT NULL REFERENCES users(id),
  recipient_id UUID REFERENCES users(id),
  recipient_phone TEXT,
  amount_usdc BIGINT NOT NULL CHECK (amount_usdc > 0),
  amount_local BIGINT,
  local_currency TEXT DEFAULT 'NGN',
  reason TEXT CHECK (char_length(reason) <= 200),
  status payment_request_status DEFAULT 'pending',
  deadline TIMESTAMPTZ,
  paid_amount_usdc BIGINT DEFAULT 0,
  transaction_id UUID REFERENCES transactions(id),
  reminder_count INT DEFAULT 0,
  last_reminded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### Migration 00009: Bill Payments

```sql
-- 00009_create_bill_payments.sql

CREATE TABLE bill_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  bill_type TEXT NOT NULL CHECK (bill_type IN ('airtime', 'data', 'electricity', 'cable')),
  provider TEXT NOT NULL,                          -- 'MTN', 'IKEDC', 'DSTV', etc.
  recipient_identifier TEXT NOT NULL,              -- phone number, meter number, smartcard
  amount_usdc BIGINT NOT NULL,
  amount_local BIGINT NOT NULL,
  local_currency TEXT DEFAULT 'NGN',
  status tx_status DEFAULT 'pending',
  provider_reference TEXT,                         -- token from provider (electricity token, etc.)
  provider_response JSONB,
  transaction_id UUID REFERENCES transactions(id),
  metadata JSONB DEFAULT '{}'::jsonb,              -- plan details, package info, etc.
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Saved bill details for quick reorder
CREATE TABLE saved_bill_recipients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  bill_type TEXT NOT NULL,
  provider TEXT NOT NULL,
  recipient_identifier TEXT NOT NULL,
  label TEXT,                                      -- "My MTN line", "Home electricity"
  last_used_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, bill_type, provider, recipient_identifier)
);
```

### Migration 00010: Notifications

```sql
-- 00010_create_notifications.sql

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  data JSONB DEFAULT '{}'::jsonb,                  -- deep link params, entity IDs, etc.
  is_read BOOLEAN DEFAULT FALSE,
  push_sent BOOLEAN DEFAULT FALSE,
  push_sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### Migration 00011: Bank Accounts

```sql
-- 00011_create_bank_accounts.sql

CREATE TABLE bank_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  bank_name TEXT NOT NULL,
  bank_code TEXT NOT NULL,                         -- CBN bank code
  account_number TEXT NOT NULL,
  account_name TEXT NOT NULL,                      -- verified name from Due
  is_verified BOOLEAN DEFAULT FALSE,
  is_default BOOLEAN DEFAULT FALSE,
  status bank_account_status DEFAULT 'pending',
  due_reference TEXT,                              -- Due's reference for this account
  due_recipient_id TEXT,                           -- Due recipient ID (e.g., "rcp_xxx") for off-ramping
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, bank_code, account_number)
);

-- Ensure only one default per user
CREATE UNIQUE INDEX idx_one_default_bank
  ON bank_accounts(user_id) WHERE is_default = TRUE;
```

### Migration 00012: Exchange Rates

```sql
-- 00012_create_exchange_rates.sql

CREATE TABLE exchange_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  base_currency TEXT NOT NULL DEFAULT 'USDC',
  quote_currency TEXT NOT NULL,                    -- 'NGN', 'USD', 'GBP', etc.
  rate NUMERIC(18, 8) NOT NULL,                    -- 1 USDC = X quote currency
  source TEXT NOT NULL,                            -- 'due', 'coingecko', 'manual'
  fetched_at TIMESTAMPTZ DEFAULT now()
);

-- Only keep latest rate per pair (plus history for auditing)
CREATE INDEX idx_exchange_rates_latest
  ON exchange_rates(base_currency, quote_currency, fetched_at DESC);
```

### Migration 00013: KYC

```sql
-- 00013_create_kyc.sql

CREATE TABLE kyc_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  level kyc_level NOT NULL,
  provider TEXT NOT NULL,                          -- 'smile_id', 'metamap', etc.
  provider_reference TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'expired')),
  data JSONB DEFAULT '{}'::jsonb,                  -- encrypted KYC data
  rejection_reason TEXT,
  submitted_at TIMESTAMPTZ DEFAULT now(),
  reviewed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ
);
```

### Migration 00014: RLS Policies

```sql
-- 00014_create_rls_policies.sql

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE escrow_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE bill_splits ENABLE ROW LEVEL SECURITY;
ALTER TABLE bill_split_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE pools ENABLE ROW LEVEL SECURITY;
ALTER TABLE pool_contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE bill_payments ENABLE ROW LEVEL SECURITY;

-- NOTE: Since Edge Functions use service_role, RLS is a safety net, not the primary gate.
-- These policies protect against accidental data leaks if anon key is ever exposed.

-- Users: can read own row, public profiles visible to all
CREATE POLICY users_own_read ON users FOR SELECT USING (
  id = (current_setting('app.current_user_id', TRUE))::UUID
  OR (privacy_profile = 'public' AND privacy_searchable = TRUE)
);
CREATE POLICY users_own_update ON users FOR UPDATE USING (
  id = (current_setting('app.current_user_id', TRUE))::UUID
);

-- Transactions: only sender or recipient
CREATE POLICY tx_own ON transactions FOR SELECT USING (
  sender_id = (current_setting('app.current_user_id', TRUE))::UUID
  OR recipient_id = (current_setting('app.current_user_id', TRUE))::UUID
);

-- Notifications: only own
CREATE POLICY notif_own ON notifications FOR ALL USING (
  user_id = (current_setting('app.current_user_id', TRUE))::UUID
);

-- Bank accounts: only own
CREATE POLICY bank_own ON bank_accounts FOR ALL USING (
  user_id = (current_setting('app.current_user_id', TRUE))::UUID
);

-- Service role bypasses RLS for Edge Functions
-- Grant full access to service_role (this is the default in Supabase)
```

### Migration 00015: Indexes

```sql
-- 00015_create_indexes.sql

-- Users
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_privy_did ON users(privy_did);
CREATE INDEX idx_users_wallet ON users(wallet_address);

-- Transactions (most queried table)
CREATE INDEX idx_tx_sender ON transactions(sender_id, created_at DESC);
CREATE INDEX idx_tx_recipient ON transactions(recipient_id, created_at DESC);
CREATE INDEX idx_tx_status ON transactions(status) WHERE status IN ('pending', 'processing');
CREATE INDEX idx_tx_idempotency ON transactions(idempotency_key) WHERE idempotency_key IS NOT NULL;
CREATE INDEX idx_tx_related ON transactions(related_entity_type, related_entity_id);

-- Escrow
CREATE INDEX idx_escrow_phone ON escrow_payments(recipient_phone) WHERE status = 'pending';
CREATE INDEX idx_escrow_claim_token ON escrow_payments(claim_token);
CREATE INDEX idx_escrow_expires ON escrow_payments(expires_at) WHERE status = 'pending';
CREATE INDEX idx_escrow_sender ON escrow_payments(sender_id, created_at DESC);

-- Bill splits
CREATE INDEX idx_split_organizer ON bill_splits(organizer_id, created_at DESC);
CREATE INDEX idx_split_participant ON bill_split_participants(user_id, status);
CREATE INDEX idx_split_participant_split ON bill_split_participants(split_id);

-- Pools
CREATE INDEX idx_pool_organizer ON pools(organizer_id);
CREATE INDEX idx_pool_share ON pools(share_token) WHERE share_token IS NOT NULL;
CREATE INDEX idx_pool_members ON pool_members(user_id);
CREATE INDEX idx_pool_contributions ON pool_contributions(pool_id, created_at DESC);

-- Payment requests
CREATE INDEX idx_request_requester ON payment_requests(requester_id, created_at DESC);
CREATE INDEX idx_request_recipient ON payment_requests(recipient_id, status);

-- Notifications (critical for mobile performance)
CREATE INDEX idx_notif_user_unread ON notifications(user_id, created_at DESC) WHERE is_read = FALSE;
CREATE INDEX idx_notif_user ON notifications(user_id, created_at DESC);

-- Friendships
CREATE INDEX idx_friendship_requester ON friendships(requester_id, status);
CREATE INDEX idx_friendship_addressee ON friendships(addressee_id, status);

-- Bill payments
CREATE INDEX idx_bill_user ON bill_payments(user_id, created_at DESC);

-- Idempotency cleanup
CREATE INDEX idx_idempotency_expires ON idempotency_keys(expires_at);

-- Exchange rates
CREATE INDEX idx_rates_pair ON exchange_rates(base_currency, quote_currency, fetched_at DESC);
```

### Migration 00016: Functions & Triggers

```sql
-- 00016_create_functions_triggers.sql

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
DO $$
DECLARE
  t TEXT;
BEGIN
  FOR t IN
    SELECT table_name FROM information_schema.columns
    WHERE column_name = 'updated_at' AND table_schema = 'public'
  LOOP
    EXECUTE format(
      'CREATE TRIGGER trg_updated_%I BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION update_modified_column()',
      t, t
    );
  END LOOP;
END;
$$;

-- Pool contribution auto-update collected amount
CREATE OR REPLACE FUNCTION update_pool_collected()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE pools
  SET collected_amount_usdc = (
    SELECT COALESCE(SUM(amount_usdc), 0) FROM pool_contributions WHERE pool_id = NEW.pool_id
  )
  WHERE id = NEW.pool_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_pool_contribution
  AFTER INSERT ON pool_contributions
  FOR EACH ROW EXECUTE FUNCTION update_pool_collected();

-- Bill split auto-complete check
CREATE OR REPLACE FUNCTION check_split_complete()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM bill_split_participants
    WHERE split_id = NEW.split_id AND status = 'pending'
  ) THEN
    UPDATE bill_splits SET is_complete = TRUE WHERE id = NEW.split_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_split_complete
  AFTER UPDATE ON bill_split_participants
  FOR EACH ROW WHEN (NEW.status = 'paid')
  EXECUTE FUNCTION check_split_complete();

-- Fee calculation function (used by Edge Functions too)
CREATE OR REPLACE FUNCTION calculate_fee(amount_usdc BIGINT, fee_type TEXT)
RETURNS BIGINT AS $$
BEGIN
  CASE fee_type
    WHEN 'send' THEN
      -- 0.5% with minimum 10 cents, max $5
      RETURN GREATEST(10000, LEAST(5000000, (amount_usdc * 5) / 1000));
    WHEN 'withdrawal' THEN
      -- Flat ₦100 for < ₦10k, 0.5% for ₦10k+, cap ₦1000
      -- Converted to USDC equivalent at runtime in Edge Function
      RETURN GREATEST(10000, LEAST(1000000, (amount_usdc * 5) / 1000));
    WHEN 'bill_payment' THEN
      -- 1% with minimum ₦10 equivalent
      RETURN GREATEST(10000, (amount_usdc * 10) / 1000);
    ELSE
      RETURN 0;
  END CASE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;
```

### Migration 00017: Views

```sql
-- 00017_create_views.sql

-- User balance view (computed from transactions)
CREATE OR REPLACE VIEW user_balances AS
SELECT
  u.id AS user_id,
  COALESCE(
    (SELECT SUM(CASE
      WHEN t.recipient_id = u.id AND t.status = 'completed' THEN t.amount_usdc
      WHEN t.sender_id = u.id AND t.status = 'completed' THEN -(t.amount_usdc + t.fee_usdc)
      ELSE 0
    END) FROM transactions t
    WHERE t.sender_id = u.id OR t.recipient_id = u.id),
    0
  ) AS available_balance_usdc,
  COALESCE(
    (SELECT SUM(amount_usdc) FROM escrow_payments
     WHERE sender_id = u.id AND status = 'pending'),
    0
  ) AS locked_in_escrow_usdc,
  COALESCE(
    (SELECT SUM(CASE
      WHEN t.recipient_id = u.id AND t.status = 'pending' THEN t.amount_usdc
      ELSE 0
    END) FROM transactions t WHERE t.recipient_id = u.id),
    0
  ) AS pending_incoming_usdc
FROM users u;

-- Friend list view (bidirectional)
CREATE OR REPLACE VIEW user_friends AS
SELECT
  CASE WHEN f.requester_id = u.id THEN f.addressee_id ELSE f.requester_id END AS friend_id,
  u.id AS user_id,
  f.status,
  f.created_at
FROM friendships f
CROSS JOIN users u
WHERE f.status = 'accepted'
  AND (f.requester_id = u.id OR f.addressee_id = u.id);
```

---

## STEP 3 — SHARED EDGE FUNCTION MODULES

### `_shared/auth.ts` — Privy JWT Verification

```typescript
// supabase/functions/_shared/auth.ts
import * as jose from "https://deno.land/x/jose@v5.2.0/index.ts";

const PRIVY_APP_ID = Deno.env.get("PRIVY_APP_ID")!;
const PRIVY_VERIFICATION_KEY = Deno.env.get("PRIVY_VERIFICATION_KEY")!;

let cachedPublicKey: jose.KeyLike | null = null;

async function getVerificationKey(): Promise<jose.KeyLike> {
  if (cachedPublicKey) return cachedPublicKey;
  cachedPublicKey = await jose.importSPKI(PRIVY_VERIFICATION_KEY, "ES256");
  return cachedPublicKey;
}

export interface AuthContext {
  privyDid: string; // e.g., "did:privy:xxxxx"
  userId?: string; // our internal UUID (set after DB lookup)
}

/**
 * Verifies the Privy access token from the Authorization header.
 * Returns the decoded auth context or throws.
 */
export async function verifyAuth(req: Request): Promise<AuthContext> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    throw new AuthError("Missing or invalid Authorization header", 401);
  }

  const token = authHeader.slice(7);
  try {
    const verificationKey = await getVerificationKey();
    const { payload } = await jose.jwtVerify(token, verificationKey, {
      issuer: "privy.io",
      audience: PRIVY_APP_ID,
    });

    return {
      privyDid: payload.sub as string,
    };
  } catch (error) {
    throw new AuthError("Invalid or expired access token", 401);
  }
}

export class AuthError extends Error {
  status: number;
  constructor(message: string, status: number = 401) {
    super(message);
    this.name = "AuthError";
    this.status = status;
  }
}
```

### `_shared/supabase.ts` — Service-Role Client

```typescript
// supabase/functions/_shared/supabase.ts
import {
  createClient,
  SupabaseClient,
} from "https://esm.sh/@supabase/supabase-js@2";

let client: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (client) return client;
  client = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    {
      auth: { persistSession: false, autoRefreshToken: false },
    },
  );
  return client;
}

/**
 * Looks up the internal user UUID from a Privy DID.
 * Throws if user not found.
 */
export async function getUserByPrivyDid(
  supabase: SupabaseClient,
  privyDid: string,
): Promise<{
  id: string;
  phone: string;
  username: string | null;
  wallet_address: string | null;
  kyc_level: string;
  status: string;
}> {
  const { data, error } = await supabase
    .from("users")
    .select("id, phone, username, wallet_address, kyc_level, status")
    .eq("privy_did", privyDid)
    .single();

  if (error || !data) {
    throw new Error("User not found. Complete onboarding first.");
  }
  if (data.status !== "active") {
    throw new Error("Account is suspended or deactivated.");
  }
  return data;
}
```

### `_shared/validation.ts` — Request Validation

```typescript
// supabase/functions/_shared/validation.ts

// Lightweight validation (no external deps — Zod is heavy for Deno Edge)
export type ValidationRule = {
  field: string;
  type: "string" | "number" | "boolean" | "object" | "array";
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  enum?: string[];
};

export function validate(
  data: Record<string, unknown>,
  rules: ValidationRule[],
): string[] {
  const errors: string[] = [];

  for (const rule of rules) {
    const value = data[rule.field];

    if (value === undefined || value === null || value === "") {
      if (rule.required) errors.push(`${rule.field} is required`);
      continue;
    }

    if (rule.type === "string" && typeof value !== "string") {
      errors.push(`${rule.field} must be a string`);
      continue;
    }
    if (rule.type === "number" && typeof value !== "number") {
      errors.push(`${rule.field} must be a number`);
      continue;
    }

    if (typeof value === "string") {
      if (rule.minLength && value.length < rule.minLength)
        errors.push(
          `${rule.field} must be at least ${rule.minLength} characters`,
        );
      if (rule.maxLength && value.length > rule.maxLength)
        errors.push(
          `${rule.field} must be at most ${rule.maxLength} characters`,
        );
      if (rule.pattern && !rule.pattern.test(value))
        errors.push(`${rule.field} has invalid format`);
      if (rule.enum && !rule.enum.includes(value))
        errors.push(`${rule.field} must be one of: ${rule.enum.join(", ")}`);
    }

    if (typeof value === "number") {
      if (rule.min !== undefined && value < rule.min)
        errors.push(`${rule.field} must be at least ${rule.min}`);
      if (rule.max !== undefined && value > rule.max)
        errors.push(`${rule.field} must be at most ${rule.max}`);
    }
  }

  return errors;
}

// Phone number normalization
export function normalizePhone(phone: string): string {
  let cleaned = phone.replace(/[\s\-\(\)]/g, "");
  if (!cleaned.startsWith("+")) {
    // Default to Nigeria if no country code
    if (cleaned.startsWith("0")) cleaned = "+234" + cleaned.slice(1);
    else cleaned = "+" + cleaned;
  }
  return cleaned;
}

export function isValidE164(phone: string): boolean {
  return /^\+[1-9]\d{6,14}$/.test(phone);
}
```

### `_shared/errors.ts` — Error Handling

```typescript
// supabase/functions/_shared/errors.ts

export class AppError extends Error {
  status: number;
  code: string;

  constructor(
    message: string,
    status: number = 400,
    code: string = "BAD_REQUEST",
  ) {
    super(message);
    this.name = "AppError";
    this.status = status;
    this.code = code;
  }
}

export function errorResponse(error: unknown): Response {
  if (error instanceof AppError) {
    return new Response(
      JSON.stringify({ error: error.message, code: error.code }),
      { status: error.status, headers: { "Content-Type": "application/json" } },
    );
  }

  if (error instanceof Error && error.name === "AuthError") {
    return new Response(
      JSON.stringify({ error: error.message, code: "UNAUTHORIZED" }),
      {
        status: (error as any).status || 401,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  console.error("Unhandled error:", error);
  return new Response(
    JSON.stringify({ error: "Internal server error", code: "INTERNAL_ERROR" }),
    { status: 500, headers: { "Content-Type": "application/json" } },
  );
}

export function successResponse(data: unknown, status: number = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });
}
```

### `_shared/fees.ts` — Fee Calculation

```typescript
// supabase/functions/_shared/fees.ts

// All amounts in USDC smallest units (1 USDC = 1_000_000)
const USDC_UNIT = 1_000_000;

export type FeeType = "send" | "withdrawal" | "bill_payment" | "escrow";

export function calculateFee(amountUsdc: number, feeType: FeeType): number {
  switch (feeType) {
    case "send":
      // 0.5%, min $0.01, max $5
      return Math.max(
        10_000,
        Math.min(5 * USDC_UNIT, Math.floor((amountUsdc * 5) / 1000)),
      );

    case "escrow":
      // Same as send + $0.02 for SMS
      return (
        Math.max(
          10_000,
          Math.min(5 * USDC_UNIT, Math.floor((amountUsdc * 5) / 1000)),
        ) + 20_000
      );

    case "withdrawal":
      // 0.5%, min $0.01, max ~$0.67 (₦1000 equivalent)
      return Math.max(
        10_000,
        Math.min(670_000, Math.floor((amountUsdc * 5) / 1000)),
      );

    case "bill_payment":
      // 1%, min $0.01
      return Math.max(10_000, Math.floor((amountUsdc * 10) / 1000));

    default:
      return 0;
  }
}
```

### `_shared/idempotency.ts`

```typescript
// supabase/functions/_shared/idempotency.ts
import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

export async function checkIdempotency(
  supabase: SupabaseClient,
  key: string | null,
  userId: string,
): Promise<{
  isDuplicate: boolean;
  cachedResponse?: { status: number; body: unknown };
}> {
  if (!key) return { isDuplicate: false };

  const { data } = await supabase
    .from("idempotency_keys")
    .select("response_status, response_body")
    .eq("key", key)
    .eq("user_id", userId)
    .gt("expires_at", new Date().toISOString())
    .single();

  if (data) {
    return {
      isDuplicate: true,
      cachedResponse: {
        status: data.response_status,
        body: data.response_body,
      },
    };
  }

  return { isDuplicate: false };
}

export async function saveIdempotencyResult(
  supabase: SupabaseClient,
  key: string,
  userId: string,
  status: number,
  body: unknown,
): Promise<void> {
  await supabase.from("idempotency_keys").upsert({
    key,
    user_id: userId,
    response_status: status,
    response_body: body,
    expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  });
}
```

### `_shared/sms.ts` — SMS Abstraction

```typescript
// supabase/functions/_shared/sms.ts

const TERMII_API_KEY = Deno.env.get("TERMII_API_KEY");
const TERMII_SENDER_ID = Deno.env.get("TERMII_SENDER_ID") || "StablePay";
const TWILIO_SID = Deno.env.get("TWILIO_ACCOUNT_SID");
const TWILIO_AUTH = Deno.env.get("TWILIO_AUTH_TOKEN");
const TWILIO_FROM = Deno.env.get("TWILIO_FROM_NUMBER");

export async function sendSMS(
  to: string,
  message: string,
): Promise<{ success: boolean; provider: string; messageId?: string }> {
  // Use Termii for Nigerian numbers, Twilio for international
  const isNigerian = to.startsWith("+234");

  if (isNigerian && TERMII_API_KEY) {
    return sendViaTermii(to, message);
  }
  return sendViaTwilio(to, message);
}

async function sendViaTermii(to: string, message: string) {
  try {
    const res = await fetch("https://api.ng.termii.com/api/sms/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to,
        from: TERMII_SENDER_ID,
        sms: message,
        type: "plain",
        channel: "generic",
        api_key: TERMII_API_KEY,
      }),
    });
    const data = await res.json();
    return { success: res.ok, provider: "termii", messageId: data.message_id };
  } catch (error) {
    console.error("Termii SMS failed:", error);
    // Fallback to Twilio
    return sendViaTwilio(to, message);
  }
}

async function sendViaTwilio(to: string, message: string) {
  try {
    const auth = btoa(`${TWILIO_SID}:${TWILIO_AUTH}`);
    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_SID}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          To: to,
          From: TWILIO_FROM!,
          Body: message,
        }),
      },
    );
    const data = await res.json();
    return { success: res.ok, provider: "twilio", messageId: data.sid };
  } catch (error) {
    console.error("Twilio SMS failed:", error);
    return { success: false, provider: "twilio" };
  }
}
```

### `_shared/due-client.ts` — Due Network API Client

Due Network (`api.due.network`) is the fiat on/off-ramp provider. It supports NGN via NIP (Nigerian Interbank Payment), Tempo network for stablecoins, and 80+ other markets. The integration follows Privy's official Due recipe at `https://docs.privy.io/recipes/due-on-off-ramp`.

**Key Due concepts:**

- **Accounts**: Each user needs a Due customer account (created once, stored in our DB)
- **Wallets**: Privy embedded wallets are linked to Due accounts
- **Quotes**: Short-lived (2 min) price quotes for transfers — always fetch fresh before creating a transfer
- **Transfers**: Actual money movement — created using a quote token
- **Virtual Accounts**: Persistent NGN deposit endpoints that auto-convert to USDC on Tempo
- **Recipients**: Bank account details for off-ramping (withdrawal)
- **Due-Account-Id header**: Required on all per-user requests
- **Rail name**: Use `"tempo"` as the blockchain rail in quote/transfer requests. If Due doesn't yet support `"tempo"` as a rail name, try `"base"` (EVM-compatible) or contact Due support for the exact rail identifier. The abstraction in `due-client.ts` makes this a one-line change.

```typescript
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

/** Get an on-ramp quote: NGN (via NIP) → USDC (on Tempo).
 *  The `amount` is in the SOURCE currency (NGN).
 *  Returns a short-lived `token` (2 min expiry) used to create the transfer.
 */
export async function getOnrampQuote(dueAccountId: string, amountNgn: string) {
  return dueRequest("/transfers/quote", "POST", dueAccountId, {
    source: { rail: "nip", currency: "NGN", amount: amountNgn },
    destination: { rail: BLOCKCHAIN_RAIL, currency: "USDC" },
  });
}

/** Get an off-ramp quote: USDC (on Tempo) → NGN (via NIP).
 *  Specify destination amount in NGN, or source amount in USDC.
 */
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

// --- On-Ramp (NGN → USDC) ---

/** Create an on-ramp transfer using a quote token.
 *  `dueWalletId` is the Due wallet ID (e.g., "wlt_xxx") — the USDC destination.
 *  Returns bankingDetails (account number, bank name) for the user to send NGN to.
 */
export async function createOnrampTransfer(
  dueAccountId: string,
  quoteToken: string,
  dueWalletId: string,
) {
  return dueRequest("/transfers", "POST", dueAccountId, {
    quote: quoteToken,
    recipient: dueWalletId, // Privy wallet linked in Due receives the USDC
  });
}

/** Create a persistent NGN virtual account that auto-converts deposits to USDC on Tempo.
 *  Any NGN sent to this account is automatically converted and deposited into the user's wallet.
 *  Ideal for recurring deposits / always-available funding.
 */
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

// --- Off-Ramp (USDC → NGN) ---

/** Create a bank recipient for off-ramping (Nigerian bank account via NIP). */
export async function createRecipient(
  dueAccountId: string,
  params: {
    accountName: string;
    accountNumber: string;
    bankCode: string; // CBN bank code or NIP bank identifier
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

/** Create an off-ramp transfer (USDC → NGN to bank).
 *  `dueWalletId` = sender wallet (user's Privy wallet in Due)
 *  `recipientId` = Due recipient ID (e.g., "rcp_xxx")
 */
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

/** Request a funding address for the transfer (Option B: simpler, no signatures).
 *  User sends exact USDC amount to the returned address; Due processes automatically.
 */
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

/** Request a transfer intent for signature-based off-ramp (Option A: more secure).
 *  Returns `signables` array that must be signed with the Privy wallet.
 */
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

/** Submit signed transfer intent back to Due. */
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

/** Check the status of any transfer. */
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

  // Placeholder — replace with actual HMAC verification:
  // const key = await crypto.subtle.importKey(
  //   "raw", new TextEncoder().encode(DUE_WEBHOOK_SECRET),
  //   { name: "HMAC", hash: "SHA-256" }, false, ["verify"]
  // );
  // const sig = hexToArrayBuffer(signature);
  // return crypto.subtle.verify("HMAC", key, sig, new TextEncoder().encode(rawBody));
  return true;
}
```

---

## STEP 4 — KEY EDGE FUNCTIONS (implement all of them)

### `auth-sync/index.ts` — Post-Login User Sync

This is the first function called after Privy login. It creates or updates the user record.

```typescript
// supabase/functions/auth-sync/index.ts
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { verifyAuth } from "../_shared/auth.ts";
import { getSupabaseAdmin } from "../_shared/supabase.ts";
import { errorResponse, successResponse } from "../_shared/errors.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders() });
  }

  try {
    const auth = await verifyAuth(req);
    const supabase = getSupabaseAdmin();
    const body = await req.json();

    const { phone, wallet_address } = body;

    // Upsert user — creates on first login, updates wallet on subsequent
    const { data: user, error } = await supabase
      .from("users")
      .upsert(
        {
          privy_did: auth.privyDid,
          phone,
          phone_country_code: phone.match(/^\+(\d{1,3})/)?.[0] || "+234",
          wallet_address,
          last_active_at: new Date().toISOString(),
        },
        { onConflict: "privy_did" },
      )
      .select(
        "id, phone, username, wallet_address, kyc_level, display_currency, created_at",
      )
      .single();

    if (error) throw error;

    // Check for any pending escrow payments for this phone number
    const { data: pendingEscrows } = await supabase
      .from("escrow_payments")
      .select("id, amount_usdc, sender_id")
      .eq("recipient_phone", phone)
      .eq("status", "pending");

    // NOTE: Due account creation is deferred to first on-ramp/off-ramp action.
    // When the user first tries to deposit or withdraw, the onramp-initiate or
    // offramp-initiate Edge Function will:
    //   1. Call createDueAccount() if user.due_account_id is null
    //   2. Call linkWalletToDue() to link their Privy wallet
    //   3. Save due_account_id + due_wallet_id to the users table
    // This avoids creating Due accounts for users who never use fiat features.

    return successResponse({
      user,
      pending_claims: pendingEscrows?.length || 0,
      needs_username: !user.username,
      needs_pin: false, // checked separately
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
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
}
```

### `send-to-registered/index.ts` — Core Send Flow

```typescript
// supabase/functions/send-to-registered/index.ts
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { verifyAuth } from "../_shared/auth.ts";
import { getSupabaseAdmin, getUserByPrivyDid } from "../_shared/supabase.ts";
import { errorResponse, successResponse, AppError } from "../_shared/errors.ts";
import {
  validate,
  normalizePhone,
  isValidE164,
} from "../_shared/validation.ts";
import { calculateFee } from "../_shared/fees.ts";
import {
  checkIdempotency,
  saveIdempotencyResult,
} from "../_shared/idempotency.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders() });
  }

  try {
    const auth = await verifyAuth(req);
    const supabase = getSupabaseAdmin();
    const sender = await getUserByPrivyDid(supabase, auth.privyDid);
    const idempotencyKey = req.headers.get("x-idempotency-key");

    // Check idempotency
    const { isDuplicate, cachedResponse } = await checkIdempotency(
      supabase,
      idempotencyKey,
      sender.id,
    );
    if (isDuplicate && cachedResponse) {
      return new Response(JSON.stringify(cachedResponse.body), {
        status: cachedResponse.status,
        headers: { "Content-Type": "application/json" },
      });
    }

    const body = await req.json();

    // Validate input
    const errors = validate(body, [
      { field: "recipient", type: "string", required: true }, // phone or @username
      { field: "amount_usdc", type: "number", required: true, min: 10000 }, // min $0.01
      { field: "memo", type: "string", maxLength: 100 },
      {
        field: "pin",
        type: "string",
        required: true,
        minLength: 4,
        maxLength: 6,
      },
    ]);
    if (errors.length)
      throw new AppError(errors.join("; "), 422, "VALIDATION_ERROR");

    // Verify PIN
    const { data: pinData } = await supabase
      .from("users")
      .select("pin_hash")
      .eq("id", sender.id)
      .single();

    if (!pinData?.pin_hash)
      throw new AppError(
        "Set up your transaction PIN first",
        403,
        "PIN_NOT_SET",
      );
    // In production: use bcrypt to verify. For MVP, simple comparison of hashed value.
    // TODO: Replace with proper bcrypt verify

    // Resolve recipient
    let recipientQuery;
    if (body.recipient.startsWith("@")) {
      recipientQuery = supabase
        .from("users")
        .select("id, phone, username, full_name, wallet_address")
        .eq("username", body.recipient.slice(1).toLowerCase())
        .single();
    } else {
      const phone = normalizePhone(body.recipient);
      if (!isValidE164(phone)) throw new AppError("Invalid phone number", 422);
      recipientQuery = supabase
        .from("users")
        .select("id, phone, username, full_name, wallet_address")
        .eq("phone", phone)
        .single();
    }

    const { data: recipient, error: recipientError } = await recipientQuery;
    if (!recipient)
      throw new AppError(
        "Recipient not found. Use 'send to unregistered' for new users.",
        404,
        "RECIPIENT_NOT_FOUND",
      );
    if (recipient.id === sender.id)
      throw new AppError("Cannot send to yourself", 400);

    // Calculate fee
    const fee = calculateFee(body.amount_usdc, "send");
    const totalDebit = body.amount_usdc + fee;

    // Check balance
    const { data: balance } = await supabase
      .from("user_balances")
      .select("available_balance_usdc")
      .eq("user_id", sender.id)
      .single();
    if (!balance || balance.available_balance_usdc < totalDebit) {
      throw new AppError("Insufficient balance", 400, "INSUFFICIENT_BALANCE");
    }

    // Create transaction (atomic)
    const { data: tx, error: txError } = await supabase
      .from("transactions")
      .insert({
        idempotency_key: idempotencyKey,
        sender_id: sender.id,
        recipient_id: recipient.id,
        tx_type: "send",
        status: "completed", // instant for registered users
        amount_usdc: body.amount_usdc,
        fee_usdc: fee,
        memo: body.memo,
        completed_at: new Date().toISOString(),
        metadata: {
          sender_phone: sender.phone,
          recipient_phone: recipient.phone,
        },
      })
      .select()
      .single();

    if (txError) throw txError;

    // Create notification for recipient
    await supabase.from("notifications").insert({
      user_id: recipient.id,
      type: "payment_received",
      title: "Money Received!",
      body: `${sender.username ? "@" + sender.username : sender.phone} sent you $${(body.amount_usdc / 1_000_000).toFixed(2)}`,
      data: {
        transaction_id: tx.id,
        sender_id: sender.id,
        amount_usdc: body.amount_usdc,
      },
    });

    // TODO: Send push notification via Expo Push API

    const response = {
      transaction: tx,
      fee_usdc: fee,
      new_balance_usdc: balance.available_balance_usdc - totalDebit,
    };

    // Cache idempotency result
    if (idempotencyKey) {
      await saveIdempotencyResult(
        supabase,
        idempotencyKey,
        sender.id,
        200,
        response,
      );
    }

    return successResponse(response);
  } catch (error) {
    return errorResponse(error);
  }
});

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
      "authorization, content-type, x-idempotency-key",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
}
```

### `send-to-unregistered/index.ts` — Escrow Flow

Follow the exact same pattern as `send-to-registered` but:

1. Create an `escrow_payments` record with a `claim_token` (use `crypto.randomUUID()`)
2. Create a transaction with `tx_type: 'escrow_send'` and `status: 'pending'`
3. Send SMS via `_shared/sms.ts` with the claim link: `https://yourdomain.com/claim/{claim_token}`
4. Set `expires_at` to 7 days from now, `cancellable_until` to 1 hour from now
5. Return the escrow ID and status

### `onramp-webhook/index.ts` — Due Deposit Webhook

```typescript
// supabase/functions/onramp-webhook/index.ts
// Called by Due Network when a deposit (on-ramp) transfer status changes.
// config.toml: verify_jwt = false for this function.

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { getSupabaseAdmin } from "../_shared/supabase.ts";
import { verifyDueWebhook } from "../_shared/due-client.ts";
import { errorResponse, successResponse } from "../_shared/errors.ts";

serve(async (req) => {
  try {
    const rawBody = await req.text();
    const signature =
      req.headers.get("x-due-signature") ||
      req.headers.get("x-webhook-signature") ||
      "";

    // Verify webhook signature
    if (!verifyDueWebhook(rawBody, signature)) {
      return new Response("Invalid signature", { status: 401 });
    }

    const payload = JSON.parse(rawBody);
    const supabase = getSupabaseAdmin();

    // Due transfer webhook payload contains the transfer object.
    // Key fields: id (transfer ID), status, source, destination, etc.
    const { id: dueTransferId, status: dueStatus } = payload;

    if (dueStatus === "completed" || dueStatus === "settled") {
      // Find the pending transaction by Due transfer ID stored in metadata
      const { data: tx } = await supabase
        .from("transactions")
        .select("id, recipient_id, metadata")
        .eq("metadata->>due_transfer_id", dueTransferId)
        .eq("status", "pending")
        .single();

      if (tx) {
        // Extract the final USDC amount from Due's response
        const destinationAmount = payload.destination?.amount;
        const amountUsdc = destinationAmount
          ? Math.round(parseFloat(destinationAmount) * 1_000_000)
          : tx.metadata?.quoted_amount_usdc;

        // Update transaction to completed
        await supabase
          .from("transactions")
          .update({
            status: "completed",
            amount_usdc: amountUsdc,
            completed_at: new Date().toISOString(),
            metadata: { ...tx.metadata, due_payload: payload },
          })
          .eq("id", tx.id);

        // Notify user
        await supabase.from("notifications").insert({
          user_id: tx.recipient_id,
          type: "deposit_completed",
          title: "Deposit Confirmed!",
          body: `Your deposit of $${(amountUsdc / 1_000_000).toFixed(2)} USDC has been credited`,
          data: { transaction_id: tx.id, amount_usdc: amountUsdc },
        });

        // TODO: Send push notification via Expo Push API
      }
    } else if (dueStatus === "failed" || dueStatus === "rejected") {
      // Mark transaction as failed
      await supabase
        .from("transactions")
        .update({
          status: "failed",
          error_message: payload.failureReason || "Transfer failed",
          metadata: { due_payload: payload },
        })
        .eq("metadata->>due_transfer_id", dueTransferId)
        .eq("status", "pending");
    }

    return successResponse({ received: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return errorResponse(error);
  }
});
```

---

## STEP 5 — MOBILE APP INTEGRATION LAYER

Create a typed API client for the Expo app. This is NOT an Edge Function — it's a utility file for the mobile app.

Create the file at: `src/lib/api.ts` (or wherever the mobile project structures its services)

```typescript
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
      "username-check",
      "GET",
    ),

  registerUsername: (username: string) =>
    apiFetch("username-register", "POST", { username }),

  updateProfile: (fields: Record<string, unknown>) =>
    apiFetch("profile-update", "PATCH", fields),

  getProfile: (userId?: string) => apiFetch("profile-get", "GET"),

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

  // On/Off Ramp (Due Network)
  initiateOnramp: (amountNgn: number, method: string) =>
    apiFetch("onramp-initiate", "POST", { amount_ngn: amountNgn, method }),
  // Returns: { banking_details: { account_number, bank_name, reference }, quote: { source, destination, fxRate }, transfer_id }

  initiateOfframp: (amountUsdc: number, bankAccountId: string, pin: string) =>
    apiFetch(
      "offramp-initiate",
      "POST",
      { amount_usdc: amountUsdc, bank_account_id: bankAccountId, pin },
      crypto.randomUUID(),
    ),
  // Returns: { quote: { source, destination, fxRate, fee }, transfer_id, estimated_arrival }

  // Bill Splits
  createSplit: (params: any) => apiFetch("bill-split-create", "POST", params),
  paySplit: (splitId: string, pin: string) =>
    apiFetch("bill-split-pay", "POST", { split_id: splitId, pin }),
  getSplit: (splitId: string) =>
    apiFetch(`bill-split-get?id=${splitId}`, "GET"),

  // Pools
  createPool: (params: any) => apiFetch("pool-create", "POST", params),
  contributeToPool: (poolId: string, amount: number, pin: string) =>
    apiFetch("pool-contribute", "POST", {
      pool_id: poolId,
      amount_usdc: amount,
      pin,
    }),

  // Transactions
  getTransactions: (page: number = 1, filters?: Record<string, string>) =>
    apiFetch(`transactions-list?page=${page}`, "GET"),
  getBalance: () => apiFetch("balance", "GET"),

  // Social
  searchUsers: (query: string) => apiFetch(`user-search?q=${query}`, "GET"),
  sendFriendRequest: (userId: string) =>
    apiFetch("friend-request", "POST", {
      addressee_id: userId,
      action: "send",
    }),
  getFriends: () => apiFetch("friends-list", "GET"),

  // Bills
  buyAirtime: (phone: string, amount: number, pin: string) =>
    apiFetch(
      "buy-airtime",
      "POST",
      { phone, amount, pin },
      crypto.randomUUID(),
    ),

  // Notifications
  getNotifications: (page: number = 1) =>
    apiFetch(`notifications-list?page=${page}`, "GET"),
  markNotificationsRead: (ids: string[]) =>
    apiFetch("notifications-read", "PATCH", { ids }),
  registerPushToken: (token: string) =>
    apiFetch("register-push-token", "POST", { token }),

  // Rates
  getExchangeRates: () => apiFetch("exchange-rates", "GET"),

  // PIN
  setupPin: (pin: string) => apiFetch("pin-setup", "POST", { pin }),

  // Bank accounts
  addBankAccount: (bankCode: string, accountNumber: string) =>
    apiFetch("bank-account-add", "POST", {
      bank_code: bankCode,
      account_number: accountNumber,
    }),
  listBankAccounts: () => apiFetch("bank-account-list", "GET"),
};
```

---

## STEP 6 — EXPO APP AUTH STRUCTURE

Set up the Expo Router file structure with Privy's `AuthBoundary`:

```
app/
├── _layout.tsx              ← Root layout: PrivyProvider wraps everything
├── sign-in.tsx              ← Phone OTP login screen
├── onboarding/
│   ├── _layout.tsx
│   ├── username.tsx          ← Username selection
│   └── pin-setup.tsx         ← Transaction PIN setup
└── (app)/
    ├── _layout.tsx           ← AuthBoundary wraps this group
    ├── index.tsx             ← Home dashboard
    ├── send.tsx
    ├── receive.tsx
    ├── history.tsx
    ├── profile.tsx
    └── settings.tsx
```

### Root `_layout.tsx`:

```tsx
import "fast-text-encoding";
import "react-native-get-random-values";
import "@ethersproject/shims";

import { Slot } from "expo-router";
import { PrivyProvider } from "@privy-io/expo";

export default function RootLayout() {
  return (
    <PrivyProvider
      appId={process.env.EXPO_PUBLIC_PRIVY_APP_ID!}
      clientId={process.env.EXPO_PUBLIC_PRIVY_CLIENT_ID!}
    >
      <Slot />
    </PrivyProvider>
  );
}
```

### `(app)/_layout.tsx` — Protected Routes:

```tsx
import { Stack, Redirect } from "expo-router";
import { AuthBoundary } from "@privy-io/expo";
import { ActivityIndicator, View, Text } from "react-native";

export default function AppLayout() {
  return (
    <AuthBoundary
      loading={
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" />
        </View>
      }
      error={(error) => (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Text>Something went wrong: {error.message}</Text>
        </View>
      )}
      unauthenticated={<Redirect href="/sign-in" />}
    >
      <Stack />
    </AuthBoundary>
  );
}
```

### `sign-in.tsx` — Phone OTP Login:

```tsx
import { useState } from "react";
import { View, TextInput, TouchableOpacity, Text } from "react-native";
import { useLoginWithSMS } from "@privy-io/expo";
import { useEmbeddedEthereumWallet } from "@privy-io/expo";
import { useRouter } from "expo-router";
import { api } from "@/lib/api";

export default function SignIn() {
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const router = useRouter();

  const { sendCode, loginWithCode, state } = useLoginWithSMS({
    onLoginSuccess: async (user, isNewUser) => {
      // After Privy login, create embedded wallet if needed
      // Then sync to our backend
      const walletAddress = user.wallet?.address;
      const phoneNumber = user.phone?.number;

      await api.syncUser(phoneNumber!, walletAddress || "");

      if (isNewUser) {
        router.replace("/onboarding/username");
      } else {
        router.replace("/(app)");
      }
    },
  });

  const handleSendCode = async () => {
    const result = await sendCode({ phone });
    if (result.success) setStep("otp");
  };

  const handleVerify = async () => {
    await loginWithCode({ code, phone });
  };

  // ... render UI
}
```

---

## STEP 7 — ENVIRONMENT VARIABLES

Create `.env.example` with all required variables:

```env
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Privy
PRIVY_APP_ID=your-privy-app-id
PRIVY_APP_SECRET=your-privy-app-secret
PRIVY_VERIFICATION_KEY="-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----"

# Due Network (On/Off Ramp — https://api.due.network/v1)
# Get API key at https://www.opendue.com/api
DUE_API_KEY=your-due-api-key
DUE_WEBHOOK_SECRET=your-due-webhook-secret

# SMS
TERMII_API_KEY=your-termii-key
TERMII_SENDER_ID=StablePay
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-auth
TWILIO_FROM_NUMBER=+1234567890

# App
APP_URL=https://yourdomain.com
APP_NAME=StablePay
```

---

## STEP 8 — `config.toml` FUNCTION CONFIGURATION

```toml
[functions.onramp-webhook]
verify_jwt = false

[functions.offramp-webhook]
verify_jwt = false

[functions.kyc-webhook]
verify_jwt = false

[functions.claim-payment]
verify_jwt = false

[functions.escrow-expiry-cron]
verify_jwt = false
```

---

## STEP 9 — IMPLEMENTATION INSTRUCTIONS

Now implement **every** Edge Function listed in Step 1. Follow these rules strictly:

1. **Every function** starts with CORS handling for OPTIONS preflight.
2. **Every authenticated function** calls `verifyAuth(req)` then `getUserByPrivyDid()`.
3. **Every mutating function** accepts `x-idempotency-key` header and checks/saves it.
4. **Every function** uses `errorResponse()` and `successResponse()` from `_shared/errors.ts`.
5. **All database operations** go through the service-role client from `_shared/supabase.ts`.
6. **Pagination** uses cursor-based pagination (not offset) for transaction lists. Page size = 20.
7. **Webhook functions** (Due, KYC) verify signatures before processing. Set `verify_jwt = false` in config.toml.
8. **CRON function** (`escrow-expiry-cron`) queries for expired escrows and auto-refunds them by creating refund transactions.
9. **All phone numbers** are normalized to E.164 format using `normalizePhone()` before any DB operation.
10. **All financial operations** are wrapped in a check for sufficient balance using the `user_balances` view.

### For each remaining Edge Function not fully shown above, follow the same pattern:

- **`username-check`**: Query `users` table for exact match + check profanity. Return `{ available, suggestions }`.
- **`username-register`**: Validate format, check availability, check profanity, update user record.
- **`claim-payment`**: Verify claim token, verify phone matches, update escrow status, create credit transaction, notify sender.
- **`bill-split-create`**: Create split + participants, send notifications to all participants.
- **`bill-split-pay`**: Verify participant, check balance, create transaction, update participant status.
- **`pool-create`**: Create pool + members, generate share_token for open pools.
- **`pool-contribute`**: Verify membership, check balance, create contribution + transaction, check if target reached.
- **`onramp-initiate`**:
  1. Get user's `due_account_id` from DB (create Due account if first time — call `createDueAccount()`, then `linkWalletToDue()`, save both IDs to user record).
  2. Call `getOnrampQuote(dueAccountId, amountNgn)` — returns a `token` and `source`/`destination` amounts with fees.
  3. Call `createOnrampTransfer(dueAccountId, quoteToken, dueWalletId)` — returns `bankingDetails` (account number, bank name for the user to send NGN to).
  4. Create a `pending` transaction record with the Due transfer ID in metadata.
  5. Return the banking details + quote breakdown to the mobile app so the user can transfer NGN from their bank.
  6. Due handles conversion and sends USDC to the user's Privy wallet automatically.
  7. The `onramp-webhook` function updates the transaction to `completed` when Due confirms.

  **Alternative**: Use `createVirtualAccount()` to give users a persistent NGN account number that auto-converts to USDC on every deposit (better UX for recurring deposits).

- **`offramp-initiate`**:
  1. Verify balance, verify PIN.
  2. Check if user has a `due_recipient_id` for the selected bank account — if not, call `createRecipient()` and save the `rcp_xxx` ID.
  3. Call `getOfframpQuote(dueAccountId, { amountUsdc })` — returns quote with NGN amount, fees, and rate.
  4. Call `createOfframpTransfer(dueAccountId, quoteToken, dueWalletId, recipientId)`.
  5. **Use funding address method** (simpler for MVP): call `getFundingAddress()`, then use Privy server-side wallet API to send USDC to the funding address.
  6. **OR use signature-based method** (more secure): call `createTransferIntent()`, sign each `signable` with Privy's `eth_signTypedData_v4` API, then `submitTransferIntent()`.
  7. Create a `processing` transaction record. The `offramp-webhook` updates to `completed` when NGN lands in user's bank.
- **`buy-airtime`**: Verify balance, call bills provider API, create transaction. (Use a bills aggregator API like VTPass or Flutterwave for bill payments.)
- **`transactions-list`**: Paginated, filtered list from `transactions` table. Include sender/recipient names.
- **`balance`**: Return data from `user_balances` view + current exchange rates for display.
- **`exchange-rates`**: Return cached rates, refresh from Due if stale (>30 seconds).
- **`contacts-sync`**: Hash phone numbers, match against `users` table, return matched users.

---

## CRITICAL IMPLEMENTATION NOTES

1. **DO NOT use Supabase Auth** for login. Privy handles all authentication. Supabase is purely database + edge functions.
2. **DO NOT use RLS as the primary security layer.** Edge Functions using service_role bypass RLS. RLS is a safety net.
3. **DO NOT store private keys anywhere.** Privy manages all wallet keys. Your backend never touches them.
4. **DO NOT use `anon` key in Edge Functions.** Always use `service_role` key.
5. **DO implement proper CORS headers** on every Edge Function.
6. **DO implement rate limiting** at the Edge Function level using a simple in-memory counter or the `idempotency_keys` table.
7. **For the MVP/hackathon**: You can simulate blockchain transactions (USDC transfers) at the database level. The actual on-chain settlement via Tempo can be added later. The balance system is ledger-based (sum of transactions), not blockchain-based. When you do integrate on-chain transfers, note these Tempo-specific advantages:
   - **No gas token management**: Fees are paid in USDC/stablecoins directly — users never need a separate token.
   - **Built-in transfer memos**: TIP-20's `transferWithMemo` lets you attach a 32-byte reference (transaction ID, invoice number) to every on-chain transfer for reconciliation. Use `pad(stringToHex('TX-{uuid}'), { size: 32 })`.
   - **Dedicated payment lanes**: Stablecoin transfers get reserved blockspace — fees stay predictably low even during network congestion.
   - **Sub-second finality**: Transactions confirm almost instantly.
   - **viem SDK**: Use `import { Actions } from 'viem/tempo'` for `Actions.token.transferSync()` and other Tempo-native operations.
   - **Chain config**: `import { tempoModerato } from 'viem/chains'` — chain ID 42431, RPC `https://rpc.moderato.tempo.xyz`.
8. **Due Network API integration**: The API base is `https://api.due.network/v1`. All per-user requests require the `Due-Account-Id` header. Follow the Privy × Due recipe exactly: create account → link wallet → get quote → create transfer. For on-ramp, use virtual accounts (persistent NGN deposit endpoints) or per-transfer banking details. For off-ramp, use the funding address method (simpler) or signature-based transfer intent (more secure). The blockchain rail is set to `"tempo"` via the `BLOCKCHAIN_RAIL` constant in `due-client.ts` — if Due doesn't yet support Tempo as a named rail, change this single constant. Reference: `https://docs.privy.io/recipes/due-on-off-ramp`.
9. **Make every Edge Function independently deployable.** No shared state between invocations.
10. **Test each migration incrementally.** Run `supabase db push` after each migration file.

Now implement the complete backend. Start with migrations, then shared modules, then Edge Functions one by one. Do NOT skip any function listed in Step 1.
