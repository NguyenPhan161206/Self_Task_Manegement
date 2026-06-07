-- Create invitations table for email-based group invitations
CREATE TABLE IF NOT EXISTS public.invitations (
  id        BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  group_id  BIGINT NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  invited_by BIGINT NOT NULL REFERENCES public.users(id),
  email     TEXT NOT NULL,
  token     TEXT NOT NULL UNIQUE,
  status    TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired')),
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ DEFAULT (now() + interval '7 days')
);

ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

-- Group admins can view invitations for their groups
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'invitations' AND policyname = 'Group admins can view invitations') THEN
    CREATE POLICY "Group admins can view invitations"
      ON public.invitations FOR SELECT
      USING (public.is_group_admin(group_id));
  END IF;
END $$;
