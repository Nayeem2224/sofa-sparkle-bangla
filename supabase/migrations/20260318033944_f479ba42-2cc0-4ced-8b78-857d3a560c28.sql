-- Allow admins to read all admin records (not just own)
DROP POLICY IF EXISTS "Admins can read own record" ON public.admins;
CREATE POLICY "Admins can read all admins" ON public.admins
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM admins a WHERE a.user_id = auth.uid()));
