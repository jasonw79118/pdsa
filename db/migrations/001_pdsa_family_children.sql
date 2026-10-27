-- PDSA-only child profiles. Never run against production until the migration
-- and guardian-authorization controls have passed review on a dev branch.
CREATE TABLE IF NOT EXISTS public.pdsa_family_children (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guardian_user_id text NOT NULL,
  first_name varchar(100) NOT NULL CHECK (length(btrim(first_name)) BETWEEN 1 AND 100),
  last_name varchar(100) NOT NULL CHECK (length(btrim(last_name)) BETWEEN 1 AND 100),
  date_of_birth date NOT NULL,
  request_key uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT pdsa_family_children_guardian_request_unique UNIQUE (guardian_user_id, request_key)
);

CREATE INDEX IF NOT EXISTS pdsa_family_children_guardian_created_idx
  ON public.pdsa_family_children (guardian_user_id, created_at, id);

ALTER TABLE public.pdsa_family_children ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pdsa_family_children FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS pdsa_family_children_guardian_access ON public.pdsa_family_children;
CREATE POLICY pdsa_family_children_guardian_access
  ON public.pdsa_family_children
  FOR ALL
  USING (guardian_user_id = nullif(current_setting('pdsa.guardian_user_id', true), ''))
  WITH CHECK (guardian_user_id = nullif(current_setting('pdsa.guardian_user_id', true), ''));
