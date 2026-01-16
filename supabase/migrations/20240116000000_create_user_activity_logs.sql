-- Create user_activity_logs table
-- This table stores user activity logs for security and audit purposes

CREATE TABLE IF NOT EXISTS public.user_activity_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action VARCHAR(100) NOT NULL,
  details JSONB DEFAULT '{}'::jsonb,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX idx_user_activity_logs_user_id ON public.user_activity_logs(user_id);
CREATE INDEX idx_user_activity_logs_action ON public.user_activity_logs(action);
CREATE INDEX idx_user_activity_logs_created_at ON public.user_activity_logs(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.user_activity_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only read their own activity logs
CREATE POLICY "Users can view own activity logs"
  ON public.user_activity_logs
  FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policy: Service role can insert activity logs
CREATE POLICY "Service role can insert activity logs"
  ON public.user_activity_logs
  FOR INSERT
  WITH CHECK (true);

-- Grant permissions
GRANT SELECT ON public.user_activity_logs TO authenticated;
GRANT INSERT ON public.user_activity_logs TO authenticated;
GRANT ALL ON public.user_activity_logs TO service_role;

-- Add comment
COMMENT ON TABLE public.user_activity_logs IS 'Stores user activity logs for security and audit purposes';
COMMENT ON COLUMN public.user_activity_logs.action IS 'Action type: login, logout, register, update_profile, enable_mfa, disable_mfa, etc.';
COMMENT ON COLUMN public.user_activity_logs.details IS 'Additional details about the action in JSON format';
COMMENT ON COLUMN public.user_activity_logs.ip_address IS 'IP address of the user when the action was performed';
COMMENT ON COLUMN public.user_activity_logs.user_agent IS 'Browser user agent string';
