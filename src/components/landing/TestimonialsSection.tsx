import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Star, Quote, ChevronLeft, ChevronRight } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

export default function TestimonialsSection() {
  const isMobile = useIsMobile();
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
  const [currentPage, setCurrentPage] = useState(0);

  const filtered = testimonials
    ? activeCategory === "সবগুলো"
      ? testimonials
      : testimonials.filter((t: any) => (t.category || "general") === activeCategory)
    : [];

  const itemsPerPage = isMobile ? 1 : 3;
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const currentItems = filtered.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);

  // Reset page when category changes
  useEffect(() => { setCurrentPage(0); }, [activeCategory]);

  // Auto-slide
  useEffect(() => {
    if (totalPages <= 1) return;
    const timer = setInterval(() => {
      setCurrentPage((p) => (p + 1) % totalPages);
    }, 5000);
    return () => clearInterval(timer);
  }, [totalPages]);

  const categoryLabelMap: Record<string, string> = {
    general: "সাধারণ",
    sofa: "সোফা",
    carpet: "কার্পেট",
    mattress: "ম্যাট্রেস",
    car: "গাড়ি",
    office: "অফিস",
  };

  if (!testimonials || testimonials.length === 0) return null;

  return (
    <section id="testimonials" className="bg-muted/40 py-16 md:py-24 relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle, hsl(var(--foreground)) 1px, transparent 1px)", backgroundSize: "32px 32px" }} />

      <div className="container relative z-10 px-4">
        {/* Header */}
        <div className="text-center mb-10 md:mb-14">
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-extrabold text-foreground leading-tight">
            গ্রাহকদের <span className="gradient-text font-extrabold">মতামত</span>
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground mt-2">বাস্তব গ্রাহকদের বাস্তব রিভিউ</p>
        </div>

        {/* Category filters */}
        {categories.length > 2 && (
          <div className="flex flex-wrap justify-center gap-2 mb-8 md:mb-10">
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

        {/* Testimonial cards */}
        <div className="relative max-w-6xl mx-auto">
          {/* Navigation arrows - desktop */}
          {totalPages > 1 && (
            <>
              <button
                onClick={() => setCurrentPage((p) => (p - 1 + totalPages) % totalPages)}
                className="hidden md:flex absolute -left-12 top-1/2 -translate-y-1/2 w-10 h-10 items-center justify-center rounded-full bg-card border border-border shadow-sm hover:shadow-md hover:border-primary/40 transition-all z-20"
              >
                <ChevronLeft className="h-5 w-5 text-foreground" />
              </button>
              <button
                onClick={() => setCurrentPage((p) => (p + 1) % totalPages)}
                className="hidden md:flex absolute -right-12 top-1/2 -translate-y-1/2 w-10 h-10 items-center justify-center rounded-full bg-card border border-border shadow-sm hover:shadow-md hover:border-primary/40 transition-all z-20"
              >
                <ChevronRight className="h-5 w-5 text-foreground" />
              </button>
            </>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {currentItems.map((t) => (
              <div
                key={t.id}
                className="group relative bg-card rounded-2xl p-6 sm:p-7 border border-border/50 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-500"
              >
                {/* Quote icon */}
                <div className="absolute top-5 right-5">
                  <Quote className="h-8 w-8 text-primary/15 group-hover:text-primary/25 transition-colors duration-300" />
                </div>

                {/* Stars */}
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star
                      key={j}
                      className={`h-4 w-4 ${j < t.rating ? "text-accent fill-accent" : "text-muted-foreground/20"}`}
                    />
                  ))}
                </div>

                {/* Review text */}
                <p className="text-sm sm:text-[15px] text-foreground/80 leading-relaxed mb-6 line-clamp-4">
                  "{t.review}"
                </p>

                {/* Customer info */}
                <div className="flex items-center gap-3 pt-4 border-t border-border/40">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0 shadow-md">
                    <span className="text-sm font-bold text-primary-foreground">
                      {t.customer_name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-bold text-sm text-foreground">{t.customer_name}</p>
                    <p className="text-xs text-muted-foreground">{t.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pagination dots */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-8 md:mt-10">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i)}
                className={`rounded-full transition-all duration-300 ${
                  currentPage === i
                    ? "w-8 h-2.5 bg-primary"
                    : "w-2.5 h-2.5 bg-muted-foreground/25 hover:bg-muted-foreground/40"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
