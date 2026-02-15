-- 00002_create_users.sql

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  privy_did TEXT UNIQUE NOT NULL,                   -- Privy's DID (e.g., "did:privy:xxxx")
  phone TEXT UNIQUE NOT NULL,                        -- E.164 format (+2348012345678)
  phone_country_code TEXT NOT NULL,                  -- e.g., "+234"
  username TEXT UNIQUE,                              -- lowercase, 3-20 chars
  username_display TEXT,                             -- preserves original casing
  username_locked_at TIMESTAMPTZ,                    -- locks 7 days after creation
  full_name TEXT,
  bio TEXT CHECK (char_length(bio) <= 50),
  avatar_url TEXT,
  email TEXT,
  email_verified BOOLEAN DEFAULT FALSE,
  university TEXT,
  city TEXT,
  wallet_address TEXT,                               -- Privy embedded wallet address (Tempo network)
  due_account_id TEXT,                               -- Due Network customer account ID (e.g., "acc_xxx")
  due_wallet_id TEXT,                                -- Due wallet ID linked to Privy wallet (e.g., "wlt_xxx")
  status user_status DEFAULT 'active',
  kyc_level kyc_level DEFAULT 'none',
  pin_hash TEXT,                                     -- bcrypt hash of transaction PIN
  privacy_profile privacy_level DEFAULT 'public',
  privacy_friend_list privacy_level DEFAULT 'friends_only',
  privacy_who_can_send TEXT DEFAULT 'everyone' CHECK (privacy_who_can_send IN ('everyone', 'friends', 'contacts')),
  privacy_who_can_add TEXT DEFAULT 'everyone' CHECK (privacy_who_can_add IN ('everyone', 'friends', 'contacts')),
  privacy_searchable BOOLEAN DEFAULT TRUE,
  display_currency TEXT DEFAULT 'NGN' CHECK (display_currency IN ('NGN', 'USD', 'GBP', 'EUR', 'AED', 'KES', 'GHS')),
  push_token TEXT,                                   -- Expo push notification token
  push_enabled BOOLEAN DEFAULT TRUE,
  last_active_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Username validation trigger
CREATE OR REPLACE FUNCTION validate_username()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.username IS NOT NULL THEN
    -- Enforce format: letters, numbers, underscores only, 3-20 chars
    IF NEW.username !~ '^[a-zA-Z0-9_]{3,20}$' THEN
      RAISE EXCEPTION 'Username must be 3-20 characters: letters, numbers, underscores only';
    END IF;
    -- Store lowercase for uniqueness, preserve display
    NEW.username := lower(NEW.username);
    IF NEW.username_display IS NULL THEN
      NEW.username_display := NEW.username;
    END IF;
    -- Set lock timer on first username set
    IF OLD.username IS NULL AND NEW.username IS NOT NULL THEN
      NEW.username_locked_at := now() + INTERVAL '7 days';
    END IF;
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validate_username
  BEFORE INSERT OR UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION validate_username();

-- Profanity check function (basic — extend with word list)
CREATE OR REPLACE FUNCTION check_profanity(input_text TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  banned_words TEXT[] := ARRAY[
    'admin', 'moderator', 'support', 'official', 'system',
    'fuck', 'shit', 'ass', 'bitch', 'nigga', 'nigger',
    'penis', 'vagina', 'porn', 'sex', 'nude'
    -- Extend this list significantly in production
  ];
  word TEXT;
BEGIN
  FOREACH word IN ARRAY banned_words LOOP
    IF lower(input_text) LIKE '%' || word || '%' THEN
      RETURN TRUE;
    END IF;
  END LOOP;
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;
