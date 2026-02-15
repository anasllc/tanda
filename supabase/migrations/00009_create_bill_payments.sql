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
