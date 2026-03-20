-- Add missing meta_pixel_id setting
INSERT INTO site_settings (key, value, description)
VALUES ('meta_pixel_id', '', 'Meta/Facebook Pixel ID')
ON CONFLICT (key) DO NOTHING;

-- Add GA4 measurement ID setting
INSERT INTO site_settings (key, value, description)
VALUES ('ga4_measurement_id', '', 'Google Analytics 4 Measurement ID (G-XXXXXXXXXX)')
ON CONFLICT (key) DO NOTHING;

-- Update RLS policy to include ga4_measurement_id for public read
DROP POLICY IF EXISTS "Anyone can read public site settings" ON site_settings;
CREATE POLICY "Anyone can read public site settings" ON site_settings
FOR SELECT TO public
USING (key = ANY (ARRAY[
  'business_name', 'tagline', 'hero_subheadline',
  'helpline_number', 'whatsapp_number', 'contact_email',
  'facebook_url', 'instagram_url',
  'inside_dhaka_policy', 'outside_dhaka_policy', 'outside_dhaka_surcharge_bdt',
  'payment_note', 'scarcity_message', 'total_customers',
  'guarantee_text', 'confirmation_message',
  'meta_pixel_id', 'gtm_container_id',
  'ga4_measurement_id',
  'offer_enabled', 'offer_original_price', 'offer_price', 'offer_text', 'offer_duration_hours'
]))