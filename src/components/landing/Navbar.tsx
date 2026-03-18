import { Phone, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSiteSettings } from "@/hooks/use-landing-data";
import { useState } from "react";

export default function Navbar() {
  const { data: settings } = useSiteSettings();
  const [mobileOpen, setMobileOpen] = useState(false);

  const scrollToBooking = () => {
    setMobileOpen(false);
    document.getElementById("booking-form")?.scrollIntoView({ behavior: "smooth" });
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

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          {settings?.helpline_number && (
            <a href={`tel:${settings.helpline_number}`} className="hidden sm:flex items-center gap-1.5 text-sm text-primary font-semibold hover:text-primary/80 transition-colors">
              <Phone className="h-4 w-4" />
              {settings.helpline_number}
            </a>
          )}

          <Button variant="cta" size="sm" onClick={scrollToBooking} className="rounded-full shadow-lg">
            এখনই বুক করুন
          </Button>
        </div>
      </div>
    </nav>
  );
}
