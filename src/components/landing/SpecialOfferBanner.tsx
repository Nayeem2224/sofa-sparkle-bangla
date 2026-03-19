import { useState, useEffect } from "react";
import { Sparkles, Flame, Gift, Clock } from "lucide-react";
import { useSiteSettings } from "@/hooks/use-landing-data";

export default function SpecialOfferBanner() {
  const { data: settings } = useSiteSettings();

  const offerEnabled = settings?.offer_enabled === "true";
  const originalPrice = settings?.offer_original_price || "৳৩,৯৯৯";
  const offerPrice = settings?.offer_price || "৳৯৯৯";
  const offerText = settings?.offer_text || "স্পেশাল অফার!";
  const offerDurationHours = parseInt(settings?.offer_duration_hours || "24", 10);

  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
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
  const timerLabels = ["ঘণ্টা", "মিনিট", "সেকেন্ড"];
  const timerValues = [pad(timeLeft.hours), pad(timeLeft.minutes), pad(timeLeft.seconds)];

  return (
    <div className="w-full px-3 py-3 sm:py-4">
      <div className="mx-auto max-w-5xl relative overflow-hidden rounded-3xl shadow-2xl">
        {/* Animated background layers */}
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-700 via-teal-600 to-emerald-800" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(255,255,255,0.12)_0%,transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_rgba(0,0,0,0.15)_0%,transparent_60%)]" />
        
        {/* Floating sparkle dots */}
        <div className="absolute top-2 left-[10%] w-1.5 h-1.5 bg-yellow-300/60 rounded-full animate-pulse" />
        <div className="absolute bottom-3 left-[25%] w-1 h-1 bg-white/40 rounded-full animate-pulse delay-300" />
        <div className="absolute top-4 right-[15%] w-1 h-1 bg-yellow-200/50 rounded-full animate-pulse delay-700" />
        <div className="absolute bottom-2 right-[30%] w-1.5 h-1.5 bg-emerald-200/40 rounded-full animate-pulse delay-500" />

        {/* Corner ribbon */}
        <div className="absolute -top-1 -right-1 w-20 h-20 overflow-hidden">
          <div className="absolute top-[10px] right-[-28px] w-[120px] text-center bg-red-500 text-white text-[9px] font-bold py-0.5 rotate-45 shadow-md tracking-wide">
            LIMITED
          </div>
        </div>

        <div className="relative z-10 px-4 py-4 sm:px-8 sm:py-5 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8">
          
          {/* Offer badge + text */}
          <div className="flex items-center gap-3">
            <div className="relative flex-shrink-0">
              <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/20 shadow-lg">
                <Gift className="h-5 w-5 sm:h-7 sm:w-7 text-yellow-300" />
              </div>
              <Flame className="absolute -top-1.5 -right-1.5 h-4 w-4 text-orange-400 animate-bounce" />
            </div>
            <div className="text-center sm:text-left">
              <div className="flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-yellow-300 animate-pulse" />
                <span className="text-yellow-200 text-[10px] sm:text-xs font-bold uppercase tracking-widest">
                  সীমিত সময়
                </span>
              </div>
              <span className="text-white font-extrabold text-base sm:text-xl block leading-tight mt-0.5">
                {offerText}
              </span>
            </div>
          </div>

          {/* Price comparison */}
          <div className="flex items-center gap-2.5 sm:gap-3 bg-white/10 backdrop-blur-sm rounded-2xl px-4 py-2.5 sm:px-5 sm:py-3 border border-white/15 shadow-inner">
            <div className="text-center">
              <span className="text-white/50 text-[9px] sm:text-[10px] uppercase tracking-wider block">আগে</span>
              <span className="line-through text-white/50 text-sm sm:text-lg font-bold">{originalPrice}</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-xl sm:text-2xl">→</span>
            </div>
            <div className="text-center">
              <span className="text-yellow-300 text-[9px] sm:text-[10px] uppercase tracking-wider block font-semibold">এখন</span>
              <span className="text-white text-xl sm:text-3xl font-black drop-shadow-lg">{offerPrice}</span>
            </div>
          </div>

          {/* Countdown timer */}
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-1 text-white/70 mb-1">
              <Clock className="h-3 w-3" />
              <span className="text-[9px] sm:text-[10px] uppercase tracking-widest font-semibold">অফার শেষ হবে</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              {timerValues.map((val, i) => (
                <div key={i} className="flex items-center gap-1.5 sm:gap-2">
                  {i > 0 && <span className="text-white/60 font-bold text-lg sm:text-xl -mt-3">:</span>}
                  <div className="flex flex-col items-center">
                    <div className="relative">
                      <div className="bg-black/30 backdrop-blur-md text-white font-mono font-black text-lg sm:text-2xl px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-xl min-w-[2.5rem] sm:min-w-[3.5rem] text-center border border-white/10 shadow-lg">
                        {val}
                      </div>
                      <div className="absolute inset-x-0 top-1/2 h-px bg-white/10" />
                    </div>
                    <span className="text-white/50 text-[8px] sm:text-[9px] mt-1 font-medium">{timerLabels[i]}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
