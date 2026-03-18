import { CalendarCheck, Truck, SprayCan, Sparkles } from "lucide-react";

const steps = [
  { icon: CalendarCheck, title: "বুকিং দিন", desc: "অনলাইনে মাত্র ২ মিনিটে বুক করুন" },
  { icon: Truck, title: "আমরা আসব", desc: "নির্ধারিত সময়ে টিম আপনার দরজায়" },
  { icon: SprayCan, title: "পরিষ্কার করব", desc: "পেশাদার ইকুইপমেন্ট দিয়ে সম্পূর্ণ ক্লিনিং" },
  { icon: Sparkles, title: "সোফা নতুনের মতো", desc: "ধুলো, দাগ ও গন্ধমুক্ত ফলাফল" },
];

export default function HowItWorksSection() {
  return (
    <section className="bg-background py-16 relative">
      <div className="container">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-foreground mb-3">
          কিভাবে <span className="text-primary">কাজ করে?</span>
        </h2>
        <p className="text-center text-muted-foreground mb-12">মাত্র ৪ টি সহজ ধাপে পরিষ্কার সোফা</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto stagger-children">
          {steps.map((s, i) => (
            <div key={i} className="flex flex-col items-center text-center space-y-3 group">
              <div className="w-18 h-18 w-[72px] h-[72px] rounded-2xl bg-primary/10 flex items-center justify-center relative group-hover:bg-primary group-hover:shadow-elevated transition-all duration-300">
                <s.icon className="h-8 w-8 text-primary group-hover:text-white transition-colors duration-300" />
                <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center shadow-md">
                  {i + 1}
                </span>
              </div>
              <h3 className="text-base font-bold text-foreground">{s.title}</h3>
              <p className="text-sm text-muted-foreground">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none">
        <svg viewBox="0 0 1440 80" className="relative block w-full h-12">
          <path fill="hsl(var(--surface-grey))" d="M0,40 C360,80 720,0 1440,40 L1440,80 L0,80 Z" />
        </svg>
      </div>
    </section>
  );
}
