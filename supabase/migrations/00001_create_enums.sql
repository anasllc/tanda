-- 00001_create_enums.sql

CREATE TYPE user_status AS ENUM ('active', 'suspended', 'deactivated');
CREATE TYPE kyc_level AS ENUM ('none', 'email_verified', 'full_kyc', 'enhanced');
CREATE TYPE privacy_level AS ENUM ('public', 'friends_only', 'private');
CREATE TYPE tx_type AS ENUM (
  'send', 'receive', 'escrow_send', 'escrow_claim', 'escrow_refund',
  'onramp', 'offramp', 'bill_split_pay', 'bill_split_receive',
  'pool_contribute', 'pool_withdraw',
  'airtime', 'data', 'electricity', 'cable',
  'fee'
);
CREATE TYPE tx_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'cancelled', 'expired');
CREATE TYPE escrow_status AS ENUM ('pending', 'claimed', 'expired', 'cancelled', 'refunded');
CREATE TYPE split_type AS ENUM ('equal', 'custom', 'percentage');
CREATE TYPE split_participant_status AS ENUM ('pending', 'paid', 'declined');
CREATE TYPE pool_type AS ENUM ('open', 'closed', 'recurring');
CREATE TYPE pool_status AS ENUM ('active', 'completed', 'cancelled');
CREATE TYPE payment_request_status AS ENUM ('pending', 'paid', 'declined', 'expired', 'partially_paid');
CREATE TYPE friend_status AS ENUM ('pending', 'accepted', 'declined', 'blocked');
CREATE TYPE notification_type AS ENUM (
  'payment_received', 'payment_sent', 'escrow_created', 'escrow_claimed',
  'escrow_expired', 'split_request', 'split_paid', 'split_reminder',
  'pool_invite', 'pool_contribution', 'pool_target_reached',
  'friend_request', 'friend_accepted',
  'money_request', 'request_paid', 'request_declined',
  'deposit_completed', 'withdrawal_completed', 'withdrawal_failed',
  'security_alert', 'low_balance', 'kyc_status'
);
CREATE TYPE bank_account_status AS ENUM ('pending', 'verified', 'failed');
CREATE TYPE onramp_method AS ENUM ('bank_transfer', 'card', 'mobile_money');
