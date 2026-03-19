-- Remove permissive direct INSERT access on bookings; booking creation is handled via SECURITY DEFINER RPC
DROP POLICY IF EXISTS "Anyone can create bookings" ON public.bookings;

-- Keep page_views inaccessible directly while satisfying explicit-policy linting
CREATE POLICY "No direct access to page views"
ON public.page_views
FOR ALL
TO public
USING (false)
WITH CHECK (false);