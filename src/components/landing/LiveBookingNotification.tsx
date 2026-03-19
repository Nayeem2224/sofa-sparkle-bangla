import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { MapPin, Clock, Package } from "lucide-react";

interface BookingNotification {
  id: string;
  district: string | null;
  package_name: string;
  preferred_time: string;
}

export default function LiveBookingNotification() {
  const [queue, setQueue] = useState<BookingNotification[]>([]);
  const [current, setCurrent] = useState<BookingNotification | null>(null);
  const [visible, setVisible] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Show next notification from queue
  useEffect(() => {
    if (queue.length > 0 && !visible) {
      const [next, ...rest] = queue;
      setCurrent(next);
      setVisible(true);
      setQueue(rest);

      timeoutRef.current = setTimeout(() => {
        setVisible(false);
      }, 5000);
    }
  }, [queue, visible]);

  // Clear visibility after hiding
  useEffect(() => {
    if (!visible && current) {
      const t = setTimeout(() => setCurrent(null), 500);
      return () => clearTimeout(t);
    }
  }, [visible, current]);

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

          const notification: BookingNotification = {
            id: booking.id,
            district: booking.district,
            package_name: pkg?.name || "সোফা ক্লিনিং",
            preferred_time: slot?.slot_label || "",
          };

          setQueue((prev) => [...prev, notification]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  if (!current) return null;

  return (
    <div
      className={`fixed bottom-24 left-4 z-50 max-w-[300px] sm:max-w-xs transition-all duration-500 ${
        visible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-full"
      }`}
    >
      <div className="bg-card/95 backdrop-blur-xl rounded-2xl shadow-[var(--shadow-elevated)] border border-border/50 p-4 space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-primary">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
          </span>
          নতুন বুকিং হয়েছে!
        </div>

        <div className="space-y-1.5">
          {current.district && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 text-primary flex-shrink-0" />
              <span className="font-medium text-foreground">{current.district} থেকে</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Package className="h-3.5 w-3.5 text-accent flex-shrink-0" />
            <span className="font-semibold text-foreground">{current.package_name}</span>
          </div>
          {current.preferred_time && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />
              <span>{current.preferred_time}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
