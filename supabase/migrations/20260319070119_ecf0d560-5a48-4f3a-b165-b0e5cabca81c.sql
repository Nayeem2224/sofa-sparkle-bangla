-- Marquee banner items table
CREATE TABLE public.marquee_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  text text NOT NULL,
  icon text NOT NULL DEFAULT 'sparkles',
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.marquee_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active marquee items"
  ON public.marquee_items FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage marquee items"
  ON public.marquee_items FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

INSERT INTO public.marquee_items (text, icon, sort_order) VALUES
  ('মাত্র ৯৯৯ টাকায় সোফা ক্লিনিং •', 'sparkles', 1),
  ('সীমিত স্লট — আজই বুক করুন', 'flame', 2),
  ('স্পেশাল অফার! মাত্র ৯৯৯ টাকায় সোফা ক্লিনিং •', 'sparkles', 3),
  ('সীমিত স্লট — আজই বুক করুন', 'flame', 4);

CREATE TABLE public.page_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL UNIQUE,
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can upsert page views"
  ON public.page_views FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE INDEX idx_page_views_last_seen ON public.page_views (last_seen_at);