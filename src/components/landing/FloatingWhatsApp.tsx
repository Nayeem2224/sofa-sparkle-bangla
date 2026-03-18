import { MessageCircle } from "lucide-react";
import { useSiteSettings } from "@/hooks/use-landing-data";

export default function FloatingWhatsApp() {
  const { data: settings } = useSiteSettings();

  if (!settings?.whatsapp_number) return null;

  return (
    <a
      href={`https://wa.me/${settings.whatsapp_number}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="WhatsApp এ যোগাযোগ করুন"
      className="whatsapp-float fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-full shadow-elevated transition-all duration-300 hover:scale-110 group"
    >
      <div className="flex items-center justify-center w-14 h-14 rounded-full">
        <MessageCircle className="h-7 w-7 fill-white stroke-white" />
      </div>
      <span className="max-w-0 overflow-hidden whitespace-nowrap text-sm font-bold opacity-0 group-hover:max-w-[160px] group-hover:opacity-100 group-hover:pr-4 transition-all duration-300">
        WhatsApp
      </span>
    </a>
  );
}
