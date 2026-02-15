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
      RETURN GREATEST(10000, LEAST(1000000, (amount_usdc * 5) / 1000));
    WHEN 'bill_payment' THEN
      -- 1% with minimum ₦10 equivalent
      RETURN GREATEST(10000, (amount_usdc * 10) / 1000);
    ELSE
      RETURN 0;
  END CASE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;
