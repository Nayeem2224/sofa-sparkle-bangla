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
  const { data, error } = await supabase
    .from("bookings")
    .insert(booking as any)
    .select("id, booking_number")
    .single();

  if (error) {
    // Parse trigger errors
    const msg = error.message || "";
    if (msg.includes("slot_full")) {
      throw new Error("slot_full:এই সময়ের স্লট পূর্ণ। অন্য সময় বেছে নিন।");
    }
    if (msg.includes("past_date")) {
      throw new Error("past_date:আপনি অতীত তারিখে বুকিং দিতে পারবেন না।");
    }
    throw error;
  }

  // Insert addon items
  if (addonItems.length > 0) {
    const items = addonItems.map((a) => ({
      booking_id: data.id,
      add_on_id: a.add_on_id,
      quantity: a.quantity,
      unit_price: a.unit_price,
      subtotal: a.subtotal,
    }));
    const { error: addonError } = await supabase.from("booking_addon_items").insert(items as any);
    if (addonError) throw addonError;
  }

  return { bookingId: data.id, bookingNumber: data.booking_number };
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
