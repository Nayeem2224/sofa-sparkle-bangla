CREATE TABLE public.showcase_videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  video_url text NOT NULL,
  thumbnail_url text,
  description text,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.showcase_videos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active videos" ON public.showcase_videos
  FOR SELECT TO public USING (is_active = true);

CREATE POLICY "Admins can manage videos" ON public.showcase_videos
  FOR ALL TO authenticated USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

INSERT INTO public.showcase_videos (title, video_url, description, sort_order) VALUES
('সোফা ক্লিনিং প্রক্রিয়া', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'দেখুন কিভাবে আমরা আপনার সোফা নতুনের মতো পরিষ্কার করি', 1),
('বিফোর & আফটার রেজাল্ট', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'আমাদের কাজের আগে ও পরের পার্থক্য দেখুন', 2),
('কার্পেট ডিপ ক্লিনিং', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'প্রফেশনাল কার্পেট ক্লিনিং এর পুরো প্রক্রিয়া', 3);