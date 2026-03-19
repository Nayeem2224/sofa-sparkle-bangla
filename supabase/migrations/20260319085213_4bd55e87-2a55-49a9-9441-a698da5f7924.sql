DROP POLICY IF EXISTS "Anyone can read active testimonials" ON public.testimonials;
CREATE POLICY "Anyone can read active testimonials"
ON public.testimonials
FOR SELECT
TO public
USING (is_active = true);