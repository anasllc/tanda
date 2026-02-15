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
