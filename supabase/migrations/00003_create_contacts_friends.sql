-- 00003_create_contacts_friends.sql

CREATE TABLE friendships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  addressee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status friend_status DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(requester_id, addressee_id),
  CHECK (requester_id <> addressee_id)
);

CREATE TABLE contact_syncs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  phone_hash TEXT NOT NULL,  -- SHA-256 of normalized phone number
  matched_user_id UUID REFERENCES users(id),
  synced_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, phone_hash)
);

-- Favorites for quick-access recipients
CREATE TABLE favorite_recipients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  nickname TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, recipient_id)
);
