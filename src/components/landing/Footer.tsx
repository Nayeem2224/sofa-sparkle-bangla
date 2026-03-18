import { Phone, MessageCircle, Heart, ExternalLink } from "lucide-react";
import { useSiteSettings } from "@/hooks/use-landing-data";

export default function Footer() {
  const { data: settings } = useSiteSettings();

  return (
    <footer className="relative gradient-hero-bg text-white py-14 overflow-hidden">
      {/* Decorative */}
      <div className="absolute top-0 right-0 w-60 h-60 bg-white/[0.03] rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/[0.03] rounded-full blur-3xl" />
      
      <div className="container relative z-10 text-center space-y-5">
        <h3 className="text-2xl font-extrabold font-poppins tracking-tight">
          {settings?.business_name || "Purexify"}
        </h3>
        <p className="text-sm text-white/70 max-w-md mx-auto">{settings?.tagline || ""}</p>
        <div className="flex items-center justify-center gap-6 text-sm">
          {settings?.helpline_number && (
            <a href={`tel:${settings.helpline_number}`} className="flex items-center gap-1.5 text-white/80 hover:text-white transition-colors bg-white/10 rounded-full px-4 py-2">
              <Phone className="h-4 w-4" /> {settings.helpline_number}
            </a>
          )}
          {settings?.whatsapp_number && (
            <a href={`https://wa.me/${settings.whatsapp_number}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-white/80 hover:text-white transition-colors bg-white/10 rounded-full px-4 py-2">
              <MessageCircle className="h-4 w-4" /> WhatsApp
            </a>
          )}
        </div>
        <div className="h-px bg-white/10 max-w-xs mx-auto" />
        <p className="text-xs text-white/40 flex items-center justify-center gap-1">
          © {new Date().getFullYear()} Purexify. Made with <Heart className="h-3 w-3 fill-current text-white/50" /> in Bangladesh
        </p>
        
        {/* Marketify Credit */}
        <div className="flex items-center justify-center gap-1.5 text-xs text-white/35">
          <span>Design & Marketing Partner</span>
          <a
            href="https://wa.me/8801794035977"
            target="_blank"
            rel="noopener noreferrer"
            className="relative inline-flex items-center gap-1 text-white/60 font-bold px-3 py-1 rounded-full border border-white/10 bg-white/5 hover:bg-white/15 hover:text-white hover:border-white/30 hover:shadow-[0_0_20px_rgba(255,255,255,0.15)] transition-all duration-300 group"
          >
            <span className="relative z-10">Marketify</span>
            <ExternalLink className="h-3 w-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
          </a>
        </div>
      </div>
    </footer>
  );
}
