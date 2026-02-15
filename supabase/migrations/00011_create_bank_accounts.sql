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
