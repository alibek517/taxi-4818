
-- Add username column to profiles
ALTER TABLE public.profiles ADD COLUMN username text UNIQUE;

-- Create function to get email by username (security definer to bypass RLS)
CREATE OR REPLACE FUNCTION public.get_email_by_username(_username text)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT u.email FROM auth.users u
  JOIN public.profiles p ON p.id = u.id
  WHERE p.username = _username
  LIMIT 1
$$;
