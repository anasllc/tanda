-- 00017_create_views.sql

-- User balance view (computed from transactions)
CREATE OR REPLACE VIEW user_balances AS
SELECT
  u.id AS user_id,
  COALESCE(
    (SELECT SUM(CASE
      WHEN t.recipient_id = u.id AND t.status = 'completed' THEN t.amount_usdc
      WHEN t.sender_id = u.id AND t.status = 'completed' THEN -(t.amount_usdc + t.fee_usdc)
      ELSE 0
    END) FROM transactions t
    WHERE t.sender_id = u.id OR t.recipient_id = u.id),
    0
  ) AS available_balance_usdc,
  COALESCE(
    (SELECT SUM(amount_usdc) FROM escrow_payments
     WHERE sender_id = u.id AND status = 'pending'),
    0
  ) AS locked_in_escrow_usdc,
  COALESCE(
    (SELECT SUM(CASE
      WHEN t.recipient_id = u.id AND t.status = 'pending' THEN t.amount_usdc
      ELSE 0
    END) FROM transactions t WHERE t.recipient_id = u.id),
    0
  ) AS pending_incoming_usdc
FROM users u;

-- Friend list view (bidirectional)
CREATE OR REPLACE VIEW user_friends AS
SELECT
  CASE WHEN f.requester_id = u.id THEN f.addressee_id ELSE f.requester_id END AS friend_id,
  u.id AS user_id,
  f.status,
  f.created_at
FROM friendships f
CROSS JOIN users u
WHERE f.status = 'accepted'
  AND (f.requester_id = u.id OR f.addressee_id = u.id);
