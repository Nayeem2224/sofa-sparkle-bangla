import { Phone, MessageCircle, Mail, MapPin, ExternalLink } from "lucide-react";
import { useSiteSettings } from "@/hooks/use-landing-data";
import { Link } from "react-router-dom";

export default function Footer() {
  const { data: settings } = useSiteSettings();

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <footer className="relative bg-[hsl(220,25%,10%)] text-white overflow-hidden">
      {/* Top gradient accent */}
      <div className="h-1 w-full gradient-hero-bg" />

      <div className="container py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="space-y-4">
            <h3 className="text-xl font-extrabold font-poppins tracking-tight text-white">
              🧽 {settings?.business_name || "Purexify"}
            </h3>
            <p className="text-sm text-white/50 leading-relaxed">
              {settings?.tagline || "আপনার সোফার সেরা যত্ন — ঘরে বসেই প্রফেশনাল ক্লিনিং সেবা।"}
            </p>
            <div className="flex gap-3">
              {settings?.facebook_url &&
              <a href={settings.facebook_url} target="_blank" rel="noopener noreferrer" className="px-4 py-2 rounded-full bg-white/10 text-xs text-white/70 hover:bg-white/20 hover:text-white transition-all">
                  Facebook
                </a>
              }
              {settings?.instagram_url &&
              <a href={settings.instagram_url} target="_blank" rel="noopener noreferrer" className="px-4 py-2 rounded-full bg-white/10 text-xs text-white/70 hover:bg-white/20 hover:text-white transition-all">
                  Instagram
                </a>
              }
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-white/80 uppercase tracking-wider">লিংক</h4>
            <div className="space-y-2.5">
              {[
              { label: "হোম", action: () => window.scrollTo({ top: 0, behavior: "smooth" }) },
              { label: "মূল্য", action: () => scrollToSection("pricing") },
              { label: "বুকিং", action: () => scrollToSection("booking-form") },
              { label: "যোগাযোগ", action: () => scrollToSection("booking-form") }].
              map((link) =>
              <button key={link.label} onClick={link.action} className="block text-sm text-white/50 hover:text-white transition-colors">
                  {link.label}
                </button>
              )}
            </div>
          </div>

          {/* Policies */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-white/80 uppercase tracking-wider">নীতিমালা</h4>
            <div className="space-y-2.5">
              {["প্রাইভেসী পলিসি", "রিফান্ড পলিসি", "টার্মস অব সার্ভিস", "কুকি পলিসি"].map((text) =>
              <span key={text} className="block text-sm text-white/50 cursor-default">
                  {text}
                </span>
              )}
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-white/80 uppercase tracking-wider">যোগাযোগ</h4>
            <div className="space-y-3">
              {settings?.contact_email &&
              <a href={`mailto:${settings.contact_email}`} className="flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors">
                  <Mail className="h-4 w-4 flex-shrink-0" /> {settings.contact_email}
                </a>
              }
              {settings?.helpline_number &&
              <a href={`tel:${settings.helpline_number}`} className="flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors">
                  <Phone className="h-4 w-4 flex-shrink-0" /> {settings.helpline_number}
                </a>
              }
              {settings?.whatsapp_number &&
              <div className="flex flex-col gap-2 pt-1">
                  <a
                  href={`https://wa.me/${settings.whatsapp_number}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20BD5A] text-white text-sm font-bold px-5 py-2.5 rounded-full transition-all hover:scale-105">
                  
                    <MessageCircle className="h-4 w-4" /> হোয়াটসঅ্যাপ
                  </a>
                  <a
                  href={`tel:${settings.helpline_number || settings.whatsapp_number}`}
                  className="inline-flex items-center justify-center gap-2 border border-white/20 text-white/80 text-sm px-5 py-2.5 rounded-full hover:bg-white/10 transition-all">
                  
                    <Phone className="h-4 w-4" /> কল করুন
                  </a>
                </div>
              }
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-white/10 mt-10 pt-6 text-center">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-lg font-thin font-sans text-center text-accent-foreground">
            <div className="flex flex-wrap items-center gap-3">
              

              
              

              
            </div>

            <p className="text-lg text-center font-mono font-medium text-primary-foreground">
              © {new Date().getFullYear()} Purexify সর্বস্বত্ব সংরক্ষিত | Designed & Marketing By{" "}
              <a
                href="https://wa.me/8801794035977"
                target="_blank"
                rel="noopener noreferrer"
                className="relative inline-flex items-center gap-1 text-white/50 font-bold hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.4)] transition-all duration-300 group">
                
                Marketify
                <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>);

}