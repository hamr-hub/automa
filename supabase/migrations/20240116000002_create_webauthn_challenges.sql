-- Create webauthn_challenges table
-- This table stores temporary challenges for WebAuthn registration and authentication

CREATE TABLE IF NOT EXISTS public.webauthn_challenges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge TEXT NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('registration', 'authentication')),
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create index
CREATE INDEX idx_webauthn_challenges_user_id ON public.webauthn_challenges(user_id);
CREATE INDEX idx_webauthn_challenges_challenge ON public.webauthn_challenges(challenge);
CREATE INDEX idx_webauthn_challenges_expires_at ON public.webauthn_challenges(expires_at);

-- Enable RLS
ALTER TABLE public.webauthn_challenges ENABLE ROW LEVEL SECURITY;

-- Service role can do anything
CREATE POLICY "Service role full access"
  ON public.webauthn_challenges
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Grant permissions
GRANT ALL ON public.webauthn_challenges TO service_role;

-- Cleanup expired challenges automatically (optional)
CREATE OR REPLACE FUNCTION cleanup_expired_challenges()
RETURNS void AS $$
BEGIN
  DELETE FROM public.webauthn_challenges
  WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comment
COMMENT ON TABLE public.webauthn_challenges IS 'Temporary challenges for WebAuthn operations, automatically expire after 5 minutes';
