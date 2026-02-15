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
