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
