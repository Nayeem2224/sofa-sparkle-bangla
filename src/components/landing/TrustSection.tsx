import { Shield, SprayCan, Baby, Clock, Users, CheckCircle, Quote, Star } from "lucide-react";
import { useSiteSettings } from "@/hooks/use-landing-data";

const benefits = [
  { icon: SprayCan, text: "প্রফেশনাল গ্রেড ইকুইপমেন্ট ও মেশিন" },
  { icon: Baby, text: "বাচ্চা ও পোষা প্রাণীর জন্য সম্পূর্ণ নিরাপদ" },
  { icon: Shield, text: "১০০% সন্তুষ্টি গ্যারান্টি — না হলে ফ্রি রি-ক্লিন" },
  { icon: Users, text: "প্রশিক্ষিত ও ইউনিফর্মড টিম" },
  { icon: Clock, text: "সময়মত সার্ভিস গ্যারান্টিড" },
];

const testimonials = [
  { name: "রাফি আহমেদ", location: "ধানমন্ডি, ঢাকা", review: "দারুণ সার্ভিস! সোফা একদম নতুনের মতো হয়ে গেছে। বাচ্চারা এখন নিরাপদে বসতে পারছে।", rating: 5 },
  { name: "নুসরাত জাহান", location: "উত্তরা, ঢাকা", review: "সময়মত এসেছে, পেশাদারভাবে কাজ করেছে। খুবই সন্তুষ্ট। সবাইকে রিকমেন্ড করি।", rating: 5 },
  { name: "তানভীর হাসান", location: "চট্টগ্রাম", review: "ঢাকার বাইরে হওয়া সত্ত্বেও অসাধারণ সার্ভিস পেয়েছি। দাগ ও গন্ধ সম্পূর্ণ দূর হয়েছে।", rating: 5 },
];

export default function TrustSection() {
  const { data: settings } = useSiteSettings();

  return (
    <section className="bg-surface-aqua py-20 pb-24 relative">
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
            <div key={i} className="group flex items-center gap-3 bg-background rounded-2xl p-5 shadow-card border border-border/40 hover:shadow-elevated hover:-translate-y-1 hover:border-primary/20 transition-all duration-300">
              <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-gradient-to-br from-primary/15 to-accent/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <b.icon className="h-5 w-5 text-primary" />
              </div>
              <span className="text-sm text-foreground font-medium">{b.text}</span>
            </div>
          ))}
        </div>

        {/* Guarantee */}
        {settings?.guarantee_text && (
          <div className="flex items-center justify-center gap-3 mb-14 gradient-hero-bg text-white rounded-3xl py-5 px-8 max-w-lg mx-auto shadow-xl">
            <CheckCircle className="h-6 w-6 flex-shrink-0" />
            <span className="font-bold text-base">{settings.guarantee_text}</span>
          </div>
        )}

        {/* Testimonials */}
        <h3 className="text-xl font-bold text-center text-foreground mb-8">গ্রাহকদের মতামত</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto stagger-children">
          {testimonials.map((t, i) => (
            <div key={i} className="bg-background rounded-3xl p-7 shadow-card border border-border/40 hover:shadow-elevated hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
              {/* Decorative corner */}
              <div className="absolute -top-4 -right-4 w-16 h-16 bg-primary/5 rounded-full blur-xl" />
              
              {/* Stars */}
              <div className="flex gap-0.5 mb-3">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} className="h-4 w-4 text-accent fill-accent" />
                ))}
              </div>
              
              <p className="text-sm text-foreground leading-relaxed mb-5 relative">"{t.review}"</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <span className="text-sm font-bold text-white">{t.name.charAt(0)}</span>
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
        <svg viewBox="0 0 1440 80" className="relative block w-full h-12" preserveAspectRatio="none">
          <path fill="hsl(var(--background))" d="M0,40 C360,80 720,0 1440,40 L1440,80 L0,80 Z" />
        </svg>
      </div>
    </section>
  );
}
