-- Create user_passkeys table for WebAuthn/Passkeys support
-- This table stores WebAuthn credentials for passwordless authentication

CREATE TABLE IF NOT EXISTS public.user_passkeys (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  credential_id TEXT NOT NULL UNIQUE,
  public_key TEXT NOT NULL,
  counter BIGINT DEFAULT 0,
  device_type VARCHAR(50), -- 'platform' or 'cross-platform'
  device_name VARCHAR(255),
  transports JSONB, -- ['internal', 'usb', 'nfc', 'ble']
  aaguid UUID,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  last_used_at TIMESTAMPTZ
);

-- Create indexes
CREATE INDEX idx_user_passkeys_user_id ON public.user_passkeys(user_id);
CREATE INDEX idx_user_passkeys_credential_id ON public.user_passkeys(credential_id);

-- Enable Row Level Security
ALTER TABLE public.user_passkeys ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only manage their own passkeys
CREATE POLICY "Users can view own passkeys"
  ON public.user_passkeys
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own passkeys"
  ON public.user_passkeys
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own passkeys"
  ON public.user_passkeys
  FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own passkeys"
  ON public.user_passkeys
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_passkeys TO authenticated;
GRANT ALL ON public.user_passkeys TO service_role;

-- Add comments
COMMENT ON TABLE public.user_passkeys IS 'Stores WebAuthn/Passkey credentials for passwordless authentication';
COMMENT ON COLUMN public.user_passkeys.credential_id IS 'Base64-encoded WebAuthn credential ID';
COMMENT ON COLUMN public.user_passkeys.public_key IS 'Base64-encoded public key';
COMMENT ON COLUMN public.user_passkeys.counter IS 'Signature counter for replay attack prevention';
COMMENT ON COLUMN public.user_passkeys.device_type IS 'Type of authenticator: platform (built-in) or cross-platform (external)';
COMMENT ON COLUMN public.user_passkeys.transports IS 'Available transports for this credential';
COMMENT ON COLUMN public.user_passkeys.aaguid IS 'Authenticator Attestation GUID';
