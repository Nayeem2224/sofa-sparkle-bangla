import { Frown, Bug, AlertTriangle, Search, AlertCircle } from "lucide-react";

const painPoints = [
  { icon: Frown, text: "সোফায় পুরনো দাগ আর দুর্গন্ধ নিয়ে বিব্রত বোধ করছেন?", accent: "from-rose-500 to-pink-500", iconBg: "bg-rose-500/10", iconColor: "text-rose-500" },
  { icon: Bug, text: "বাচ্চারা সোফায় বসছে কিন্তু কতটা জীবাণু আছে ভেবেছেন?", accent: "from-amber-500 to-orange-500", iconBg: "bg-amber-500/10", iconColor: "text-amber-500" },
  { icon: AlertTriangle, text: "নিজে পরিষ্কার করতে গিয়ে সোফার কাপড় নষ্ট হয়ে গেছে?", accent: "from-violet-500 to-purple-500", iconBg: "bg-violet-500/10", iconColor: "text-violet-500" },
  { icon: Search, text: "ভালো ক্লিনিং সার্ভিস খুঁজছেন কিন্তু বিশ্বাসযোগ্য কাউকে পাচ্ছেন না?", accent: "from-sky-500 to-blue-500", iconBg: "bg-sky-500/10", iconColor: "text-sky-500" },
];

export default function PainSection() {
  return (
    <section className="bg-surface-grey py-16 md:py-24 pb-20 md:pb-28 relative">
      <div className="container px-4">
        {/* Header */}
        <div className="text-center mb-10 md:mb-14">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-primary bg-primary/10 rounded-full px-4 py-1.5 mb-4 border border-primary/10">
            <AlertCircle className="h-3.5 w-3.5" /> চিনুন আপনার সমস্যা
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-extrabold text-foreground leading-tight">
            এই সমস্যাগুলো কি <span className="gradient-text">আপনারও?</span>
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground mt-3 max-w-md mx-auto">আপনি একা নন — বেশিরভাগ পরিবারই এই সমস্যায় ভোগে</p>
        </div>

        {/* Pain cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 max-w-4xl mx-auto stagger-children">
          {painPoints.map((p, i) => (
            <div
              key={i}
              className="group relative bg-background rounded-3xl p-5 sm:p-7 border border-border/40 hover:border-transparent transition-all duration-500 hover:-translate-y-2 overflow-hidden shadow-card hover:shadow-elevated"
            >
              {/* Gradient border on hover */}
              <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${p.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 blur-[1px]`} />
              <div className="absolute inset-[1px] rounded-[calc(1.5rem-1px)] bg-background z-0" />

              <div className="relative z-10 flex items-start gap-4 sm:gap-5">
                {/* Icon container */}
                <div className={`flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-2xl ${p.iconBg} flex items-center justify-center group-hover:scale-110 transition-transform duration-500`}>
                  <p.icon className={`h-5 w-5 sm:h-6 sm:w-6 ${p.iconColor}`} />
                </div>

                {/* Text */}
                <p className="text-sm sm:text-base font-medium text-foreground leading-relaxed pt-1 sm:pt-2">{p.text}</p>
              </div>

              {/* Subtle gradient glow at bottom */}
              <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-2/3 h-16 bg-gradient-to-t ${p.accent} opacity-0 group-hover:opacity-[0.06] transition-opacity duration-500 blur-2xl`} />
            </div>
          ))}
        </div>

        {/* Bottom CTA text */}
        <div className="text-center mt-10 md:mt-14">
          <div className="inline-flex items-center gap-2 bg-background rounded-full px-6 py-3 shadow-card border border-border/40">
            <span className="text-base sm:text-lg text-muted-foreground">
              চিন্তা করবেন না — <span className="gradient-text font-extrabold">Purexify</span> আপনার সমাধান!
            </span>
            <span className="text-xl">👇</span>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none">
        <svg viewBox="0 0 1440 80" className="relative block w-full h-10 sm:h-12" preserveAspectRatio="none">
          <path fill="hsl(var(--background))" d="M0,40 C360,80 720,0 1440,40 L1440,80 L0,80 Z" />
        </svg>
      </div>
    </section>
  );
}
