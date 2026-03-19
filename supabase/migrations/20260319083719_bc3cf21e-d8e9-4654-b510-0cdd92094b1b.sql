
-- 1. Add access_token column to bookings
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS access_token text;

-- 2. Backfill existing rows
UPDATE public.bookings SET access_token = substr(md5(random()::text || id::text), 1, 16) WHERE access_token IS NULL;

-- 3. Make it NOT NULL with default
ALTER TABLE public.bookings ALTER COLUMN access_token SET DEFAULT substr(md5(random()::text), 1, 16);
ALTER TABLE public.bookings ALTER COLUMN access_token SET NOT NULL;

-- 4. Update create_booking_with_addons to return access_token
CREATE OR REPLACE FUNCTION public.create_booking_with_addons(
  p_customer_name text, p_phone text, p_address text,
  p_district text DEFAULT NULL, p_is_outside_dhaka boolean DEFAULT false,
  p_package_id uuid DEFAULT NULL, p_preferred_date date DEFAULT NULL,
  p_preferred_time_slot_id uuid DEFAULT NULL, p_additional_notes text DEFAULT NULL,
  p_addon_items jsonb DEFAULT '[]'::jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
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
  v_access_token := substr(md5(random()::text || now()::text), 1, 16);

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
$$;

-- 5. Update get_booking_by_id to require access_token
CREATE OR REPLACE FUNCTION public.get_booking_by_id(booking_uuid uuid, p_access_token text DEFAULT NULL)
RETURNS TABLE(booking_number text, customer_name text, address text, preferred_date date, base_price numeric, addons_total numeric, surcharge numeric, grand_total numeric, is_outside_dhaka boolean, additional_notes text, package_name text, slot_label text)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Admins can access without token
  IF public.is_admin(auth.uid()) THEN
    RETURN QUERY
      SELECT b.booking_number, b.customer_name, b.address, b.preferred_date,
             b.base_price, b.addons_total, b.surcharge, b.grand_total,
             b.is_outside_dhaka, b.additional_notes,
             sp.name, ats.slot_label
      FROM public.bookings b
      LEFT JOIN public.service_packages sp ON sp.id = b.package_id
      LEFT JOIN public.available_time_slots ats ON ats.id = b.preferred_time_slot_id
      WHERE b.id = booking_uuid
      LIMIT 1;
  ELSE
    -- Non-admins must provide valid access_token
    IF p_access_token IS NULL THEN
      RETURN;
    END IF;
    RETURN QUERY
      SELECT b.booking_number, b.customer_name, b.address, b.preferred_date,
             b.base_price, b.addons_total, b.surcharge, b.grand_total,
             b.is_outside_dhaka, b.additional_notes,
             sp.name, ats.slot_label
      FROM public.bookings b
      LEFT JOIN public.service_packages sp ON sp.id = b.package_id
      LEFT JOIN public.available_time_slots ats ON ats.id = b.preferred_time_slot_id
      WHERE b.id = booking_uuid AND b.access_token = p_access_token
      LIMIT 1;
  END IF;
END;
$$;

-- 6. Update get_booking_addons to require access_token
CREATE OR REPLACE FUNCTION public.get_booking_addons(booking_uuid uuid, p_access_token text DEFAULT NULL)
RETURNS TABLE(quantity integer, subtotal numeric, addon_name text, unit_label text)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF public.is_admin(auth.uid()) THEN
    RETURN QUERY
      SELECT bai.quantity, bai.subtotal, ba.name, ba.unit_label
      FROM public.booking_addon_items bai
      LEFT JOIN public.booking_add_ons ba ON ba.id = bai.add_on_id
      WHERE bai.booking_id = booking_uuid;
  ELSE
    IF p_access_token IS NULL THEN
      RETURN;
    END IF;
    -- Verify token matches the booking
    IF NOT EXISTS (SELECT 1 FROM public.bookings WHERE id = booking_uuid AND access_token = p_access_token) THEN
      RETURN;
    END IF;
    RETURN QUERY
      SELECT bai.quantity, bai.subtotal, ba.name, ba.unit_label
      FROM public.booking_addon_items bai
      LEFT JOIN public.booking_add_ons ba ON ba.id = bai.add_on_id
      WHERE bai.booking_id = booking_uuid;
  END IF;
END;
$$;
