-- Restrict public read access on site_settings to explicit non-sensitive keys only
DROP POLICY IF EXISTS "Anyone can read site settings" ON public.site_settings;
CREATE POLICY "Anyone can read public site settings"
ON public.site_settings
FOR SELECT
TO public
USING (
  key = ANY (
    ARRAY[
      'business_name',
      'tagline',
      'hero_subheadline',
      'helpline_number',
      'whatsapp_number',
      'contact_email',
      'facebook_url',
      'instagram_url',
      'inside_dhaka_policy',
      'outside_dhaka_policy',
      'outside_dhaka_surcharge_bdt',
      'payment_note',
      'scarcity_message',
      'total_customers',
      'guarantee_text',
      'confirmation_message',
      'meta_pixel_id',
      'gtm_container_id'
    ]::text[]
  )
);

-- Tighten public visibility to active-only records on content/catalog tables
DROP POLICY IF EXISTS "Anyone can read active faqs" ON public.faqs;
CREATE POLICY "Anyone can read active faqs"
ON public.faqs
FOR SELECT
TO public
USING (is_active = true);

DROP POLICY IF EXISTS "Anyone can read active time slots" ON public.available_time_slots;
CREATE POLICY "Anyone can read active time slots"
ON public.available_time_slots
FOR SELECT
TO public
USING (is_active = true);

DROP POLICY IF EXISTS "Anyone can read active add-ons" ON public.booking_add_ons;
CREATE POLICY "Anyone can read active add-ons"
ON public.booking_add_ons
FOR SELECT
TO public
USING (is_active = true);

DROP POLICY IF EXISTS "Anyone can read active packages" ON public.service_packages;
CREATE POLICY "Anyone can read active packages"
ON public.service_packages
FOR SELECT
TO public
USING (is_active = true);