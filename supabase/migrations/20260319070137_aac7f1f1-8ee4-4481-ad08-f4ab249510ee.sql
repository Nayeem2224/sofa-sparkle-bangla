DROP POLICY "Anyone can upsert page views" ON public.page_views;

CREATE POLICY "Anyone can insert page views"
  ON public.page_views FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update own session"
  ON public.page_views FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can read page view count"
  ON public.page_views FOR SELECT
  USING (true);