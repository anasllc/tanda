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
