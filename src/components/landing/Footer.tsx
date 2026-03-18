import { Phone, MessageCircle } from "lucide-react";
import { useSiteSettings } from "@/hooks/use-landing-data";

export default function Footer() {
  const { data: settings } = useSiteSettings();

  return (
    <footer className="bg-primary text-primary-foreground py-10">
      <div className="container text-center space-y-4">
        <h3 className="text-xl font-extrabold font-poppins">{settings?.business_name || "Purexify"}</h3>
        <p className="text-sm opacity-80">{settings?.tagline || ""}</p>
        <div className="flex items-center justify-center gap-6 text-sm">
          {settings?.helpline_number && (
            <a href={`tel:${settings.helpline_number}`} className="flex items-center gap-1.5 hover:opacity-80 transition-opacity">
              <Phone className="h-4 w-4" /> {settings.helpline_number}
            </a>
          )}
          {settings?.whatsapp_number && (
            <a href={`https://wa.me/${settings.whatsapp_number}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:opacity-80 transition-opacity">
              <MessageCircle className="h-4 w-4" /> WhatsApp
            </a>
          )}
        </div>
        <p className="text-xs opacity-50">© {new Date().getFullYear()} Purexify. সর্বস্বত্ব সংরক্ষিত।</p>
      </div>
    </footer>
  );
}
