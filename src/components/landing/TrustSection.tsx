import { Shield, Users, Clock, Wallet, Star, RefreshCw, CheckCircle } from "lucide-react";
import { useSiteSettings } from "@/hooks/use-landing-data";

const benefits = [
  { icon: Shield, text: "নিরাপদ কেমিক্যাল", color: "text-emerald-400" },
  { icon: Users, text: "প্রশিক্ষিত টিম", color: "text-primary" },
  { icon: Clock, text: "একদিনেই সার্ভিস", color: "text-accent" },
  { icon: Wallet, text: "সাশ্রয়ী মূল্য", color: "text-emerald-400" },
  { icon: Star, text: "৫ ষ্টার রেটিং", color: "text-accent" },
  { icon: RefreshCw, text: "৬ মাসের ফলো-আপ", color: "text-blue-400" },
];

export default function TrustSection() {
  const { data: settings } = useSiteSettings();

  return (
    <section className="relative py-16 md:py-24 overflow-hidden">
      <div className="absolute inset-0 hero-dark-bg" />

      <div className="container relative z-10 px-4">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-center text-white mb-10 sm:mb-14">
          কেন <span className="gradient-text">Purexify?</span>
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 max-w-3xl mx-auto">
          {benefits.map((b, i) => (
            <div
              key={i}
              className="group flex flex-col items-center justify-center gap-3 sm:gap-4 bg-white/[0.06] backdrop-blur-sm rounded-2xl p-5 sm:p-7 border border-white/10 hover:border-white/20 hover:bg-white/[0.1] transition-all duration-300 hover:-translate-y-1"
            >
              <b.icon className={`h-7 w-7 sm:h-8 sm:w-8 ${b.color} group-hover:scale-110 transition-transform duration-300`} />
              <span className="text-sm sm:text-base font-bold text-white/90 text-center leading-snug">{b.text}</span>
            </div>
          ))}
        </div>

        {settings?.guarantee_text && (
          <div className="flex items-center justify-center gap-3 mt-10 sm:mt-14 bg-white/[0.08] backdrop-blur-sm text-white rounded-2xl py-4 sm:py-5 px-6 sm:px-8 max-w-lg mx-auto border border-white/10">
            <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0 text-emerald-400" />
            <span className="font-bold text-sm sm:text-base">{settings.guarantee_text}</span>
          </div>
        )}
      </div>
    </section>
  );
}
