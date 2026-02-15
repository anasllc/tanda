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
