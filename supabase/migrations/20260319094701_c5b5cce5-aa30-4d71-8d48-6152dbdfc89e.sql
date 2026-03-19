-- Add offer keys to RLS public read list
DROP POLICY IF EXISTS "Anyone can read public site settings" ON public.site_settings;
CREATE POLICY "Anyone can read public site settings"
  ON public.site_settings FOR SELECT
  TO public
  USING (key = ANY (ARRAY[
    'business_name', 'tagline', 'hero_subheadline', 'helpline_number', 'whatsapp_number',
    'contact_email', 'facebook_url', 'instagram_url', 'inside_dhaka_policy', 'outside_dhaka_policy',
    'outside_dhaka_surcharge_bdt', 'payment_note', 'scarcity_message', 'total_customers',
    'guarantee_text', 'confirmation_message', 'meta_pixel_id', 'gtm_container_id',
    'offer_enabled', 'offer_original_price', 'offer_price', 'offer_text', 'offer_duration_hours'
  ]));

-- Enable realtime for bookings table (for live notifications)
ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings;