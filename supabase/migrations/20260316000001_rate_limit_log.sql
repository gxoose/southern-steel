CREATE TABLE IF NOT EXISTS rate_limit_log (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  key text NOT NULL,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX idx_rate_limit_key_time ON rate_limit_log(key, created_at);
