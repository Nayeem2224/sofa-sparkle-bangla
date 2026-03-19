import { useState, useEffect } from "react";
import { Sparkles } from "lucide-react";
import { useSiteSettings } from "@/hooks/use-landing-data";

export default function SpecialOfferBanner() {
  const { data: settings } = useSiteSettings();

  const offerEnabled = settings?.offer_enabled === "true";
  const originalPrice = settings?.offer_original_price || "৳৩,৯৯৯";
  const offerPrice = settings?.offer_price || "৳৯৯৯";
  const offerText = settings?.offer_text || "স্পেশাল অফার!";
  // Default: 24 hours from now
  const offerDurationHours = parseInt(settings?.offer_duration_hours || "24", 10);

  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    // Use a consistent end time stored in sessionStorage so it doesn't reset on re-render
    const storageKey = "offer_end_time";
    let endTime = sessionStorage.getItem(storageKey);
    if (!endTime) {
      const end = Date.now() + offerDurationHours * 60 * 60 * 1000;
      sessionStorage.setItem(storageKey, end.toString());
      endTime = end.toString();
    }
    const end = parseInt(endTime, 10);

    const tick = () => {
      const diff = Math.max(0, end - Date.now());
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor(diff % (1000 * 60 * 60) / (1000 * 60));
      const seconds = Math.floor(diff % (1000 * 60) / 1000);
      setTimeLeft({ hours, minutes, seconds });
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [offerDurationHours]);

  if (!offerEnabled) return null;

  const pad = (n: number) => n.toString().padStart(2, "0");

  return (
    <div className="w-full px-3 py-2 sm:py-3">
      <div
        className="mx-auto max-w-5xl rounded-2xl px-4 py-3 sm:px-8 sm:py-4 flex items-center justify-center gap-3 sm:gap-6 flex-wrap"
        style={{
          background: "linear-gradient(135deg, hsl(160, 80%, 30%) 0%, hsl(160, 70%, 50%) 50%, hsl(155, 65%, 55%) 100%)"
        }}>
        
        {/* Offer text */}
        <div className="flex items-center gap-2 text-white font-bold text-sm sm:text-base md:text-lg">
          <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-300 animate-pulse" />
          <span>{offerText}</span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2 text-white">
          <span className="line-through opacity-60 text-sm sm:text-base">{originalPrice}</span>
          <span className="text-lg sm:text-xl font-extrabold">→</span>
          <span className="text-lg sm:text-2xl font-extrabold text-[#f2f4f7]">{offerPrice}</span>
        </div>

        {/* Countdown */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          {[pad(timeLeft.hours), pad(timeLeft.minutes), pad(timeLeft.seconds)].map((val, i) =>
          <span key={i} className="flex items-center gap-1 sm:gap-1.5">
              {i > 0 && <span className="text-white font-bold text-lg">:</span>}
              <span className="bg-white/20 backdrop-blur-sm text-white font-mono font-bold text-sm sm:text-lg px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg min-w-[2rem] sm:min-w-[2.5rem] text-center">
                {val}
              </span>
            </span>
          )}
        </div>
      </div>
    </div>);

}