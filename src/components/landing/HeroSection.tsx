import { Phone, ArrowDown, Shield, Clock, Sparkles } from "lucide-react";
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
    <section className="relative bg-gradient-to-br from-primary via-primary to-primary/90 pt-20 pb-28 overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-white/5 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/[0.03] rounded-full" />

      <div className="container relative z-10">
        <div className="max-w-2xl mx-auto text-center space-y-6 animate-fade-in-up">
          <h1 className="text-3xl md:text-5xl font-extrabold text-white leading-tight">
            {settings?.hero_headline || "আপনার সোফা হোক ঝকঝকে পরিষ্কার"}
          </h1>
          <p className="text-lg md:text-xl text-white/90 font-medium">
            {settings?.hero_subheadline || "ঢাকায় ঘরে বসেই প্রফেশনাল সোফা ক্লিনিং"}
          </p>
          <p className="text-base text-white/70 max-w-lg mx-auto">
            {settings?.hero_explainer || ""}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button
              onClick={scrollToBooking}
              className="bg-white text-primary hover:bg-white/90 hover:scale-105 shadow-elevated text-lg font-bold px-8 py-3 h-auto rounded-full transition-all duration-300"
            >
              এখনই বুক করুন
              <ArrowDown className="h-5 w-5 ml-1 animate-bounce" />
            </Button>
          </div>

          {/* Highlights */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-6">
            {highlights.map((h, i) => (
              <div key={i} className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                <h.icon className="h-4 w-4 text-white" />
                <span className="text-sm text-white font-medium">{h.text}</span>
              </div>
            ))}
          </div>

          {/* Contact info */}
          {settings?.helpline_number && (
            <div className="flex items-center justify-center gap-2 text-sm pt-2">
              <a href={`tel:${settings.helpline_number}`} className="flex items-center gap-1.5 text-white/80 font-medium hover:text-white transition-colors">
                <Phone className="h-4 w-4" /> {settings.helpline_number}
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Wave divider */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none">
        <svg viewBox="0 0 1440 80" className="relative block w-full h-16">
          <path fill="hsl(var(--surface-grey))" d="M0,40 C360,80 720,0 1440,40 L1440,80 L0,80 Z" />
        </svg>
      </div>
    </section>
  );
}
