-- 00007_create_pools.sql

CREATE TABLE pools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organizer_id UUID NOT NULL REFERENCES users(id),
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  pool_type pool_type DEFAULT 'closed',
  target_amount_usdc BIGINT,                       -- NULL = open-ended
  collected_amount_usdc BIGINT DEFAULT 0,
  status pool_status DEFAULT 'active',
  allow_anonymous BOOLEAN DEFAULT FALSE,
  deadline TIMESTAMPTZ,
  share_token TEXT UNIQUE,                         -- for shareable link (open pools)
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE pool_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pool_id UUID NOT NULL REFERENCES pools(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  phone TEXT,                                      -- for invited non-users
  role TEXT DEFAULT 'member' CHECK (role IN ('organizer', 'member')),
  invited_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE pool_contributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pool_id UUID NOT NULL REFERENCES pools(id) ON DELETE CASCADE,
  contributor_id UUID NOT NULL REFERENCES users(id),
  amount_usdc BIGINT NOT NULL CHECK (amount_usdc > 0),
  is_anonymous BOOLEAN DEFAULT FALSE,
  message TEXT CHECK (char_length(message) <= 100),
  transaction_id UUID REFERENCES transactions(id),
  created_at TIMESTAMPTZ DEFAULT now()
);
