import { Sparkles, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSiteSettings } from "@/hooks/use-landing-data";

export default function CTASection() {
  const { data: settings } = useSiteSettings();

  const scrollToBooking = () => {
    document.getElementById("booking-form")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative py-20 overflow-hidden gradient-hero-bg">
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
      <div className="container relative z-10 text-center space-y-6 max-w-2xl mx-auto">
        <Sparkles className="h-8 w-8 text-primary-foreground/80 mx-auto" />
        <h2 className="text-2xl md:text-4xl font-extrabold text-primary-foreground leading-tight">
          আজই বুক করুন — সীমিত স্লট বাকি!
        </h2>
        <p className="text-primary-foreground/70 text-sm md:text-base max-w-md mx-auto">
          এখনই না করলে আপনার পছন্দের সময় অন্য কেউ নিয়ে নিতে পারে
        </p>

        <Button
          onClick={scrollToBooking}
          size="lg"
          className="bg-white text-primary hover:bg-white/95 hover:scale-105 text-lg font-bold px-10 py-5 h-auto rounded-full transition-all duration-300 shadow-xl animate-cta-pulse"
        >
          এখনই বুক করুন ↗
        </Button>

        {settings?.helpline_number && (
          <a href={`tel:${settings.helpline_number}`} className="flex items-center justify-center gap-1.5 text-primary-foreground/70 text-sm hover:text-primary-foreground transition-colors">
            <Phone className="h-4 w-4" /> {settings.helpline_number}
          </a>
        )}
      </div>
    </section>
  );
}
