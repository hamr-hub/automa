-- Create user_activity_logs table
CREATE TABLE IF NOT EXISTS public.user_activity_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    details JSONB DEFAULT '{}'::jsonb,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.user_activity_logs ENABLE ROW LEVEL SECURITY;

-- Create Policy: Users can insert their own logs
CREATE POLICY "Users can insert their own logs" ON public.user_activity_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create Policy: Users can view their own logs
CREATE POLICY "Users can view their own logs" ON public.user_activity_logs
    FOR SELECT USING (auth.uid() = user_id);

-- Create Policy: Users cannot update logs
-- (No update policy = default deny)

-- Create Policy: Users cannot delete logs (optional, or allow them to delete)
-- (No delete policy = default deny)
