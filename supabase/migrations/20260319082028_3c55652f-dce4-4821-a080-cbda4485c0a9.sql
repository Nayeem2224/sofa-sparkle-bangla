-- 1. Create atomic booking creation RPC
CREATE OR REPLACE FUNCTION public.create_booking_with_addons(
  p_customer_name text,
  p_phone text,
  p_address text,
  p_district text DEFAULT NULL,
  p_is_outside_dhaka boolean DEFAULT false,
  p_package_id uuid DEFAULT NULL,
  p_preferred_date date DEFAULT NULL,
  p_preferred_time_slot_id uuid DEFAULT NULL,
  p_additional_notes text DEFAULT NULL,
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
  v_base_price numeric;
  v_surcharge numeric;
  v_addons_total numeric := 0;
  v_grand_total numeric;
  v_item jsonb;
  v_addon_price numeric;
  v_subtotal numeric;
BEGIN
  -- Validate package
  SELECT base_price_bdt INTO v_base_price
  FROM public.service_packages
  WHERE id = p_package_id AND is_active = true;

  IF v_base_price IS NULL THEN
    RAISE EXCEPTION 'invalid_package:অবৈধ প্যাকেজ নির্বাচন করা হয়েছে।';
  END IF;

  -- Calculate surcharge
  IF p_is_outside_dhaka THEN
    SELECT COALESCE(value::numeric, 150) INTO v_surcharge
    FROM public.site_settings WHERE key = 'outside_dhaka_surcharge_bdt';
    IF v_surcharge IS NULL THEN v_surcharge := 150; END IF;
  ELSE
    v_surcharge := 0;
  END IF;

  -- Calculate addons total from source prices
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_addon_items)
  LOOP
    SELECT price_per_unit_bdt INTO v_addon_price
    FROM public.booking_add_ons
    WHERE id = (v_item->>'add_on_id')::uuid AND is_active = true;

    IF v_addon_price IS NULL THEN
      RAISE EXCEPTION 'invalid_addon:অবৈধ অ্যাড-অন নির্বাচন করা হয়েছে।';
    END IF;

    v_addons_total := v_addons_total + (v_addon_price * (v_item->>'quantity')::int);
  END LOOP;

  v_grand_total := v_base_price + v_addons_total + v_surcharge;

  -- Insert booking
  INSERT INTO public.bookings (
    customer_name, phone, address, district, is_outside_dhaka,
    package_id, preferred_date, preferred_time_slot_id,
    base_price, addons_total, surcharge, grand_total,
    additional_notes, booking_number
  ) VALUES (
    p_customer_name, p_phone, p_address, p_district, p_is_outside_dhaka,
    p_package_id, p_preferred_date, p_preferred_time_slot_id,
    v_base_price, v_addons_total, v_surcharge, v_grand_total,
    p_additional_notes, 'TEMP'
  ) RETURNING id, booking_number INTO v_booking_id, v_booking_number;

  -- Insert addon items with server-validated prices
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_addon_items)
  LOOP
    SELECT price_per_unit_bdt INTO v_addon_price
    FROM public.booking_add_ons
    WHERE id = (v_item->>'add_on_id')::uuid;

    v_subtotal := v_addon_price * (v_item->>'quantity')::int;

    INSERT INTO public.booking_addon_items (booking_id, add_on_id, quantity, unit_price, subtotal)
    VALUES (v_booking_id, (v_item->>'add_on_id')::uuid, (v_item->>'quantity')::int, v_addon_price, v_subtotal);
  END LOOP;

  RETURN jsonb_build_object('id', v_booking_id, 'booking_number', v_booking_number);
END;
$$;

-- 2. Drop the permissive addon items INSERT policy
DROP POLICY IF EXISTS "Anyone can create addon items" ON public.booking_addon_items