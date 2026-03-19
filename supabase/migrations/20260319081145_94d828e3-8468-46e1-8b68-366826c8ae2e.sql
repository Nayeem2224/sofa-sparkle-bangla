-- 1. Server-side price recalculation trigger on bookings
CREATE OR REPLACE FUNCTION public.recalculate_booking_prices()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  real_base_price NUMERIC;
  surcharge_val NUMERIC;
BEGIN
  SELECT base_price_bdt INTO real_base_price
  FROM public.service_packages
  WHERE id = NEW.package_id AND is_active = true;

  IF real_base_price IS NULL THEN
    RAISE EXCEPTION 'invalid_package:অবৈধ প্যাকেজ নির্বাচন করা হয়েছে।';
  END IF;

  IF NEW.is_outside_dhaka THEN
    SELECT COALESCE(value::NUMERIC, 150) INTO surcharge_val
    FROM public.site_settings WHERE key = 'outside_dhaka_surcharge_bdt';
    IF surcharge_val IS NULL THEN surcharge_val := 150; END IF;
  ELSE
    surcharge_val := 0;
  END IF;

  NEW.base_price := real_base_price;
  NEW.surcharge := surcharge_val;
  IF TG_OP = 'INSERT' THEN
    NEW.addons_total := 0;
    NEW.grand_total := real_base_price + 0 + surcharge_val;
  ELSE
    NEW.grand_total := real_base_price + NEW.addons_total + surcharge_val;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_recalculate_prices ON public.bookings;
CREATE TRIGGER trg_recalculate_prices
  BEFORE INSERT OR UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.recalculate_booking_prices();

-- 2. Validate and recalculate addon item prices
CREATE OR REPLACE FUNCTION public.recalculate_addons_total()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  real_unit_price NUMERIC;
BEGIN
  SELECT price_per_unit_bdt INTO real_unit_price
  FROM public.booking_add_ons
  WHERE id = NEW.add_on_id AND is_active = true;

  IF real_unit_price IS NULL THEN
    RAISE EXCEPTION 'invalid_addon:অবৈধ অ্যাড-অন নির্বাচন করা হয়েছে।';
  END IF;

  NEW.unit_price := real_unit_price;
  NEW.subtotal := real_unit_price * NEW.quantity;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_validate_addon_price ON public.booking_addon_items;
CREATE TRIGGER trg_validate_addon_price
  BEFORE INSERT ON public.booking_addon_items
  FOR EACH ROW
  EXECUTE FUNCTION public.recalculate_addons_total();

-- 3. Update booking grand_total after addon items inserted
CREATE OR REPLACE FUNCTION public.update_booking_addons_total()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  total NUMERIC;
BEGIN
  SELECT COALESCE(SUM(subtotal), 0) INTO total
  FROM public.booking_addon_items
  WHERE booking_id = NEW.booking_id;

  UPDATE public.bookings
  SET addons_total = total,
      grand_total = base_price + total + surcharge
  WHERE id = NEW.booking_id;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_update_addons_total ON public.booking_addon_items;
CREATE TRIGGER trg_update_addons_total
  AFTER INSERT ON public.booking_addon_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_booking_addons_total();

-- 4. Fix anon booking RLS - remove overly permissive policies
DROP POLICY IF EXISTS "Anon can read own booking" ON public.bookings;
DROP POLICY IF EXISTS "Anon can read addon items" ON public.booking_addon_items;

-- 5. Secure RPC to look up a single booking by ID
CREATE OR REPLACE FUNCTION public.get_booking_by_id(booking_uuid uuid)
RETURNS TABLE (
  booking_number text,
  customer_name text,
  address text,
  preferred_date date,
  base_price numeric,
  addons_total numeric,
  surcharge numeric,
  grand_total numeric,
  is_outside_dhaka boolean,
  additional_notes text,
  package_name text,
  slot_label text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT b.booking_number, b.customer_name, b.address, b.preferred_date,
         b.base_price, b.addons_total, b.surcharge, b.grand_total,
         b.is_outside_dhaka, b.additional_notes,
         sp.name, ats.slot_label
  FROM public.bookings b
  LEFT JOIN public.service_packages sp ON sp.id = b.package_id
  LEFT JOIN public.available_time_slots ats ON ats.id = b.preferred_time_slot_id
  WHERE b.id = booking_uuid
  LIMIT 1;
$$;

-- 6. Secure RPC for addon items
CREATE OR REPLACE FUNCTION public.get_booking_addons(booking_uuid uuid)
RETURNS TABLE (
  quantity integer,
  subtotal numeric,
  addon_name text,
  unit_label text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT bai.quantity, bai.subtotal, ba.name, ba.unit_label
  FROM public.booking_addon_items bai
  LEFT JOIN public.booking_add_ons ba ON ba.id = bai.add_on_id
  WHERE bai.booking_id = booking_uuid;
$$