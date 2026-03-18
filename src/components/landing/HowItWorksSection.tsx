import { CalendarCheck, Truck, SprayCan, Sparkles } from "lucide-react";

const steps = [
  { icon: CalendarCheck, title: "বুকিং দিন", desc: "অনলাইনে মাত্র ২ মিনিটে বুক করুন", color: "from-primary to-primary-glow" },
  { icon: Truck, title: "আমরা আসব", desc: "নির্ধারিত সময়ে টিম আপনার দরজায়", color: "from-accent to-primary" },
  { icon: SprayCan, title: "পরিষ্কার করব", desc: "পেশাদার ইকুইপমেন্ট দিয়ে সম্পূর্ণ ক্লিনিং", color: "from-primary-glow to-primary" },
  { icon: Sparkles, title: "সোফা নতুনের মতো", desc: "ধুলো, দাগ ও গন্ধমুক্ত ফলাফল", color: "from-primary to-accent" },
];

export default function HowItWorksSection() {
  return (
    <section className="bg-background py-20 relative">
      <div className="container">
        <h2 className="text-2xl md:text-4xl font-extrabold text-center text-foreground mb-3">
          কিভাবে <span className="gradient-text">কাজ করে?</span>
        </h2>
        <p className="text-center text-muted-foreground mb-14 text-lg">মাত্র ৪ টি সহজ ধাপে পরিষ্কার সোফা</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto stagger-children">
          {steps.map((s, i) => (
            <div key={i} className="flex flex-col items-center text-center space-y-4 group">
              <div className="relative">
                <div className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${s.color} flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300`}>
                  <s.icon className="h-9 w-9 text-white" />
                </div>
                <span className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-foreground text-background text-xs font-bold flex items-center justify-center shadow-md">
                  {i + 1}
                </span>
              </div>
              <h3 className="text-base font-bold text-foreground">{s.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none">
        <svg viewBox="0 0 1440 80" className="relative block w-full h-12" preserveAspectRatio="none">
          <path fill="hsl(var(--surface-grey))" d="M0,40 C360,80 720,0 1440,40 L1440,80 L0,80 Z" />
        </svg>
      </div>
    </section>
  );
}
