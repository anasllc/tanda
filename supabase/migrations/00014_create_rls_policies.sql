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
