import { Frown, Bug, AlertTriangle, Search } from "lucide-react";

const painPoints = [
  { icon: Frown, text: "সোফায় পুরনো দাগ আর দুর্গন্ধ নিয়ে বিব্রত বোধ করছেন?", gradient: "from-primary/15 to-primary/5" },
  { icon: Bug, text: "বাচ্চারা সোফায় বসছে কিন্তু কতটা জীবাণু আছে ভেবেছেন?", gradient: "from-accent/15 to-accent/5" },
  { icon: AlertTriangle, text: "নিজে পরিষ্কার করতে গিয়ে সোফার কাপড় নষ্ট হয়ে গেছে?", gradient: "from-primary/15 to-primary/5" },
  { icon: Search, text: "ভালো ক্লিনিং সার্ভিস খুঁজছেন কিন্তু বিশ্বাসযোগ্য কাউকে পাচ্ছেন না?", gradient: "from-accent/15 to-accent/5" },
];

export default function PainSection() {
  return (
    <section className="bg-surface-grey py-20 pb-24 relative">
      <div className="container">
        <h2 className="text-2xl md:text-4xl font-extrabold text-center text-foreground mb-3">
          এই সমস্যাগুলো কি <span className="gradient-text">আপনারও?</span>
        </h2>
        <p className="text-center text-muted-foreground mb-12 text-lg">আপনি একা নন — বেশিরভাগ পরিবারই এই সমস্যায় ভোগে</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-3xl mx-auto stagger-children">
          {painPoints.map((p, i) => (
            <div key={i} className="group flex items-start gap-4 bg-background rounded-2xl p-6 shadow-card hover:shadow-elevated transition-all duration-300 border border-border/40 hover:border-primary/20 hover:-translate-y-1">
              <div className={`flex-shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-br ${p.gradient} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                <p.icon className="h-5 w-5 text-primary" />
              </div>
              <p className="text-base text-foreground leading-relaxed pt-1">{p.text}</p>
            </div>
          ))}
        </div>
        <p className="text-center mt-12 text-lg text-muted-foreground">
          চিন্তা করবেন না — <span className="gradient-text font-extrabold">Purexify</span> আপনার সমাধান! 👇
        </p>
      </div>

      <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none">
        <svg viewBox="0 0 1440 80" className="relative block w-full h-12" preserveAspectRatio="none">
          <path fill="hsl(var(--background))" d="M0,40 C360,80 720,0 1440,40 L1440,80 L0,80 Z" />
        </svg>
      </div>
    </section>
  );
}
