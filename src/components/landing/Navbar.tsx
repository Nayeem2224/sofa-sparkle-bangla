import { Phone, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSiteSettings } from "@/hooks/use-landing-data";
import { useState } from "react";
import { pixelLead, pixelContact } from "@/lib/pixel";

const navLinks = [
  { label: "সার্ভিস", target: "how-it-works" },
  { label: "আমাদের সার্ভিস দেখুন", target: "video-showcase" },
  { label: "মূল্য", target: "pricing" },
  { label: "রিভিউ", target: "testimonials" },
  { label: "সচরাচর প্রশ্ন", target: "faq" },
];

export default function Navbar() {
  const { data: settings } = useSiteSettings();
  const [mobileOpen, setMobileOpen] = useState(false);

  const scrollTo = (id: string) => {
    setMobileOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToBooking = () => {
    pixelLead({ content_name: "Navbar Book CTA" });
    scrollTo("booking-form");
  };

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl shadow-nav border-b border-border/30">
      <div className="container flex items-center justify-between py-3">
        {/* Left: Brand */}
        <div className="flex flex-col">
          <span className="text-xl font-extrabold gradient-text font-poppins tracking-tight">
            {settings?.business_name || "Purexify"}
          </span>
          <span className="text-[11px] text-muted-foreground leading-tight">
            {settings?.tagline || ""}
          </span>
        </div>

        {/* Center: Nav links (desktop) */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <button
              key={link.target}
              onClick={() => scrollTo(link.target)}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {link.label}
            </button>
          ))}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          {settings?.helpline_number && (
            <a
              href={`tel:${settings.helpline_number}`}
              className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary/80 transition-colors group"
            >
              <span className="relative flex h-7 w-7 items-center justify-center">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/30" />
                <span className="relative inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary/10">
                  <Phone className="h-3.5 w-3.5" />
                </span>
              </span>
              {settings.helpline_number}
            </a>
          )}

          <Button variant="cta" size="sm" onClick={scrollToBooking} className="rounded-full shadow-lg">
            বুক করুন
          </Button>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-1.5 text-muted-foreground hover:text-foreground"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border/30 bg-background/95 backdrop-blur-xl pb-4">
          <div className="container flex flex-col gap-2 pt-3">
            {navLinks.map((link) => (
              <button
                key={link.target}
                onClick={() => scrollTo(link.target)}
                className="text-sm font-medium text-muted-foreground hover:text-foreground py-2 text-left transition-colors"
              >
                {link.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
