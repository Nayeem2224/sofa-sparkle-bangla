import { Shield, SprayCan, Baby, Clock, Users, CheckCircle } from "lucide-react";
import { useSiteSettings } from "@/hooks/use-landing-data";

const benefits = [
  { icon: SprayCan, text: "প্রফেশনাল গ্রেড ইকুইপমেন্ট ও মেশিন" },
  { icon: Baby, text: "বাচ্চা ও পোষা প্রাণীর জন্য সম্পূর্ণ নিরাপদ" },
  { icon: Shield, text: "১০০% সন্তুষ্টি গ্যারান্টি — না হলে ফ্রি রি-ক্লিন" },
  { icon: Users, text: "প্রশিক্ষিত ও ইউনিফর্মড টিম" },
  { icon: Clock, text: "সময়মত সার্ভিস গ্যারান্টিড" },
];

export default function TrustSection() {
  const { data: settings } = useSiteSettings();

  return (
    <section className="bg-[hsl(var(--surface-aqua))] py-20 pb-24 relative">
      <div className="container">
        <h2 className="text-2xl md:text-4xl font-extrabold text-center text-foreground mb-3">
          কেন <span className="gradient-text">Purexify</span> বেছে নেবেন?
        </h2>
        {settings?.total_customers && (
          <p className="text-center text-lg font-medium text-foreground mb-10">
            <span className="text-4xl font-extrabold gradient-text">{settings.total_customers}</span>+ সন্তুষ্ট গ্রাহক
          </p>
        )}

        {/* Benefits */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto mb-14 stagger-children">
          {benefits.map((b, i) => (
            <div key={i} className="group flex items-center gap-3 bg-background rounded-2xl p-5 shadow-[var(--shadow-card)] border border-border/40 hover:shadow-[var(--shadow-elevated)] hover:-translate-y-1 hover:border-primary/20 transition-all duration-300">
              <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-gradient-to-br from-primary/15 to-accent/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <b.icon className="h-5 w-5 text-primary" />
              </div>
              <span className="text-sm text-foreground font-medium">{b.text}</span>
            </div>
          ))}
        </div>

        {/* Guarantee */}
        {settings?.guarantee_text && (
          <div className="flex items-center justify-center gap-3 gradient-hero-bg text-white rounded-3xl py-5 px-8 max-w-lg mx-auto shadow-xl">
            <CheckCircle className="h-6 w-6 flex-shrink-0" />
            <span className="font-bold text-base">{settings.guarantee_text}</span>
          </div>
        )}
      </div>

      <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none">
        <svg viewBox="0 0 1440 80" className="relative block w-full h-12" preserveAspectRatio="none">
          <path fill="hsl(var(--surface-grey))" d="M0,40 C360,80 720,0 1440,40 L1440,80 L0,80 Z" />
        </svg>
      </div>
    </section>
  );
}
