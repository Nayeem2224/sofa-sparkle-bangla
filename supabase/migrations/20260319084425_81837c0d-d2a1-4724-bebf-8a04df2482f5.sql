
-- Fix 1: Use cryptographically secure random bytes for booking access_token default
ALTER TABLE public.bookings ALTER COLUMN access_token SET DEFAULT encode(gen_random_bytes(16), 'hex');

-- Fix 2: Update create_booking_with_addons to use gen_random_bytes
CREATE OR REPLACE FUNCTION public.create_booking_with_addons(p_customer_name text, p_phone text, p_address text, p_district text DEFAULT NULL::text, p_is_outside_dhaka boolean DEFAULT false, p_package_id uuid DEFAULT NULL::uuid, p_preferred_date date DEFAULT NULL::date, p_preferred_time_slot_id uuid DEFAULT NULL::uuid, p_additional_notes text DEFAULT NULL::text, p_addon_items jsonb DEFAULT '[]'::jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_booking_id uuid;
  v_booking_number text;
  v_access_token text;
  v_base_price numeric;
  v_surcharge numeric;
  v_addons_total numeric := 0;
  v_grand_total numeric;
  v_item jsonb;
  v_addon_price numeric;
  v_subtotal numeric;
BEGIN
  IF length(trim(p_customer_name)) < 3 THEN
    RAISE EXCEPTION 'invalid_name';
  END IF;
  IF p_phone !~ '^01[0-9]{9}$' THEN
    RAISE EXCEPTION 'invalid_phone';
  END IF;
  IF length(trim(p_address)) < 10 THEN
    RAISE EXCEPTION 'invalid_address';
  END IF;
  IF p_additional_notes IS NOT NULL AND length(p_additional_notes) > 1000 THEN
    RAISE EXCEPTION 'invalid_notes';
  END IF;

  SELECT base_price_bdt INTO v_base_price
  FROM public.service_packages WHERE id = p_package_id AND is_active = true;
  IF v_base_price IS NULL THEN
    RAISE EXCEPTION 'invalid_package';
  END IF;

  IF p_is_outside_dhaka THEN
    SELECT COALESCE(value::numeric, 150) INTO v_surcharge
    FROM public.site_settings WHERE key = 'outside_dhaka_surcharge_bdt';
    IF v_surcharge IS NULL THEN v_surcharge := 150; END IF;
  ELSE
    v_surcharge := 0;
  END IF;

  FOR v_item IN SELECT * FROM jsonb_array_elements(p_addon_items)
  LOOP
    SELECT price_per_unit_bdt INTO v_addon_price
    FROM public.booking_add_ons WHERE id = (v_item->>'add_on_id')::uuid AND is_active = true;
    IF v_addon_price IS NULL THEN
      RAISE EXCEPTION 'invalid_addon';
    END IF;
    v_addons_total := v_addons_total + (v_addon_price * (v_item->>'quantity')::int);
  END LOOP;

  v_grand_total := v_base_price + v_addons_total + v_surcharge;
  -- Use cryptographically secure random bytes
  v_access_token := encode(gen_random_bytes(16), 'hex');

  INSERT INTO public.bookings (
    customer_name, phone, address, district, is_outside_dhaka,
    package_id, preferred_date, preferred_time_slot_id,
    base_price, addons_total, surcharge, grand_total,
    additional_notes, booking_number, access_token
  ) VALUES (
    p_customer_name, p_phone, p_address, p_district, p_is_outside_dhaka,
    p_package_id, p_preferred_date, p_preferred_time_slot_id,
    v_base_price, v_addons_total, v_surcharge, v_grand_total,
    p_additional_notes, 'TEMP', v_access_token
  ) RETURNING id, booking_number, access_token INTO v_booking_id, v_booking_number, v_access_token;

  FOR v_item IN SELECT * FROM jsonb_array_elements(p_addon_items)
  LOOP
    SELECT price_per_unit_bdt INTO v_addon_price
    FROM public.booking_add_ons WHERE id = (v_item->>'add_on_id')::uuid;
    v_subtotal := v_addon_price * (v_item->>'quantity')::int;
    INSERT INTO public.booking_addon_items (booking_id, add_on_id, quantity, unit_price, subtotal)
    VALUES (v_booking_id, (v_item->>'add_on_id')::uuid, (v_item->>'quantity')::int, v_addon_price, v_subtotal);
  END LOOP;

  RETURN jsonb_build_object('id', v_booking_id, 'booking_number', v_booking_number, 'access_token', v_access_token);
END;
$function$;

-- Fix 3: Replace overly permissive page_views UPDATE policy with a SECURITY DEFINER RPC
DROP POLICY "Anyone can update own session" ON public.page_views;
DROP POLICY "Anyone can insert page views" ON public.page_views;

-- Create a SECURITY DEFINER function to handle upserts safely
CREATE OR REPLACE FUNCTION public.upsert_page_view(p_session_id text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.page_views (session_id, last_seen_at)
  VALUES (p_session_id, now())
  ON CONFLICT (session_id) DO UPDATE SET last_seen_at = now();
END;
$$;
