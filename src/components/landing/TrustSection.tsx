import { Shield, SprayCan, Baby, Clock, Users, CheckCircle, Quote } from "lucide-react";
import { useSiteSettings } from "@/hooks/use-landing-data";

const benefits = [
  { icon: SprayCan, text: "প্রফেশনাল গ্রেড ইকুইপমেন্ট ও মেশিন" },
  { icon: Baby, text: "বাচ্চা ও পোষা প্রাণীর জন্য সম্পূর্ণ নিরাপদ" },
  { icon: Shield, text: "১০০% সন্তুষ্টি গ্যারান্টি — না হলে ফ্রি রি-ক্লিন" },
  { icon: Users, text: "প্রশিক্ষিত ও ইউনিফর্মড টিম" },
  { icon: Clock, text: "সময়মত সার্ভিস গ্যারান্টিড" },
];

const testimonials = [
  { name: "রাফি আহমেদ", location: "ধানমন্ডি, ঢাকা", review: "দারুণ সার্ভিস! সোফা একদম নতুনের মতো হয়ে গেছে। বাচ্চারা এখন নিরাপদে বসতে পারছে।" },
  { name: "নুসরাত জাহান", location: "উত্তরা, ঢাকা", review: "সময়মত এসেছে, পেশাদারভাবে কাজ করেছে। খুবই সন্তুষ্ট। সবাইকে রিকমেন্ড করি।" },
  { name: "তানভীর হাসান", location: "চট্টগ্রাম", review: "ঢাকার বাইরে হওয়া সত্ত্বেও অসাধারণ সার্ভিস পেয়েছি। দাগ ও গন্ধ সম্পূর্ণ দূর হয়েছে।" },
];

export default function TrustSection() {
  const { data: settings } = useSiteSettings();

  return (
    <section className="bg-surface-aqua py-16 pb-20 relative">
      <div className="container">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-foreground mb-2">
          কেন <span className="text-primary">Purexify</span> বেছে নেবেন?
        </h2>
        {settings?.total_customers && (
          <p className="text-center text-lg font-medium text-foreground mb-8">
            <span className="text-3xl font-extrabold text-primary">{settings.total_customers}</span>+ সন্তুষ্ট গ্রাহক
          </p>
        )}

        {/* Benefits */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto mb-12 stagger-children">
          {benefits.map((b, i) => (
            <div key={i} className="flex items-center gap-3 bg-background rounded-xl p-4 shadow-card border border-border/50 hover:shadow-elevated transition-shadow duration-300">
              <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <b.icon className="h-5 w-5 text-primary" />
              </div>
              <span className="text-sm text-foreground font-medium">{b.text}</span>
            </div>
          ))}
        </div>

        {/* Guarantee */}
        {settings?.guarantee_text && (
          <div className="flex items-center justify-center gap-3 mb-12 bg-primary text-primary-foreground rounded-2xl py-4 px-6 max-w-lg mx-auto shadow-elevated">
            <CheckCircle className="h-6 w-6 flex-shrink-0" />
            <span className="font-bold text-base">{settings.guarantee_text}</span>
          </div>
        )}

        {/* Testimonials */}
        <h3 className="text-xl font-bold text-center text-foreground mb-6">গ্রাহকদের মতামত</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto stagger-children">
          {testimonials.map((t, i) => (
            <div key={i} className="bg-background rounded-2xl p-6 shadow-card border border-border/50 hover:shadow-elevated transition-all duration-300">
              <Quote className="h-6 w-6 text-primary/30 mb-2" />
              <p className="text-sm text-foreground leading-relaxed mb-4">"{t.review}"</p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-bold text-primary">{t.name.charAt(0)}</span>
                </div>
                <div>
                  <p className="font-bold text-sm text-foreground">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.location}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none">
        <svg viewBox="0 0 1440 80" className="relative block w-full h-12">
          <path fill="hsl(var(--background))" d="M0,40 C360,80 720,0 1440,40 L1440,80 L0,80 Z" />
        </svg>
      </div>
    </section>
  );
}
