import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Star, Quote } from "lucide-react";

export default function TestimonialsSection() {
  const { data: testimonials } = useQuery({
    queryKey: ["public-testimonials"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("testimonials")
        .select("*")
        .eq("is_active", true)
        .order("sort_order");
      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });

  // Get unique categories
  const categories = testimonials
    ? ["সবগুলো", ...new Set(testimonials.map((t: any) => t.category || "general"))]
    : ["সবগুলো"];

  const [activeCategory, setActiveCategory] = useState("সবগুলো");

  const filtered = testimonials
    ? activeCategory === "সবগুলো"
      ? testimonials
      : testimonials.filter((t: any) => (t.category || "general") === activeCategory)
    : [];

  const categoryLabelMap: Record<string, string> = {
    general: "সাধারণ",
    sofa: "সোফা",
    carpet: "কার্পেট",
    mattress: "ম্যাট্রেস",
    car: "গাড়ি",
    office: "অফিস",
  };

  if (!testimonials || testimonials.length === 0) return null;

  // Split into two rows for the dual-direction scroll
  const midpoint = Math.ceil(filtered.length / 2);
  const rowA = filtered.slice(0, midpoint);
  const rowB = filtered.slice(midpoint).length > 0 ? filtered.slice(midpoint) : filtered;

  // Duplicate each row for seamless infinite loop
  const loopA = [...rowA, ...rowA];
  const loopB = [...rowB, ...rowB];

  // Speed scales with item count so it feels consistent
  const durationA = Math.max(30, rowA.length * 8);
  const durationB = Math.max(30, rowB.length * 8);

  const renderCard = (t: any, idx: number) => (
    <div
      key={`${t.id}-${idx}`}
      className="group relative bg-card rounded-2xl p-6 sm:p-7 border border-border/50 shadow-sm hover:shadow-xl hover:-translate-y-1.5 hover:border-primary/40 transition-all duration-500 w-[280px] sm:w-[340px] md:w-[380px] flex-shrink-0"
    >
      <div className="absolute top-5 right-5">
        <Quote className="h-8 w-8 text-primary/15 group-hover:text-primary/30 transition-colors duration-300" />
      </div>

      <div className="flex gap-0.5 mb-4">
        {Array.from({ length: 5 }).map((_, j) => (
          <Star
            key={j}
            className={`h-4 w-4 ${j < t.rating ? "text-accent fill-accent" : "text-muted-foreground/20"}`}
          />
        ))}
      </div>

      <p className="text-sm sm:text-[15px] text-foreground/80 leading-relaxed mb-6 line-clamp-4 min-h-[80px]">
        "{t.review}"
      </p>

      <div className="flex items-center gap-3 pt-4 border-t border-border/40">
        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0 shadow-md">
          <span className="text-sm font-bold text-primary-foreground">
            {t.customer_name.charAt(0)}
          </span>
        </div>
        <div className="min-w-0">
          <p className="font-bold text-sm text-foreground truncate">{t.customer_name}</p>
          <p className="text-xs text-muted-foreground truncate">{t.location}</p>
        </div>
      </div>
    </div>
  );

  return (
    <section id="testimonials" className="bg-muted/40 py-16 md:py-24 relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle, hsl(var(--foreground)) 1px, transparent 1px)", backgroundSize: "32px 32px" }} />

      <div className="relative z-10">
        {/* Header */}
        <div className="container px-4 text-center mb-10 md:mb-14">
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-extrabold text-foreground leading-tight">
            গ্রাহকদের <span className="gradient-text font-extrabold">মতামত</span>
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground mt-2">বাস্তব গ্রাহকদের বাস্তব রিভিউ</p>
        </div>

        {/* Category filters */}
        {categories.length > 2 && (
          <div className="container px-4 flex flex-wrap justify-center gap-2 mb-8 md:mb-10">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold border transition-all duration-300 ${
                  activeCategory === cat
                    ? "bg-primary text-primary-foreground border-primary shadow-md"
                    : "bg-card text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
                }`}
              >
                {cat === "সবগুলো" ? cat : categoryLabelMap[cat] || cat}
              </button>
            ))}
          </div>
        )}

        {/* Dual-row continuously scrolling reviews */}
        <div className="space-y-4 sm:space-y-6">
          {/* Row 1 — scrolls right to left */}
          <div className="review-fade-mask overflow-hidden py-2">
            <div
              key={`a-${activeCategory}`}
              className="flex w-max gap-4 sm:gap-6 animate-review-scroll"
              style={{ animationDuration: `${durationA}s` }}
            >
              {loopA.map((t: any, idx: number) => renderCard(t, idx))}
            </div>
          </div>

          {/* Row 2 — scrolls left to right */}
          <div className="review-fade-mask overflow-hidden py-2">
            <div
              key={`b-${activeCategory}`}
              className="flex w-max gap-4 sm:gap-6 animate-review-scroll-reverse"
              style={{ animationDuration: `${durationB}s` }}
            >
              {loopB.map((t: any, idx: number) => renderCard(t, idx))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
