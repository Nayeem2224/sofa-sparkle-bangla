
-- =============================================
-- Purexify Database Schema v1.1
-- =============================================

-- 1. ADMINS TABLE
CREATE TABLE public.admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id),
  UNIQUE(email)
);
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can read own record" ON public.admins FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- 2. SERVICE PACKAGES
CREATE TABLE public.service_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  package_type TEXT NOT NULL DEFAULT 'standard',
  base_price_bdt NUMERIC(10,2) NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.service_packages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read active packages" ON public.service_packages FOR SELECT USING (true);
CREATE POLICY "Admins can manage packages" ON public.service_packages FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.admins WHERE user_id = auth.uid())
) WITH CHECK (
  EXISTS (SELECT 1 FROM public.admins WHERE user_id = auth.uid())
);

-- 3. BOOKING ADD-ONS
CREATE TABLE public.booking_add_ons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  unit_label TEXT NOT NULL DEFAULT 'unit',
  price_per_unit_bdt NUMERIC(10,2) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.booking_add_ons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read active add-ons" ON public.booking_add_ons FOR SELECT USING (true);
CREATE POLICY "Admins can manage add-ons" ON public.booking_add_ons FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.admins WHERE user_id = auth.uid())
) WITH CHECK (
  EXISTS (SELECT 1 FROM public.admins WHERE user_id = auth.uid())
);

-- 4. AVAILABLE TIME SLOTS
CREATE TABLE public.available_time_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slot_label TEXT NOT NULL,
  slot_time TIME NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.available_time_slots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read active time slots" ON public.available_time_slots FOR SELECT USING (true);
CREATE POLICY "Admins can manage time slots" ON public.available_time_slots FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.admins WHERE user_id = auth.uid())
) WITH CHECK (
  EXISTS (SELECT 1 FROM public.admins WHERE user_id = auth.uid())
);

-- 5. BOOKINGS
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_number TEXT NOT NULL UNIQUE,
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  district TEXT,
  is_outside_dhaka BOOLEAN NOT NULL DEFAULT false,
  package_id UUID NOT NULL REFERENCES public.service_packages(id),
  preferred_date DATE NOT NULL,
  preferred_time_slot_id UUID NOT NULL REFERENCES public.available_time_slots(id),
  base_price NUMERIC(10,2) NOT NULL,
  addons_total NUMERIC(10,2) NOT NULL DEFAULT 0,
  surcharge NUMERIC(10,2) NOT NULL DEFAULT 0,
  grand_total NUMERIC(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  admin_note TEXT,
  additional_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
-- Anyone can insert bookings (public form)
CREATE POLICY "Anyone can create bookings" ON public.bookings FOR INSERT WITH CHECK (true);
-- Only admins can read/update bookings
CREATE POLICY "Admins can read bookings" ON public.bookings FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.admins WHERE user_id = auth.uid())
);
CREATE POLICY "Admins can update bookings" ON public.bookings FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.admins WHERE user_id = auth.uid())
);
-- Anon users can read their own booking by ID (for confirmation page)
CREATE POLICY "Anon can read own booking" ON public.bookings FOR SELECT TO anon USING (true);

-- 6. BOOKING ADDON ITEMS
CREATE TABLE public.booking_addon_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  add_on_id UUID NOT NULL REFERENCES public.booking_add_ons(id),
  quantity INTEGER NOT NULL DEFAULT 0,
  unit_price NUMERIC(10,2) NOT NULL,
  subtotal NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.booking_addon_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can create addon items" ON public.booking_addon_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can read addon items" ON public.booking_addon_items FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.admins WHERE user_id = auth.uid())
);
CREATE POLICY "Anon can read addon items" ON public.booking_addon_items FOR SELECT TO anon USING (true);

-- 7. BOOKING STATUS LOGS
CREATE TABLE public.booking_status_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  old_status TEXT,
  new_status TEXT NOT NULL,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  changed_by UUID REFERENCES auth.users(id)
);
ALTER TABLE public.booking_status_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can read status logs" ON public.booking_status_logs FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.admins WHERE user_id = auth.uid())
);

-- 8. SITE SETTINGS (key-value store)
CREATE TABLE public.site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL DEFAULT '',
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read site settings" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Admins can manage site settings" ON public.site_settings FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.admins WHERE user_id = auth.uid())
) WITH CHECK (
  EXISTS (SELECT 1 FROM public.admins WHERE user_id = auth.uid())
);

-- =============================================
-- FUNCTIONS & TRIGGERS
-- =============================================

-- Auto-generate booking number
CREATE OR REPLACE FUNCTION public.generate_booking_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.booking_number := 'PX-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || SUBSTR(NEW.id::TEXT, 1, 6);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER trg_generate_booking_number
  BEFORE INSERT ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.generate_booking_number();

-- Surcharge check
CREATE OR REPLACE FUNCTION public.check_surcharge()
RETURNS TRIGGER AS $$
DECLARE
  expected_surcharge NUMERIC;
BEGIN
  IF NEW.is_outside_dhaka THEN
    SELECT COALESCE(value::NUMERIC, 150) INTO expected_surcharge FROM public.site_settings WHERE key = 'outside_dhaka_surcharge_bdt';
    IF expected_surcharge IS NULL THEN expected_surcharge := 150; END IF;
  ELSE
    expected_surcharge := 0;
  END IF;
  IF NEW.surcharge != expected_surcharge THEN
    RAISE EXCEPTION 'Surcharge mismatch: expected %, got %', expected_surcharge, NEW.surcharge;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER trg_surcharge_check
  BEFORE INSERT OR UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.check_surcharge();

-- Grand total check
CREATE OR REPLACE FUNCTION public.check_grand_total()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.grand_total != (NEW.base_price + NEW.addons_total + NEW.surcharge) THEN
    RAISE EXCEPTION 'Grand total mismatch: expected %, got %', (NEW.base_price + NEW.addons_total + NEW.surcharge), NEW.grand_total;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER trg_grand_total_check
  BEFORE INSERT OR UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.check_grand_total();

-- Slot availability (max 3 per date+slot)
CREATE OR REPLACE FUNCTION public.check_slot_availability()
RETURNS TRIGGER AS $$
DECLARE
  slot_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO slot_count FROM public.bookings
  WHERE preferred_date = NEW.preferred_date
    AND preferred_time_slot_id = NEW.preferred_time_slot_id
    AND status NOT IN ('cancelled');
  IF slot_count >= 3 THEN
    RAISE EXCEPTION 'slot_full:এই সময়ের স্লট পূর্ণ। অন্য সময় বেছে নিন।';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER trg_slot_availability
  BEFORE INSERT ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.check_slot_availability();

-- Future date check
CREATE OR REPLACE FUNCTION public.check_future_date()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.preferred_date < CURRENT_DATE THEN
    RAISE EXCEPTION 'past_date:আপনি অতীত তারিখে বুকিং দিতে পারবেন না।';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER trg_future_date_check
  BEFORE INSERT ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.check_future_date();

-- Auto-log status changes
CREATE OR REPLACE FUNCTION public.log_booking_status()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.booking_status_logs (booking_id, old_status, new_status)
    VALUES (NEW.id, NULL, NEW.status);
  ELSIF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.booking_status_logs (booking_id, old_status, new_status, changed_by)
    VALUES (NEW.id, OLD.status, NEW.status, auth.uid());
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER trg_booking_status_log
  AFTER INSERT OR UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.log_booking_status();

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER trg_packages_updated_at BEFORE UPDATE ON public.service_packages FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_addons_updated_at BEFORE UPDATE ON public.booking_add_ons FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_bookings_updated_at BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_settings_updated_at BEFORE UPDATE ON public.site_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- SEED DATA
-- =============================================

-- Site Settings
INSERT INTO public.site_settings (key, value, description) VALUES
  ('business_name', 'Purexify', 'Business display name'),
  ('tagline', 'প্রফেশনাল সোফা ক্লিনিং সার্ভিস', 'Tagline shown in navbar'),
  ('helpline_number', '01XXXXXXXXX', 'Customer helpline number'),
  ('whatsapp_number', '8801XXXXXXXXX', 'WhatsApp number with country code'),
  ('messenger_url', 'https://m.me/purexify', 'Facebook Messenger link'),
  ('hero_headline', 'আপনার সোফা হোক ঝকঝকে পরিষ্কার', 'Hero section main headline'),
  ('hero_subheadline', 'ঢাকায় ঘরে বসেই প্রফেশনাল সোফা ক্লিনিং', 'Hero sub-headline'),
  ('hero_explainer', 'পেশাদার ইকুইপমেন্ট ও নিরাপদ প্রোডাক্ট দিয়ে আমরা আপনার সোফা করি জীবাণুমুক্ত ও সুগন্ধি — বাচ্চা ও পোষা প্রাণীর জন্য সম্পূর্ণ নিরাপদ।', 'Hero explainer text'),
  ('total_customers', '৫০০+', 'Total customers served count'),
  ('guarantee_text', '১০০% সন্তুষ্টি গ্যারান্টি — সন্তুষ্ট না হলে ফ্রি রি-ক্লিন', 'Satisfaction guarantee text'),
  ('inside_dhaka_policy', 'ঢাকা সিটি কর্পোরেশন এলাকায় কোনো ডেলিভারি চার্জ নেই।', 'Inside Dhaka delivery policy'),
  ('outside_dhaka_policy', 'ঢাকার বাইরে অতিরিক্ত ৳১৫০ সার্ভিস চার্জ প্রযোজ্য।', 'Outside Dhaka delivery policy'),
  ('outside_dhaka_surcharge_bdt', '150', 'Surcharge for outside Dhaka in BDT'),
  ('scarcity_message', '⚡ এই সপ্তাহে মাত্র কয়েকটি স্লট বাকি আছে — এখনই বুক করুন!', 'Urgency message above booking form'),
  ('payment_note', '💰 পেমেন্ট সার্ভিস সম্পন্ন হওয়ার পর নগদে/বিকাশে নেওয়া হবে। অগ্রিম পেমেন্টের প্রয়োজন নেই।', 'Payment note in booking form'),
  ('confirmation_message', 'আপনার বুকিং সফলভাবে সম্পন্ন হয়েছে! আমাদের টিম শীঘ্রই আপনার সাথে যোগাযোগ করবে।', 'Booking confirmation message');

-- Service Packages
INSERT INTO public.service_packages (name, package_type, base_price_bdt, description, sort_order) VALUES
  ('বেসিক ক্লিন', 'basic', 1500.00, '৩ সিটের সোফা — ধুলো ও হালকা দাগ পরিষ্কার', 1),
  ('ডিপ ক্লিন', 'standard', 2500.00, '৩ সিটের সোফা — গভীর পরিষ্কার, দাগ ও গন্ধ দূর', 2),
  ('প্রিমিয়াম ক্লিন', 'premium', 3500.00, '৩ সিটের সোফা — সম্পূর্ণ স্যানিটাইজেশন ও প্রোটেকশন কোটিং সহ', 3);

-- Booking Add-Ons
INSERT INTO public.booking_add_ons (name, unit_label, price_per_unit_bdt, sort_order) VALUES
  ('অতিরিক্ত সিট', 'সিট', 150.00, 1),
  ('কুশন', 'কুশন', 50.00, 2);

-- Time Slots
INSERT INTO public.available_time_slots (slot_label, slot_time, sort_order) VALUES
  ('সকাল ৯:০০ - ১১:০০', '09:00', 1),
  ('দুপুর ১১:০০ - ১:০০', '11:00', 2),
  ('বিকাল ২:০০ - ৪:০০', '14:00', 3),
  ('সন্ধ্যা ৪:০০ - ৬:০০', '16:00', 4);
