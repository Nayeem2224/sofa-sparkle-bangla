import { Sparkles, Flame } from "lucide-react";

const items = [
  { icon: Sparkles, text: "মাত্র ৯৯৯ টাকায় সোফা ক্লিনিং •" },
  { icon: Flame, text: "সীমিত স্লট — আজই বুক করুন" },
  { icon: Sparkles, text: "স্পেশাল অফার! মাত্র ৯৯৯ টাকায় সোফা ক্লিনিং •" },
  { icon: Flame, text: "সীমিত স্লট — আজই বুক করুন" },
];

export default function MarqueeBanner() {
  const content = (
    <>
      {items.map((item, i) => (
        <span key={i} className="inline-flex items-center gap-1.5 mx-6 whitespace-nowrap">
          <item.icon className="h-3.5 w-3.5 flex-shrink-0" />
          <span>{item.text}</span>
        </span>
      ))}
    </>
  );

  return (
    <div className="bg-primary text-primary-foreground text-xs font-semibold overflow-hidden py-1.5 select-none">
      <div className="flex animate-marquee">
        {content}
        {content}
        {content}
      </div>
    </div>
  );
}
