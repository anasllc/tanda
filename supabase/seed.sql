-- Seed data for development/testing
-- Run after all migrations: supabase db reset

-- Insert default exchange rates
INSERT INTO exchange_rates (base_currency, quote_currency, rate, source) VALUES
  ('USDC', 'NGN', 1580.00, 'manual'),
  ('USDC', 'USD', 1.00, 'manual'),
  ('USDC', 'GBP', 0.79, 'manual'),
  ('USDC', 'EUR', 0.92, 'manual'),
  ('USDC', 'AED', 3.67, 'manual'),
  ('USDC', 'KES', 153.50, 'manual'),
  ('USDC', 'GHS', 15.80, 'manual');

-- Insert test users (for development only)
INSERT INTO users (id, privy_did, phone, phone_country_code, username, username_display, full_name, bio, wallet_address, status, kyc_level, pin_hash) VALUES
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'did:privy:test_chioma', '+2348012345678', '+234', 'chioma_unilag', 'chioma_unilag', 'Chioma Okafor', 'Lagos girl living life', '0x1234567890abcdef1234567890abcdef12345678', 'active', 'email_verified', NULL),
  ('b2c3d4e5-f6a7-8901-bcde-f12345678901', 'did:privy:test_emeka', '+2348023456789', '+234', 'emeka_tech', 'emeka_tech', 'Emeka Nwosu', 'Software developer', '0x2345678901abcdef2345678901abcdef23456789', 'active', 'email_verified', NULL),
  ('c3d4e5f6-a7b8-9012-cdef-123456789012', 'did:privy:test_ngozi', '+2348034567890', '+234', 'ngozi_abuja', 'ngozi_abuja', 'Ngozi Eze', 'Abuja babe', '0x3456789012abcdef3456789012abcdef34567890', 'active', 'none', NULL),
  ('d4e5f6a7-b8c9-0123-defa-234567890123', 'did:privy:test_chidi', '+2348045678901', '+234', 'chidi_lagos', 'chidi_lagos', 'Chidi Amaechi', 'Finance bro', '0x4567890123abcdef4567890123abcdef45678901', 'active', 'full_kyc', NULL),
  ('e5f6a7b8-c9d0-1234-efab-345678901234', 'did:privy:test_amara', '+2348056789012', '+234', 'amara_ph', 'amara_ph', 'Amara Obi', 'Port Harcourt finest', '0x5678901234abcdef5678901234abcdef56789012', 'active', 'none', NULL);

-- Insert friendships between test users
INSERT INTO friendships (requester_id, addressee_id, status) VALUES
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'b2c3d4e5-f6a7-8901-bcde-f12345678901', 'accepted'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'c3d4e5f6-a7b8-9012-cdef-123456789012', 'accepted'),
  ('b2c3d4e5-f6a7-8901-bcde-f12345678901', 'd4e5f6a7-b8c9-0123-defa-234567890123', 'accepted'),
  ('c3d4e5f6-a7b8-9012-cdef-123456789012', 'e5f6a7b8-c9d0-1234-efab-345678901234', 'pending');

-- Insert sample transactions for test users
INSERT INTO transactions (sender_id, recipient_id, tx_type, status, amount_usdc, amount_local, local_currency, exchange_rate_at_time, fee_usdc, memo, completed_at) VALUES
  -- Chioma sends to Emeka
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'b2c3d4e5-f6a7-8901-bcde-f12345678901', 'send', 'completed', 5000000, 7900000, 'NGN', 1580.00, 25000, 'For lunch yesterday', now() - interval '2 hours'),
  -- Emeka sends to Chioma
  ('b2c3d4e5-f6a7-8901-bcde-f12345678901', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'send', 'completed', 10000000, 15800000, 'NGN', 1580.00, 50000, 'Your share of Uber', now() - interval '1 day'),
  -- Chioma deposits (on-ramp)
  (NULL, 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'onramp', 'completed', 50000000, 79000000, 'NGN', 1580.00, 0, NULL, now() - interval '3 days'),
  -- Chidi sends to Ngozi
  ('d4e5f6a7-b8c9-0123-defa-234567890123', 'c3d4e5f6-a7b8-9012-cdef-123456789012', 'send', 'completed', 3000000, 4740000, 'NGN', 1580.00, 15000, 'Data money', now() - interval '5 hours'),
  -- Chioma buys airtime
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', NULL, 'airtime', 'completed', 632911, 100000, 'NGN', 1580.00, 6329, NULL, now() - interval '12 hours'),
  -- Pending send
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'e5f6a7b8-c9d0-1234-efab-345678901234', 'send', 'pending', 2000000, 3160000, 'NGN', 1580.00, 10000, 'Birthday gift', NULL);

-- Insert sample notifications
INSERT INTO notifications (user_id, type, title, body, data) VALUES
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'payment_received', 'Money Received!', '@emeka_tech sent you $10.00', '{"amount_usdc": 10000000}'::jsonb),
  ('b2c3d4e5-f6a7-8901-bcde-f12345678901', 'payment_received', 'Money Received!', '@chioma_unilag sent you $5.00', '{"amount_usdc": 5000000}'::jsonb),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'deposit_completed', 'Deposit Confirmed!', 'Your deposit of $50.00 USDC has been credited', '{"amount_usdc": 50000000}'::jsonb),
  ('c3d4e5f6-a7b8-9012-cdef-123456789012', 'friend_request', 'Friend Request', '@amara_ph wants to be your friend', '{"from_user_id": "e5f6a7b8-c9d0-1234-efab-345678901234"}'::jsonb);

-- Insert sample bank accounts
INSERT INTO bank_accounts (user_id, bank_name, bank_code, account_number, account_name, is_verified, is_default, status) VALUES
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'GTBank', '058', '0123456789', 'CHIOMA OKAFOR', true, true, 'verified'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Access Bank', '044', '9876543210', 'CHIOMA OKAFOR', true, false, 'verified'),
  ('b2c3d4e5-f6a7-8901-bcde-f12345678901', 'First Bank', '011', '1234567890', 'EMEKA NWOSU', true, true, 'verified');
