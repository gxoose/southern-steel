ALTER TABLE proposals ADD COLUMN IF NOT EXISTS signed_ip text;
ALTER TABLE proposals ADD COLUMN IF NOT EXISTS signature_hash text;
