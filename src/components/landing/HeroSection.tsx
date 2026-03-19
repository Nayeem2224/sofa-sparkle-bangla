import { Phone, ArrowDown, Shield, Clock, Sparkles, Star, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSiteSettings } from "@/hooks/use-landing-data";
import { useState, useEffect } from "react";

const trustBadges = [
  { icon: Shield, text: "নিরাপদ" },
  { icon: Clock, text: "একদিনেই" },
  { icon: Sparkles, text: "৫ ষ্টার" },
];

export default function HeroSection() {
  const { data: settings } = useSiteSettings();
  const [viewerCount, setViewerCount] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setViewerCount(Math.floor(Math.random() * 3) + 1);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const scrollToBooking = () => {
    document.getElementById("booking-form")?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToPricing = () => {
    document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative gradient-hero-bg pt-20 pb-32 overflow-hidden">
      {/* Decorative orbs */}
      <div className="absolute top-10 right-[10%] w-80 h-80 bg-white/[0.07] rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 left-[5%] w-64 h-64 bg-white/[0.05] rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-white/[0.02] rounded-full" />
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "32px 32px" }} />

      <div className="container relative z-10">
        <div className="max-w-2xl mx-auto text-center space-y-6 animate-fade-in-up">
          {/* Live viewer badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-full px-4 py-1.5 border border-white/15 text-sm text-white/80">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-400" />
            </span>
            <Eye className="h-3.5 w-3.5" />
            <span>এখন <strong className="text-white">{viewerCount}</strong> জন দেখছেন</span>
          </div>

          {/* Tagline badge */}
          <div className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-md rounded-full px-5 py-2 border border-white/20">
            <Sparkles className="h-4 w-4 text-accent" />
            <span className="text-sm text-white/90 font-semibold">ঢাকায় #১ সোফা ক্লিনিং সার্ভিস</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-[1.15] tracking-tight">
            {settings?.hero_headline || (
              <>
                আপনার সোফা হোক
                <br />
                <span className="gradient-text">ঝকঝকে পরিষ্কার</span>
              </>
            )}
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-white/80 font-medium max-w-xl mx-auto leading-relaxed">
            {settings?.hero_subheadline || "প্রফেশনাল ডিপ ক্লিনিং — নিরাপদ, দ্রুত, ঘরে বসেই"}
          </p>

          {/* Trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            {trustBadges.map((b, i) => (
              <div key={i} className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/10">
                <b.icon className="h-4 w-4 text-white/90" />
                <span className="text-sm text-white/90 font-medium">{b.text}</span>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Button
              onClick={scrollToBooking}
              variant="cta"
              className="text-lg font-bold px-10 py-4 h-auto rounded-full shadow-xl hover:scale-105 transition-all duration-300"
            >
              এখনই বুক করুন
              <ArrowDown className="h-5 w-5 ml-1 animate-bounce" />
            </Button>
            <Button
              onClick={scrollToPricing}
              variant="outline"
              className="text-lg font-semibold px-8 py-4 h-auto rounded-full bg-transparent border-2 border-white/40 text-white hover:bg-white/10 hover:border-white/60 transition-all duration-300"
            >
              মূল্য দেখুন
            </Button>
          </div>

          {/* Phone number */}
          {settings?.helpline_number && (
            <a
              href={`tel:${settings.helpline_number}`}
              className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors pt-2"
            >
              <Phone className="h-4 w-4" />
              <span className="font-semibold">{settings.helpline_number}</span>
            </a>
          )}
        </div>
      </div>

      {/* Wave divider */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none">
        <svg viewBox="0 0 1440 100" className="relative block w-full h-20" preserveAspectRatio="none">
          <path fill="hsl(var(--surface-grey))" d="M0,50 C240,90 480,10 720,50 C960,90 1200,20 1440,50 L1440,100 L0,100 Z" />
        </svg>
      </div>
    </section>
  );
}
