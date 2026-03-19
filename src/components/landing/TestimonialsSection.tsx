import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Star } from "lucide-react";

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

  if (!testimonials || testimonials.length === 0) return null;

  return (
    <section className="bg-[hsl(var(--surface-grey))] py-20 relative">
      <div className="container">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-4xl font-extrabold text-foreground mb-2">
            গ্রাহকদের <span className="gradient-text font-extrabold">মতামত</span>
          </h2>
          <p className="text-muted-foreground">বাস্তব গ্রাহকদের বাস্তব রিভিউ</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto stagger-children">
          {testimonials.map((t) => (
            <div
              key={t.id}
              className="bg-card rounded-2xl p-6 shadow-[var(--shadow-card)] border border-border/40 hover:shadow-[var(--shadow-elevated)] hover:-translate-y-1 transition-all duration-300"
            >
              {/* Stars */}
              <div className="flex gap-0.5 mb-3">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} className="h-4 w-4 text-accent fill-accent" />
                ))}
              </div>

              <p className="text-sm text-foreground leading-relaxed mb-5">
                "{t.review}"
              </p>

              <div className="flex items-center gap-3 border-t border-border/30 pt-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
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
    </section>
  );
}
