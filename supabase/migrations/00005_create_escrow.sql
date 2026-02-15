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
