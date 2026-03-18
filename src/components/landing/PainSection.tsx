import { Frown, Bug, AlertTriangle, Search } from "lucide-react";

const painPoints = [
  { icon: Frown, text: "সোফায় পুরনো দাগ আর দুর্গন্ধ নিয়ে বিব্রত বোধ করছেন?", color: "bg-primary/10 text-primary" },
  { icon: Bug, text: "বাচ্চারা সোফায় বসছে কিন্তু কতটা জীবাণু আছে ভেবেছেন?", color: "bg-primary/10 text-primary" },
  { icon: AlertTriangle, text: "নিজে পরিষ্কার করতে গিয়ে সোফার কাপড় নষ্ট হয়ে গেছে?", color: "bg-primary/10 text-primary" },
  { icon: Search, text: "ভালো ক্লিনিং সার্ভিস খুঁজছেন কিন্তু বিশ্বাসযোগ্য কাউকে পাচ্ছেন না?", color: "bg-primary/10 text-primary" },
];

export default function PainSection() {
  return (
    <section className="bg-surface-grey py-16 pb-20 relative">
      <div className="container">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-foreground mb-2">
          এই সমস্যাগুলো কি <span className="text-primary">আপনারও?</span>
        </h2>
        <p className="text-center text-muted-foreground mb-10">আপনি একা নন — বেশিরভাগ পরিবারই এই সমস্যায় ভোগে</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-3xl mx-auto stagger-children">
          {painPoints.map((p, i) => (
            <div key={i} className="flex items-start gap-4 bg-background rounded-xl p-5 shadow-card hover:shadow-elevated transition-shadow duration-300 border border-border/50">
              <div className={`flex-shrink-0 w-11 h-11 rounded-xl ${p.color} flex items-center justify-center`}>
                <p.icon className="h-5 w-5" />
              </div>
              <p className="text-base text-foreground leading-relaxed">{p.text}</p>
            </div>
          ))}
        </div>
        <p className="text-center mt-10 text-lg text-muted-foreground">
          চিন্তা করবেন না — <span className="text-primary font-bold">Purexify</span> আপনার সমাধান! 👇
        </p>
      </div>

      <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none">
        <svg viewBox="0 0 1440 80" className="relative block w-full h-12">
          <path fill="hsl(var(--background))" d="M0,40 C360,80 720,0 1440,40 L1440,80 L0,80 Z" />
        </svg>
      </div>
    </section>
  );
}
