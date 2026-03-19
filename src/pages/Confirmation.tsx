import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { CheckCircle, Phone, MessageCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useSiteSettings } from "@/hooks/use-landing-data";

interface BookingDetail {
  booking_number: string;
  customer_name: string;
  address: string;
  preferred_date: string;
  base_price: number;
  addons_total: number;
  surcharge: number;
  grand_total: number;
  is_outside_dhaka: boolean;
  additional_notes: string | null;
  package_name: string | null;
  slot_label: string | null;
}

interface AddonItem {
  quantity: number;
  subtotal: number;
  addon_name: string | null;
  unit_label: string | null;
}

export default function ConfirmationPage() {
  const [params] = useSearchParams();
  const bookingId = params.get("id");
  const { data: settings } = useSiteSettings();
  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [addons, setAddons] = useState<AddonItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!bookingId) return;
    (async () => {
      const [bookingRes, addonsRes] = await Promise.all([
        supabase.rpc("get_booking_by_id", { booking_uuid: bookingId }),
        supabase.rpc("get_booking_addons", { booking_uuid: bookingId }),
      ]);
      if (bookingRes.data && bookingRes.data.length > 0) {
        setBooking(bookingRes.data[0] as any);
      }
      if (addonsRes.data) {
        setAddons(addonsRes.data as any[]);
      }
      setLoading(false);
    })();
  }, [bookingId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">লোড হচ্ছে...</p>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-destructive">বুকিং খুঁজে পাওয়া যায়নি।</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary/20 to-background py-12">
      <div className="container max-w-lg">
        {/* Checkmark */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-secondary/30 flex items-center justify-center animate-check-bounce">
            <CheckCircle className="h-10 w-10 text-primary" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-center text-primary mb-2">বুকিং সফল হয়েছে!</h1>

        {settings?.confirmation_message && (
          <p className="text-center text-muted-foreground text-sm mb-6">{settings.confirmation_message}</p>
        )}

        {/* Summary card */}
        <div className="bg-background rounded-lg shadow-card p-6 space-y-4">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">বুকিং নম্বর</span>
            <span className="font-bold text-primary">{booking.booking_number}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">নাম</span>
            <span className="font-medium">{booking.customer_name}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">ঠিকানা</span>
            <span className="font-medium text-right max-w-[60%]">{booking.address}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">প্যাকেজ</span>
            <span className="font-medium">{booking.package_name}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">তারিখ</span>
            <span className="font-medium">{booking.preferred_date}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">সময়</span>
            <span className="font-medium">{booking.slot_label}</span>
          </div>

          {addons.length > 0 && (
            <div>
              <span className="text-xs text-muted-foreground">অতিরিক্ত সেবা:</span>
              {addons.map((item, i) => (
                <div key={i} className="flex justify-between text-xs mt-1">
                  <span>{item.addon_name} × {item.quantity}</span>
                  <span>৳{Number(item.subtotal)}</span>
                </div>
              ))}
            </div>
          )}

          <hr className="border-border" />

          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">প্যাকেজ মূল্য</span>
              <span>৳{Number(booking.base_price)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">অতিরিক্ত সেবা</span>
              <span>৳{Number(booking.addons_total)}</span>
            </div>
            {booking.is_outside_dhaka && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">সার্চার্জ</span>
                <span>৳{Number(booking.surcharge)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold text-primary pt-2">
              <span>মোট</span>
              <span>৳{Number(booking.grand_total)}</span>
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="flex items-center justify-center gap-6 mt-6 text-sm">
          {settings?.helpline_number && (
            <a href={`tel:${settings.helpline_number}`} className="flex items-center gap-1.5 text-primary hover:underline">
              <Phone className="h-4 w-4" /> {settings.helpline_number}
            </a>
          )}
          {settings?.whatsapp_number && (
            <a href={`https://wa.me/${settings.whatsapp_number}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-primary hover:underline">
              <MessageCircle className="h-4 w-4" /> WhatsApp
            </a>
          )}
        </div>

        <div className="flex justify-center mt-6">
          <Button variant="outline" asChild>
            <Link to="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              হোমপেজে ফিরে যান
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
