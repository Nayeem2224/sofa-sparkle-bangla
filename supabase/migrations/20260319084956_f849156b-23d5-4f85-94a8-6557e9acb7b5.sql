-- Harden page view RPC input validation
CREATE OR REPLACE FUNCTION public.upsert_page_view(p_session_id text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF p_session_id IS NULL OR length(p_session_id) > 64 OR p_session_id !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' THEN
    RAISE EXCEPTION 'invalid_session_id';
  END IF;

  INSERT INTO public.page_views (session_id, last_seen_at)
  VALUES (p_session_id, now())
  ON CONFLICT (session_id) DO UPDATE
  SET last_seen_at = now();
END;
$$;

-- Expose only aggregate count via RPC instead of raw table rows
CREATE OR REPLACE FUNCTION public.get_active_viewer_count()
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT COUNT(*)::integer
  FROM public.page_views
  WHERE last_seen_at >= now() - interval '3 minutes';
$$;

-- Remove public raw-read access to page_views rows
DROP POLICY IF EXISTS "Anyone can read page view count" ON public.page_views;