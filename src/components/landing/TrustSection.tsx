import { Shield, Users, Clock, Wallet, Star, RefreshCw, CheckCircle, Sparkles } from "lucide-react";
import { useSiteSettings } from "@/hooks/use-landing-data";

const benefits = [
  { icon: Shield, text: "নিরাপদ কেমিক্যাল", desc: "বাচ্চা ও পোষা প্রাণীর জন্য সম্পূর্ণ নিরাপদ প্রোডাক্ট", color: "text-emerald-400", glow: "from-emerald-500/20 to-emerald-500/5" },
  { icon: Users, text: "প্রশিক্ষিত টিম", desc: "ইউনিফর্মড ও ভেরিফায়েড পেশাদার টিম", color: "text-primary", glow: "from-primary/20 to-primary/5" },
  { icon: Clock, text: "একদিনেই সার্ভিস", desc: "দ্রুত ও সময়মতো সার্ভিস ডেলিভারি", color: "text-accent", glow: "from-accent/20 to-accent/5" },
  { icon: Wallet, text: "সাশ্রয়ী মূল্য", desc: "বাজারের সেরা মূল্যে প্রিমিয়াম সেবা", color: "text-emerald-400", glow: "from-emerald-500/20 to-emerald-500/5" },
  { icon: Star, text: "৫ ষ্টার রেটিং", desc: "হাজারো সন্তুষ্ট গ্রাহকের বিশ্বাস", color: "text-accent", glow: "from-accent/20 to-accent/5" },
  { icon: RefreshCw, text: "৬ মাসের ফলো-আপ", desc: "সার্ভিসের পরেও আমরা আপনার পাশে", color: "text-blue-400", glow: "from-blue-500/20 to-blue-500/5" },
];

export default function TrustSection() {
  const { data: settings } = useSiteSettings();

  return (
    <section className="relative py-16 md:py-24 overflow-hidden">
      <div className="absolute inset-0 hero-dark-bg" />
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "40px 40px" }} />

      <div className="container relative z-10 px-4">
        {/* Header */}
        <div className="text-center mb-10 sm:mb-16">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-white/70 bg-white/10 rounded-full px-4 py-1.5 mb-4 border border-white/10">
            <Sparkles className="h-3.5 w-3.5 text-accent" /> কেন আমরাই সেরা?
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-extrabold text-white leading-tight">
            কেন <span className="gradient-text-warm">Purexify?</span>
          </h2>
          {settings?.total_customers && (
            <p className="text-white/50 mt-3 text-sm sm:text-base">
              <span className="text-2xl sm:text-3xl font-extrabold gradient-text-warm">{settings.total_customers}</span>+ সন্তুষ্ট গ্রাহকের পছন্দ
            </p>
          )}
        </div>

        {/* Benefits grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-5 max-w-4xl mx-auto">
          {benefits.map((b, i) => (
            <div
              key={i}
              className="group relative flex flex-col items-center text-center gap-2.5 sm:gap-4 bg-white/[0.05] backdrop-blur-sm rounded-2xl sm:rounded-3xl p-5 sm:p-8 border border-white/[0.08] hover:border-white/20 hover:bg-white/[0.08] transition-all duration-500 hover:-translate-y-1.5 overflow-hidden"
            >
              {/* Glow effect on hover */}
              <div className={`absolute inset-0 bg-gradient-to-b ${b.glow} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl sm:rounded-3xl`} />

              <div className="relative z-10">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/[0.08] border border-white/10 flex items-center justify-center mx-auto group-hover:scale-110 group-hover:bg-white/[0.12] transition-all duration-300">
                  <b.icon className={`h-6 w-6 sm:h-7 sm:w-7 ${b.color}`} />
                </div>
              </div>
              <div className="relative z-10 space-y-1">
                <span className="text-sm sm:text-base font-bold text-white block leading-snug">{b.text}</span>
                <span className="text-[11px] sm:text-xs text-white/40 leading-relaxed hidden sm:block">{b.desc}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Guarantee badge */}
        {settings?.guarantee_text && (
          <div className="mt-10 sm:mt-16 flex justify-center">
            <div className="inline-flex items-center gap-3 bg-gradient-to-r from-emerald-500/15 to-emerald-500/5 backdrop-blur-sm text-white rounded-full py-3 sm:py-4 px-6 sm:px-8 border border-emerald-500/20 shadow-[0_0_30px_-10px_rgba(16,185,129,0.3)]">
              <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0 text-emerald-400" />
              <span className="font-bold text-xs sm:text-sm">{settings.guarantee_text}</span>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
