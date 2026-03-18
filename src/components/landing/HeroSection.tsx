import { Phone, ArrowDown, Shield, Clock, Sparkles, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSiteSettings } from "@/hooks/use-landing-data";

const highlights = [
  { icon: Shield, text: "১০০% সন্তুষ্টি গ্যারান্টি" },
  { icon: Clock, text: "সময়মত সার্ভিস" },
  { icon: Sparkles, text: "প্রফেশনাল গ্রেড" },
];

export default function HeroSection() {
  const { data: settings } = useSiteSettings();

  const scrollToBooking = () => {
    document.getElementById("booking-form")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative gradient-hero-bg pt-24 pb-32 overflow-hidden">
      {/* Animated decorative orbs */}
      <div className="absolute top-10 right-[10%] w-80 h-80 bg-white/[0.07] rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 left-[5%] w-64 h-64 bg-white/[0.05] rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-white/[0.02] rounded-full" />
      
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

      <div className="container relative z-10">
        <div className="max-w-2xl mx-auto text-center space-y-7 animate-fade-in-up">
          {/* Trust badge */}
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md rounded-full px-5 py-2 border border-white/20">
            <Star className="h-4 w-4 text-accent fill-accent" />
            <span className="text-sm text-white/90 font-medium">ঢাকার #১ সোফা ক্লিনিং সার্ভিস</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-[1.15] tracking-tight">
            {settings?.hero_headline || "আপনার সোফা হোক ঝকঝকে পরিষ্কার"}
          </h1>
          <p className="text-lg md:text-xl text-white/85 font-medium max-w-xl mx-auto leading-relaxed">
            {settings?.hero_subheadline || "ঢাকায় ঘরে বসেই প্রফেশনাল সোফা ক্লিনিং"}
          </p>
          {settings?.hero_explainer && (
            <p className="text-base text-white/60 max-w-lg mx-auto">
              {settings.hero_explainer}
            </p>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Button
              onClick={scrollToBooking}
              className="bg-white text-primary hover:bg-white/95 hover:scale-105 text-lg font-bold px-10 py-4 h-auto rounded-full transition-all duration-300 glow-primary shadow-xl"
            >
              এখনই বুক করুন
              <ArrowDown className="h-5 w-5 ml-1 animate-bounce" />
            </Button>
          </div>

          {/* Highlights */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            {highlights.map((h, i) => (
              <div key={i} className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-5 py-2.5 border border-white/10 hover:bg-white/15 transition-colors duration-300">
                <h.icon className="h-4 w-4 text-white/90" />
                <span className="text-sm text-white/90 font-medium">{h.text}</span>
              </div>
            ))}
          </div>

          {/* Contact info */}
          {settings?.helpline_number && (
            <div className="flex items-center justify-center gap-2 text-sm pt-1">
              <a href={`tel:${settings.helpline_number}`} className="flex items-center gap-1.5 text-white/70 font-medium hover:text-white transition-colors">
                <Phone className="h-4 w-4" /> {settings.helpline_number}
              </a>
            </div>
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
