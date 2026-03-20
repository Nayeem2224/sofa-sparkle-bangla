import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { MapPin, Clock, Package, ShoppingBag } from "lucide-react";

interface BookingNotification {
  id: string;
  district: string | null;
  package_name: string;
  preferred_time: string;
  minutes_ago: number;
}

function getMinutesAgo(createdAt: string): number {
  const diff = Date.now() - new Date(createdAt).getTime();
  return Math.max(1, Math.round(diff / 60000));
}

function formatMinutesAgo(mins: number): string {
  if (mins < 60) return `${mins} মিনিট আগে`;
  const hours = Math.floor(mins / 60);
  return `${hours} ঘণ্টা আগে`;
}

export default function LiveBookingNotification() {
  const [queue, setQueue] = useState<BookingNotification[]>([]);
  const [current, setCurrent] = useState<BookingNotification | null>(null);
  const [visible, setVisible] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initialLoadDone = useRef(false);

  // Load today's bookings on mount and cycle through them
  useEffect(() => {
    const loadTodayBookings = async () => {
      const today = new Date().toISOString().split("T")[0];
      const { data: bookings } = await supabase
        .from("bookings")
        .select("id, district, package_id, preferred_time_slot_id, created_at")
        .gte("created_at", today + "T00:00:00")
        .order("created_at", { ascending: false })
        .limit(20);

      if (!bookings || bookings.length === 0) return;

      // Fetch package names and time slots in parallel
      const packageIds = [...new Set(bookings.map((b) => b.package_id))];
      const slotIds = [...new Set(bookings.map((b) => b.preferred_time_slot_id))];

      const [pkgRes, slotRes] = await Promise.all([
        supabase.from("service_packages").select("id, name").in("id", packageIds),
        supabase.from("available_time_slots").select("id, slot_label").in("id", slotIds),
      ]);

      const pkgMap: Record<string, string> = {};
      pkgRes.data?.forEach((p) => { pkgMap[p.id] = p.name; });

      const slotMap: Record<string, string> = {};
      slotRes.data?.forEach((s) => { slotMap[s.id] = s.slot_label; });

      const notifications: BookingNotification[] = bookings.map((b) => ({
        id: b.id,
        district: b.district,
        package_name: pkgMap[b.package_id] || "সোফা ক্লিনিং",
        preferred_time: slotMap[b.preferred_time_slot_id] || "",
        minutes_ago: getMinutesAgo(b.created_at),
      }));

      setQueue(notifications);
      initialLoadDone.current = true;
    };

    loadTodayBookings();
  }, []);

  // Cycle through queue with 8s display + 3s gap
  useEffect(() => {
    if (queue.length > 0 && !visible) {
      const delay = setTimeout(() => {
        const [next, ...rest] = queue;
        setCurrent(next);
        setVisible(true);
        // Re-add to end for continuous cycling
        setQueue([...rest, next]);

        timeoutRef.current = setTimeout(() => {
          setVisible(false);
        }, 6000);
      }, 4000); // Gap between notifications

      return () => clearTimeout(delay);
    }
  }, [queue, visible]);

  // Clear current after hide animation
  useEffect(() => {
    if (!visible && current) {
      const t = setTimeout(() => setCurrent(null), 500);
      return () => clearTimeout(t);
    }
  }, [visible, current]);

  // Listen for new realtime bookings and prepend to queue
  useEffect(() => {
    const channel = supabase
      .channel("live-bookings")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "bookings" },
        async (payload) => {
          const booking = payload.new as any;

          const [pkgRes, slotRes] = await Promise.all([
            supabase.from("service_packages").select("name").eq("id", booking.package_id).single(),
            supabase.from("available_time_slots").select("slot_label").eq("id", booking.preferred_time_slot_id).single(),
          ]);

          const notification: BookingNotification = {
            id: booking.id,
            district: booking.district,
            package_name: pkgRes.data?.name || "সোফা ক্লিনিং",
            preferred_time: slotRes.data?.slot_label || "",
            minutes_ago: 1,
          };

          setQueue((prev) => [notification, ...prev]);
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
      className={`fixed bottom-24 left-4 z-50 max-w-[320px] sm:max-w-xs transition-all duration-500 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
      }`}
    >
      <div className="bg-card/95 backdrop-blur-xl rounded-2xl shadow-[var(--shadow-elevated)] border border-border/50 p-4">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <ShoppingBag className="h-5 w-5 text-primary" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 space-y-0.5">
            {/* Location + District */}
            <div className="flex items-center gap-1.5">
              {current.district && (
                <span className="font-bold text-sm text-foreground truncate">
                  {current.district}
                </span>
              )}
            </div>

            {/* Package + Time */}
            <p className="text-xs text-muted-foreground truncate">
              {current.package_name} বুক করেছেন
              {current.preferred_time && ` • ${current.preferred_time}`}
            </p>

            {/* Time ago */}
            <p className="text-[11px] text-muted-foreground/70">
              {formatMinutesAgo(current.minutes_ago)}
            </p>
          </div>

          {/* Live indicator */}
          <span className="relative flex h-2 w-2 mt-1.5 flex-shrink-0">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
          </span>
        </div>
      </div>
    </div>
  );
}
