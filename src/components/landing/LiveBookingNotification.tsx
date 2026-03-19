import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { MapPin, Clock, Package } from "lucide-react";

interface BookingNotification {
  id: string;
  district: string | null;
  package_name: string;
  preferred_time: string;
}

export default function LiveBookingNotification() {
  const [notification, setNotification] = useState<BookingNotification | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const channel = supabase
      .channel("live-bookings")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "bookings" },
        async (payload) => {
          const booking = payload.new as any;

          // Fetch package name
          const { data: pkg } = await supabase
            .from("service_packages")
            .select("name")
            .eq("id", booking.package_id)
            .single();

          // Fetch time slot
          const { data: slot } = await supabase
            .from("available_time_slots")
            .select("slot_label")
            .eq("id", booking.preferred_time_slot_id)
            .single();

          setNotification({
            id: booking.id,
            district: booking.district,
            package_name: pkg?.name || "সোফা ক্লিনিং",
            preferred_time: slot?.slot_label || "",
          });
          setVisible(true);

          // Auto hide after 5s
          setTimeout(() => setVisible(false), 5000);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (!visible || !notification) return null;

  return (
    <div className="fixed bottom-24 left-4 z-50 animate-fade-in-up max-w-[280px] sm:max-w-xs">
      <div className="bg-card/95 backdrop-blur-xl rounded-2xl shadow-[var(--shadow-elevated)] border border-border/50 p-4 space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-primary">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
          </span>
          নতুন বুকিং হয়েছে!
        </div>

        <div className="space-y-1.5">
          {notification.district && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3 text-primary flex-shrink-0" />
              <span>{notification.district}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Package className="h-3 w-3 text-accent flex-shrink-0" />
            <span className="font-semibold text-foreground">{notification.package_name}</span>
          </div>
          {notification.preferred_time && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-3 w-3 text-emerald-500 flex-shrink-0" />
              <span>{notification.preferred_time}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
