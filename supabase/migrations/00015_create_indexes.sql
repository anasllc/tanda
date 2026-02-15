-- 00015_create_indexes.sql

-- Users
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_privy_did ON users(privy_did);
CREATE INDEX idx_users_wallet ON users(wallet_address);

-- Transactions (most queried table)
CREATE INDEX idx_tx_sender ON transactions(sender_id, created_at DESC);
CREATE INDEX idx_tx_recipient ON transactions(recipient_id, created_at DESC);
CREATE INDEX idx_tx_status ON transactions(status) WHERE status IN ('pending', 'processing');
CREATE INDEX idx_tx_idempotency ON transactions(idempotency_key) WHERE idempotency_key IS NOT NULL;
CREATE INDEX idx_tx_related ON transactions(related_entity_type, related_entity_id);

-- Escrow
CREATE INDEX idx_escrow_phone ON escrow_payments(recipient_phone) WHERE status = 'pending';
CREATE INDEX idx_escrow_claim_token ON escrow_payments(claim_token);
CREATE INDEX idx_escrow_expires ON escrow_payments(expires_at) WHERE status = 'pending';
CREATE INDEX idx_escrow_sender ON escrow_payments(sender_id, created_at DESC);

-- Bill splits
CREATE INDEX idx_split_organizer ON bill_splits(organizer_id, created_at DESC);
CREATE INDEX idx_split_participant ON bill_split_participants(user_id, status);
CREATE INDEX idx_split_participant_split ON bill_split_participants(split_id);

-- Pools
CREATE INDEX idx_pool_organizer ON pools(organizer_id);
CREATE INDEX idx_pool_share ON pools(share_token) WHERE share_token IS NOT NULL;
CREATE INDEX idx_pool_members ON pool_members(user_id);
CREATE INDEX idx_pool_contributions ON pool_contributions(pool_id, created_at DESC);

-- Payment requests
CREATE INDEX idx_request_requester ON payment_requests(requester_id, created_at DESC);
CREATE INDEX idx_request_recipient ON payment_requests(recipient_id, status);

-- Notifications (critical for mobile performance)
CREATE INDEX idx_notif_user_unread ON notifications(user_id, created_at DESC) WHERE is_read = FALSE;
CREATE INDEX idx_notif_user ON notifications(user_id, created_at DESC);

-- Friendships
CREATE INDEX idx_friendship_requester ON friendships(requester_id, status);
CREATE INDEX idx_friendship_addressee ON friendships(addressee_id, status);

-- Bill payments
CREATE INDEX idx_bill_user ON bill_payments(user_id, created_at DESC);

-- Idempotency cleanup
CREATE INDEX idx_idempotency_expires ON idempotency_keys(expires_at);

-- Exchange rates
CREATE INDEX idx_rates_pair ON exchange_rates(base_currency, quote_currency, fetched_at DESC);
