import { supabase } from "@/integrations/supabase/client";

export interface SiteSetting {
  key: string;
  value: string;
  description: string | null;
}

export interface ServicePackage {
  id: string;
  name: string;
  package_type: string;
  base_price_bdt: number;
  description: string | null;
  is_active: boolean;
  sort_order: number;
}

export interface BookingAddOn {
  id: string;
  name: string;
  unit_label: string;
  price_per_unit_bdt: number;
  is_active: boolean;
  sort_order: number;
}

export interface TimeSlot {
  id: string;
  slot_label: string;
  slot_time: string;
  is_active: boolean;
  sort_order: number;
}

export async function fetchSiteSettings(): Promise<Record<string, string>> {
  const { data, error } = await supabase.from("site_settings").select("key, value");
  if (error) throw error;
  const map: Record<string, string> = {};
  data?.forEach((r: { key: string; value: string }) => { map[r.key] = r.value; });
  return map;
}

export async function fetchActivePackages(): Promise<ServicePackage[]> {
  const { data, error } = await supabase
    .from("service_packages")
    .select("*")
    .eq("is_active", true)
    .order("sort_order");
  if (error) throw error;
  return (data ?? []) as ServicePackage[];
}

export async function fetchActiveAddOns(): Promise<BookingAddOn[]> {
  const { data, error } = await supabase
    .from("booking_add_ons")
    .select("*")
    .eq("is_active", true)
    .order("sort_order");
  if (error) throw error;
  return (data ?? []) as BookingAddOn[];
}

export async function fetchActiveTimeSlots(): Promise<TimeSlot[]> {
  const { data, error } = await supabase
    .from("available_time_slots")
    .select("*")
    .eq("is_active", true)
    .order("sort_order");
  if (error) throw error;
  return (data ?? []) as TimeSlot[];
}

export interface BookingPayload {
  customer_name: string;
  phone: string;
  address: string;
  district?: string;
  is_outside_dhaka: boolean;
  package_id: string;
  preferred_date: string;
  preferred_time_slot_id: string;
  base_price: number;
  addons_total: number;
  surcharge: number;
  grand_total: number;
  additional_notes?: string;
}

export interface AddonItem {
  add_on_id: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export async function createBooking(
  booking: BookingPayload,
  addonItems: AddonItem[]
): Promise<{ bookingId: string; bookingNumber: string }> {
  const addonPayload = addonItems.map((a) => ({
    add_on_id: a.add_on_id,
    quantity: a.quantity,
  }));

  const { data, error } = await supabase.rpc("create_booking_with_addons", {
    p_customer_name: booking.customer_name,
    p_phone: booking.phone,
    p_address: booking.address,
    p_district: booking.district || null,
    p_is_outside_dhaka: booking.is_outside_dhaka,
    p_package_id: booking.package_id,
    p_preferred_date: booking.preferred_date,
    p_preferred_time_slot_id: booking.preferred_time_slot_id,
    p_additional_notes: booking.additional_notes || null,
    p_addon_items: addonPayload,
  });

  if (error) {
    const msg = error.message || "";
    const errorMap: Record<string, string> = {
      slot_full: "slot_full:এই সময়ের স্লট পূর্ণ। অন্য সময় বেছে নিন।",
      past_date: "past_date:আপনি অতীত তারিখে বুকিং দিতে পারবেন না।",
      invalid_package: "invalid_package:অবৈধ প্যাকেজ নির্বাচন করা হয়েছে।",
      invalid_addon: "invalid_addon:অবৈধ অ্যাড-অন নির্বাচন করা হয়েছে।",
      invalid_name: "invalid_name:গ্রাহকের নাম সঠিক নয়।",
      invalid_phone: "invalid_phone:ফোন নম্বর সঠিক নয়।",
      invalid_address: "invalid_address:ঠিকানা সঠিক নয়।",
      invalid_notes: "invalid_notes:নোট অতিরিক্ত দীর্ঘ।",
    };
    for (const [key, value] of Object.entries(errorMap)) {
      if (msg.includes(key)) throw new Error(value);
    }
    throw error;
  }

  const result = data as any;
  return { bookingId: result.id, bookingNumber: result.booking_number };
}

// Price calculation utility — single source of truth
export function calculatePricing(
  basePrice: number,
  addons: { quantity: number; unitPrice: number }[],
  isOutsideDhaka: boolean,
  surchargeAmount: number
) {
  const addonsTotal = addons.reduce((sum, a) => sum + a.quantity * a.unitPrice, 0);
  const surcharge = isOutsideDhaka ? surchargeAmount : 0;
  const grandTotal = basePrice + addonsTotal + surcharge;
  return { basePrice, addonsTotal, surcharge, grandTotal };
}
